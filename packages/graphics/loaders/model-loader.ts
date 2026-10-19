import { readDefinition } from '@luz/serialization'
import { Model } from '../model'
import { SkeletalAnimation } from '../renderer/skeletal-animation'
import {
  GEOMETRY_HEADER_LENGTH,
  GEOMETRY_MAGIC,
  GEOMETRY_MAJOR_VERSION,
  GEOMETRY_MINOR_VERSION,
  VERTEX_FORMAT_BYTE_LENGTH,
  type SkeletalDocument,
  type IndexDescriptor,
  type VertexDescriptor,
  type VertexFormat
} from '@luz/formats'
import type { ResolvedMeshGeometry } from '../renderer/mesh'

export type { GeometryReference } from '@luz/formats'

export type JsonReader = (url: string) => Promise<unknown>
export type BinaryLoader = (url: string) => Promise<ArrayBuffer>

export interface ModelIdentity {
  url: string
  fingerprint: string
}

interface ModelSource {
  data: Record<string, unknown>
  animations: Record<string, SkeletalDocument>
  geometryBuffer?: ArrayBuffer
  fingerprint: string
}

export class ModelLoader {
  private generation = 0
  private animationSources = new Map<string, Promise<SkeletalDocument>>()

  private readonly sources = new Map<string, { generation: number; source: Promise<ModelSource> }>()
  private readonly identities = new WeakMap<Model, ModelIdentity>()

  constructor(
    private readonly loadJson: JsonReader = async (url) => {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to load model '${url}': ${response.status}`)
      }

      return response.json()
    },
    private readonly loadBinary: BinaryLoader = async (url) => {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to load geometry '${url}': ${response.status}`)
      }

      return response.arrayBuffer()
    }
  ) {}

  beginReload(): void {
    this.generation += 1
    this.animationSources = new Map()
  }

  findAssetIdentity(model: Model): ModelIdentity | undefined {
    return this.identities.get(model)
  }

  async load(modelUrl: string): Promise<Model> {
    const absoluteUrl = this.resolveAbsoluteUrl(modelUrl)

    let cachedSource = this.sources.get(absoluteUrl)

    if (!cachedSource || cachedSource.generation !== this.generation) {
      const source = this.loadSource(modelUrl, absoluteUrl)

      cachedSource = { generation: this.generation, source }

      this.sources.set(absoluteUrl, cachedSource)
      source.catch(() => {
        if (this.sources.get(absoluteUrl)?.source === source) {
          this.sources.delete(absoluteUrl)
        }
      })
    }

    return this.instantiate(await cachedSource.source, absoluteUrl)
  }

  async loadData(data: unknown, modelUrl: string): Promise<Model> {
    const absoluteUrl = this.resolveAbsoluteUrl(modelUrl)

    return this.instantiate(await this.createSource(data, absoluteUrl), absoluteUrl)
  }

  private async loadSource(modelUrl: string, absoluteUrl: string): Promise<ModelSource> {
    const animationSources = this.animationSources

    return this.createSource(await this.loadJson(modelUrl), absoluteUrl, animationSources)
  }

  private async createSource(
    value: unknown,
    modelUrl: string,
    animationSources = this.animationSources
  ): Promise<ModelSource> {
    const data = readDefinition(value, `Model '${modelUrl}'`)

    try {
      Model.validateAnimationReferences(data.animations)
    } catch (error) {
      throw new Error(`Model '${modelUrl}': ${error instanceof Error ? error.message : String(error)}`)
    }

    const animations = Object.fromEntries(
      await Promise.all(
        Object.entries(data.animations ?? {}).map(async ([name, reference]) => {
          let animationUrl = String(reference)

          try {
            animationUrl = new URL(String(reference), modelUrl).toString()

            const animation = await this.loadAnimation(animationUrl, animationSources)

            return [name, animation] as const
          } catch (error) {
            throw new Error(
              `Model '${modelUrl}', animation '${name}' ('${animationUrl}'): ${error instanceof Error ? error.message : String(error)}`
            )
          }
        })
      )
    )
    const geometry =
      data.geometry === undefined ? undefined : readDefinition(data.geometry, `Geometry reference in '${modelUrl}'`)

    let geometryBuffer: ArrayBuffer | undefined

    if (geometry) {
      if (
        typeof geometry.uri !== 'string' ||
        !geometry.uri ||
        typeof geometry.byteLength !== 'number' ||
        !Number.isInteger(geometry.byteLength) ||
        geometry.byteLength < GEOMETRY_HEADER_LENGTH
      ) {
        throw new Error(`Model '${modelUrl}' has an invalid geometry reference`)
      }

      const geometryUrl = new URL(geometry.uri, modelUrl).toString()

      geometryBuffer = await this.loadBinary(geometryUrl)

      this.validateHeader(geometryBuffer, geometry.byteLength, geometryUrl)
    } else {
      for (const [name, value] of Object.entries(
        data.meshes === undefined ? {} : readDefinition(data.meshes, 'Model meshes')
      )) {
        const mesh = readDefinition(value, `Mesh '${name}'`)

        if (!Array.isArray(mesh.vertices)) {
          throw new Error(`Mesh '${name}' uses binary descriptors but the model has no geometry reference`)
        }
      }
    }

    return {
      data,
      animations,
      geometryBuffer,
      fingerprint: this.calculateFingerprint({ model: data, animations }, geometryBuffer)
    }
  }

  private loadAnimation(url: string, sources: Map<string, Promise<SkeletalDocument>>): Promise<SkeletalDocument> {
    let source = sources.get(url)

    if (!source) {
      source = this.loadAnimationDocument(url)

      sources.set(url, source)
      source.catch(() => {
        if (sources.get(url) === source) {
          sources.delete(url)
        }
      })
    }

    return source
  }

  private async loadAnimationDocument(url: string): Promise<SkeletalDocument> {
    const data = await this.loadJson(url)

    await SkeletalAnimation.deserialize(data)

    return data as SkeletalDocument
  }

  private async instantiate(source: ModelSource, modelUrl: string): Promise<Model> {
    const data = structuredClone(source.data)

    const geometries: Record<string, ResolvedMeshGeometry> = {}

    if (source.geometryBuffer) {
      for (const [name, value] of Object.entries(
        data.meshes === undefined ? {} : readDefinition(data.meshes, 'Model meshes')
      )) {
        const mesh = readDefinition(value, `Mesh '${name}'`)

        if (!Array.isArray(mesh.vertices)) {
          geometries[name] = this.resolveMesh(source.geometryBuffer, mesh, name)
        }
      }
    }

    let model: Model

    try {
      model = await Model.deserialize(data, source.animations)
    } catch (error) {
      throw new Error(`Model '${modelUrl}': ${error instanceof Error ? error.message : String(error)}`)
    }

    for (const [name, geometry] of Object.entries(geometries)) {
      model.meshes[name].resolvedGeometry = geometry
    }

    this.identities.set(model, { url: modelUrl, fingerprint: source.fingerprint })

    return model
  }

  private calculateFingerprint(data: unknown, geometryBuffer?: ArrayBuffer): string {
    let hash = 2166136261

    const update = (value: number) => {
      hash ^= value
      hash = Math.imul(hash, 16777619)
    }
    const json = JSON.stringify(data)

    for (let index = 0; index < json.length; index++) {
      update(json.charCodeAt(index))
    }

    if (geometryBuffer) {
      for (const value of new Uint8Array(geometryBuffer)) {
        update(value)
      }
    }

    return (hash >>> 0).toString(16).padStart(8, '0')
  }

  private validateHeader(buffer: ArrayBuffer, expectedLength: number, url: string): void {
    if (buffer.byteLength < GEOMETRY_HEADER_LENGTH) {
      throw new Error(`Geometry '${url}' is shorter than the 16-byte header`)
    }

    const bytes = new Uint8Array(buffer, 0, 4)
    const magic = String.fromCharCode(...bytes)

    if (magic !== GEOMETRY_MAGIC) {
      throw new Error(`Geometry '${url}' has invalid magic '${magic}'`)
    }

    const view = new DataView(buffer)
    const major = view.getUint16(4, true)
    const minor = view.getUint16(6, true)

    if (major !== GEOMETRY_MAJOR_VERSION || minor !== GEOMETRY_MINOR_VERSION) {
      throw new Error(`Geometry '${url}' uses unsupported version ${major}.${minor}`)
    }

    const declaredLength = view.getUint32(8, true)

    if (declaredLength !== buffer.byteLength || expectedLength !== buffer.byteLength) {
      throw new Error(
        `Geometry '${url}' length mismatch: manifest=${expectedLength}, header=${declaredLength}, actual=${buffer.byteLength}`
      )
    }

    if (view.getUint32(12, true) !== 0) {
      throw new Error(`Geometry '${url}' uses unsupported flags`)
    }
  }

  private resolveMesh(buffer: ArrayBuffer, data: unknown, name: string): ResolvedMeshGeometry {
    const mesh = readDefinition(data, `Mesh '${name}'`)
    const vertices = mesh.vertices

    this.validateVertices(vertices, buffer.byteLength, name)

    const vertexBytes = vertices.count * vertices.byteStride
    const resolvedGeometry: ResolvedMeshGeometry = {
      vertices: new Float32Array(buffer, vertices.byteOffset, vertexBytes / 4),
      descriptor: vertices
    }

    if (mesh.indices && !Array.isArray(mesh.indices)) {
      const indices = mesh.indices

      this.validateIndices(indices, buffer.byteLength, name)

      resolvedGeometry.indices =
        indices.format === 'uint16'
          ? new Uint16Array(buffer, indices.byteOffset, indices.count)
          : new Uint32Array(buffer, indices.byteOffset, indices.count)

      for (const index of resolvedGeometry.indices) {
        if (index >= vertices.count) {
          throw new Error(`Mesh '${name}' index ${index} exceeds vertex count ${vertices.count}`)
        }
      }
    }

    return resolvedGeometry
  }

  private validateVertices(value: unknown, fileLength: number, name: string): asserts value is VertexDescriptor {
    const vertices = readDefinition(value, `Vertex descriptor for '${name}'`)

    if (
      typeof vertices.byteOffset !== 'number' ||
      typeof vertices.count !== 'number' ||
      typeof vertices.byteStride !== 'number' ||
      !Number.isInteger(vertices.byteOffset) ||
      !Number.isInteger(vertices.count) ||
      !Number.isInteger(vertices.byteStride)
    ) {
      throw new Error(`Mesh '${name}' has an invalid vertex descriptor`)
    }

    if (vertices.byteOffset < GEOMETRY_HEADER_LENGTH || vertices.byteOffset % 4 !== 0) {
      throw new Error(`Mesh '${name}' vertex byteOffset must be 4-byte aligned and after the header`)
    }

    if (vertices.count < 0 || vertices.byteStride <= 0 || vertices.byteStride % 4 !== 0) {
      throw new Error(`Mesh '${name}' has an invalid vertex count or stride`)
    }

    const attributes = readDefinition(vertices.attributes, `Vertex attributes for '${name}'`)

    if (!attributes.position) {
      throw new Error(`Mesh '${name}' requires a position attribute`)
    }

    const expectedFormats: Record<string, VertexFormat> = {
      position: 'float32x3',
      normal: 'float32x3',
      textureCoordinates: 'float32x2',
      tangent: 'float32x4'
    }

    for (const [attributeName, attribute] of Object.entries(attributes)) {
      this.validateAttribute(attributeName, attribute, expectedFormats[attributeName], vertices.byteStride, name)
    }

    if (vertices.byteOffset + vertices.count * vertices.byteStride > fileLength) {
      throw new Error(`Mesh '${name}' vertex data is outside the geometry file`)
    }
  }

  private validateAttribute(
    name: string,
    value: unknown,
    expected: VertexFormat | undefined,
    stride: number,
    mesh: string
  ): void {
    const attribute = readDefinition(value, `Attribute '${name}' in '${mesh}'`)

    if (!expected || attribute.format !== expected) {
      throw new Error(`Mesh '${mesh}' attribute '${name}' has unsupported format '${attribute.format}'`)
    }

    if (
      typeof attribute.byteOffset !== 'number' ||
      !Number.isInteger(attribute.byteOffset) ||
      attribute.byteOffset < 0 ||
      attribute.byteOffset % 4 !== 0
    ) {
      throw new Error(`Mesh '${mesh}' attribute '${name}' has a misaligned byteOffset`)
    }

    if (attribute.byteOffset + VERTEX_FORMAT_BYTE_LENGTH[expected] > stride) {
      throw new Error(`Mesh '${mesh}' attribute '${name}' exceeds its vertex stride`)
    }
  }

  private validateIndices(value: unknown, fileLength: number, name: string): asserts value is IndexDescriptor {
    const indices = readDefinition(value, `Index descriptor for '${name}'`)

    const elementSize = indices.format === 'uint16' ? 2 : indices.format === 'uint32' ? 4 : 0

    if (!elementSize) {
      throw new Error(`Mesh '${name}' has unsupported index format '${indices.format}'`)
    }

    if (
      typeof indices.byteOffset !== 'number' ||
      !Number.isInteger(indices.byteOffset) ||
      indices.byteOffset < GEOMETRY_HEADER_LENGTH ||
      indices.byteOffset % 4 !== 0
    ) {
      throw new Error(`Mesh '${name}' index byteOffset must be 4-byte aligned and after the header`)
    }

    if (
      typeof indices.count !== 'number' ||
      !Number.isInteger(indices.count) ||
      indices.count < 0 ||
      indices.byteOffset + indices.count * elementSize > fileLength
    ) {
      throw new Error(`Mesh '${name}' index data is outside the geometry file`)
    }
  }

  private resolveAbsoluteUrl(url: string): string {
    const base = typeof document === 'undefined' ? 'http://localhost/' : document.baseURI

    return new URL(url, base).toString()
  }
}
