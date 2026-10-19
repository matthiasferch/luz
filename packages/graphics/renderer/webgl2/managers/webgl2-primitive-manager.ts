import type { PrimitiveTopology } from '@luz/formats'
import { VERTEX_FORMAT_BYTE_LENGTH } from '@luz/formats'
import type { Primitive, DrawPrimitive } from '../../../types/primitive'
import type { PrimitiveOptions } from '../../../types/primitive-options'
import type { RenderMaterial } from '../../render-material'
import type { Mesh, VertexDescriptor } from '../../mesh'
import type { VertexArray } from '../../../types/vertex-array'
import type { PrimitiveManager } from '../../render-backend'

const legacyDescriptor: VertexDescriptor = {
  byteOffset: 0,
  count: 0,
  byteStride: 8 * Float32Array.BYTES_PER_ELEMENT,
  attributes: {
    position: { format: 'float32x3', byteOffset: 0 },
    normal: { format: 'float32x3', byteOffset: 3 * Float32Array.BYTES_PER_ELEMENT },
    textureCoordinates: { format: 'float32x2', byteOffset: 6 * Float32Array.BYTES_PER_ELEMENT }
  }
}

export class WebGL2PrimitiveManager implements PrimitiveManager {
  private readonly allocations = new Map<DrawPrimitive, WebGLBuffer[]>()

  constructor(private gl: WebGL2RenderingContext) {}

  create(mesh: Mesh, material: RenderMaterial): Primitive
  create(options: PrimitiveOptions): DrawPrimitive
  create(source: Mesh | PrimitiveOptions, material?: RenderMaterial): Primitive | DrawPrimitive {
    if ('attributes' in source) {
      return this.createPrimitive(source)
    }

    if (!material) {
      throw new Error('Mesh primitives require a material')
    }

    return this.createMesh(source, material)
  }

  private createPrimitive({ topology, vertexCount, attributes }: PrimitiveOptions): DrawPrimitive {
    const locations = new Set<number>()
    const attributeCount = this.gl.getParameter(this.gl.MAX_VERTEX_ATTRIBS) as number

    if (!Number.isSafeInteger(vertexCount) || vertexCount < 0) {
      throw new Error('Primitive vertex count must be a nonnegative integer')
    }

    for (const attribute of attributes) {
      const { location, format, byteOffset = 0, byteStride = 0, divisor = 0 } = attribute
      const byteLength = VERTEX_FORMAT_BYTE_LENGTH[format]

      if (
        !Number.isInteger(location) ||
        location < 0 ||
        location >= attributeCount ||
        locations.has(location) ||
        !byteLength ||
        attribute.buffer.type !== 'vertexBuffer' ||
        !Number.isSafeInteger(byteOffset) ||
        byteOffset < 0 ||
        byteOffset % 4 !== 0 ||
        !Number.isInteger(byteStride) ||
        byteStride < 0 ||
        byteStride > 255 ||
        byteStride % 4 !== 0 ||
        (byteStride !== 0 && byteStride < byteLength) ||
        !Number.isSafeInteger(divisor) ||
        divisor < 0
      ) {
        throw new Error('Invalid primitive vertex attribute')
      }

      locations.add(location)
    }

    const vertexArray = this.gl.createVertexArray() as VertexArray | null

    if (!vertexArray) {
      throw new Error('Unable to allocate primitive vertex array')
    }

    try {
      vertexArray.topology = topology
      vertexArray.vertexCount = vertexCount
      vertexArray.indexCount = 0
      vertexArray.indexType = this.gl.UNSIGNED_SHORT

      this.gl.bindVertexArray(vertexArray)

      for (const { buffer, location, format, byteOffset = 0, byteStride = 0, divisor = 0 } of attributes) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
        this.gl.enableVertexAttribArray(location)
        this.gl.vertexAttribPointer(
          location,
          VERTEX_FORMAT_BYTE_LENGTH[format] / 4,
          this.gl.FLOAT,
          false,
          byteStride,
          byteOffset
        )
        this.gl.vertexAttribDivisor(location, divisor)
      }

      const primitive = { vertexArray }

      this.allocations.set(primitive, [])

      return primitive
    } catch (error) {
      this.gl.deleteVertexArray(vertexArray)

      throw error
    } finally {
      this.gl.bindVertexArray(null)
    }
  }

  private createMesh(mesh: Mesh, material: RenderMaterial): Primitive {
    if (!mesh.topology) {
      throw new Error('Mesh has no topology')
    }

    if (!mesh.resolvedGeometry && (!Array.isArray(mesh.vertices) || mesh.vertices.length === 0)) {
      throw new Error('Mesh has no vertices')
    }

    const vertices = mesh.resolvedGeometry?.vertices ?? new Float32Array(mesh.vertices as number[])
    const descriptor = mesh.resolvedGeometry?.descriptor ?? {
      ...legacyDescriptor,
      count: vertices.length / 8
    }

    const vertexArray = this.gl.createVertexArray() as VertexArray | null

    if (!vertexArray) {
      throw new Error('Unable to allocate primitive vertex array')
    }

    const buffers: WebGLBuffer[] = []
    const createBuffer = (): WebGLBuffer => {
      const buffer = this.gl.createBuffer()

      if (!buffer) {
        throw new Error('Unable to allocate primitive buffer')
      }

      buffers.push(buffer)

      return buffer
    }

    try {
      vertexArray.topology = mesh.topology
      vertexArray.vertexCount = descriptor.count

      const vertexBuffer = createBuffer()

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)
      this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW)

      const indices = mesh.resolvedGeometry?.indices ?? this.createLegacyIndices(mesh)
      const { tangents, bitangents } = computeTangentsAndBitangents(vertices, descriptor, indices, mesh.topology)

      let tangentBuffer: WebGLBuffer | null = null

      if (!descriptor.attributes.tangent) {
        tangentBuffer = createBuffer()

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tangentBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, tangents, this.gl.STATIC_DRAW)
      }

      const bitangentBuffer = createBuffer()

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bitangentBuffer)
      this.gl.bufferData(this.gl.ARRAY_BUFFER, bitangents, this.gl.STATIC_DRAW)

      let boneIndexBuffer: WebGLBuffer | null = null
      let boneWeightBuffer: WebGLBuffer | null = null

      if (mesh.weights && mesh.weights.length > 0) {
        const boneIndices = new Float32Array(vertexArray.vertexCount * 4)
        const boneWeights = new Float32Array(vertexArray.vertexCount * 4)

        mesh.weights.forEach((weight) => {
          boneIndices.set(weight.indices, weight.vertex * 4)
          boneWeights.set(weight.weights, weight.vertex * 4)
        })

        boneIndexBuffer = createBuffer()

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneIndexBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, boneIndices, this.gl.STATIC_DRAW)

        boneWeightBuffer = createBuffer()

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneWeightBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, boneWeights, this.gl.STATIC_DRAW)
      }

      let indexBuffer: WebGLBuffer | null = null

      if (indices && indices.length > 0) {
        indexBuffer = createBuffer()

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW)

        vertexArray.indexCount = indices.length
        vertexArray.indexType = indices instanceof Uint32Array ? this.gl.UNSIGNED_INT : this.gl.UNSIGNED_SHORT
      } else {
        vertexArray.indexCount = 0
        vertexArray.indexType = this.gl.UNSIGNED_SHORT
      }

      this.gl.bindVertexArray(vertexArray)
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)
      this.bindAttribute(0, descriptor.attributes.position, descriptor.byteStride)
      this.bindAttribute(1, descriptor.attributes.normal, descriptor.byteStride, [0, 0, 1])
      this.bindAttribute(2, descriptor.attributes.textureCoordinates, descriptor.byteStride, [0, 0])

      if (descriptor.attributes.tangent) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)
        this.bindAttribute(5, descriptor.attributes.tangent, descriptor.byteStride)
      } else {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tangentBuffer)
        this.gl.vertexAttribPointer(5, 3, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(5)
      }

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bitangentBuffer)
      this.gl.vertexAttribPointer(6, 3, this.gl.FLOAT, false, 0, 0)
      this.gl.enableVertexAttribArray(6)

      if (boneIndexBuffer != null && boneWeightBuffer != null) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneIndexBuffer)
        this.gl.vertexAttribPointer(3, 4, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(3)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneWeightBuffer)
        this.gl.vertexAttribPointer(4, 4, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(4)
      } else {
        this.gl.disableVertexAttribArray(3)
        this.gl.disableVertexAttribArray(4)
        this.gl.vertexAttrib4f(3, 0, 0, 0, 0)
        this.gl.vertexAttrib4f(4, 0, 0, 0, 0)
      }

      if (indexBuffer != null) {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      }

      this.gl.bindVertexArray(null)

      const minimum = mesh.boundingBox?.minimum ?? [0, 0, 0]
      const maximum = mesh.boundingBox?.maximum ?? [1, 1, 1]
      const generatedCoordinateMinimum = new Float32Array(minimum)
      const generatedCoordinateExtent = new Float32Array([
        maximum[0] - minimum[0],
        maximum[1] - minimum[1],
        maximum[2] - minimum[2]
      ])

      const primitive = { vertexArray, material, generatedCoordinateMinimum, generatedCoordinateExtent }

      this.allocations.set(primitive, buffers)

      return primitive
    } catch (error) {
      this.gl.bindVertexArray(null)
      this.gl.deleteVertexArray(vertexArray)

      for (const buffer of buffers) {
        this.gl.deleteBuffer(buffer)
      }

      throw error
    }
  }

  destroy(primitive: DrawPrimitive): void {
    const buffers = this.allocations.get(primitive)

    if (!buffers) {
      return
    }

    this.allocations.delete(primitive)
    this.gl.deleteVertexArray(primitive.vertexArray)

    primitive.vertexArray.vertexCount = 0
    primitive.vertexArray.indexCount = 0

    for (const buffer of buffers) {
      this.gl.deleteBuffer(buffer)
    }
  }

  destroyAll(): void {
    for (const primitive of this.allocations.keys()) {
      this.destroy(primitive)
    }
  }

  render(primitive: DrawPrimitive, instanceCount?: number): void {
    const { vertexArray } = primitive
    const { topology, vertexCount, indexCount } = vertexArray

    if (!vertexArray) {
      throw new Error('Primitive has no vertex array')
    }

    if (instanceCount !== undefined && (!Number.isSafeInteger(instanceCount) || instanceCount < 0)) {
      throw new Error('Primitive instance count must be a nonnegative integer')
    }

    if (instanceCount === 0 || (vertexCount === 0 && indexCount === 0)) {
      return
    }

    let mode: number

    switch (topology) {
      case 'points':
        mode = this.gl.POINTS
        break

      case 'lines':
        mode = this.gl.LINES
        break

      case 'lineLoop':
        mode = this.gl.LINE_LOOP
        break

      case 'lineStrip':
        mode = this.gl.LINE_STRIP
        break

      case 'triangles':
        mode = this.gl.TRIANGLES
        break

      case 'triangleFan':
        mode = this.gl.TRIANGLE_FAN
        break

      case 'triangleStrip':
        mode = this.gl.TRIANGLE_STRIP
        break

      default:
        throw new Error(`Invalid topology: ${topology}`)
    }

    this.gl.bindVertexArray(vertexArray)

    try {
      if (indexCount > 0) {
        if (instanceCount === undefined) {
          this.gl.drawElements(mode, indexCount, vertexArray.indexType, 0)
        } else {
          this.gl.drawElementsInstanced(mode, indexCount, vertexArray.indexType, 0, instanceCount)
        }
      } else if (instanceCount === undefined) {
        this.gl.drawArrays(mode, 0, vertexCount)
      } else {
        this.gl.drawArraysInstanced(mode, 0, vertexCount, instanceCount)
      }
    } finally {
      this.gl.bindVertexArray(null)
    }
  }

  private createLegacyIndices(mesh: Mesh): Uint16Array | Uint32Array | undefined {
    if (!Array.isArray(mesh.indices) || mesh.indices.length === 0) {
      return undefined
    }

    const maximumIndex = Math.max(...mesh.indices)

    return maximumIndex <= 0xffff ? new Uint16Array(mesh.indices) : new Uint32Array(mesh.indices)
  }

  private bindAttribute(
    location: number,
    attribute: { format: string; byteOffset: number } | undefined,
    stride: number,
    fallback?: number[]
  ): void {
    if (!attribute) {
      this.gl.disableVertexAttribArray(location)

      if (fallback?.length === 2) {
        this.gl.vertexAttrib2f(location, fallback[0], fallback[1])
      }

      if (fallback?.length === 3) {
        this.gl.vertexAttrib3f(location, fallback[0], fallback[1], fallback[2])
      }

      return
    }

    const size = attribute.format === 'float32x2' ? 2 : attribute.format === 'float32x3' ? 3 : 4

    this.gl.enableVertexAttribArray(location)
    this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, stride, attribute.byteOffset)
  }
}

// Accumulate tangents in double precision until GPU upload.
class TangentVector {
  constructor(
    public x = 0,
    public y = 0,
    public z = 0
  ) {}

  set(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z

    return this
  }

  add(vector: TangentVector) {
    this.x += vector.x
    this.y += vector.y
    this.z += vector.z

    return this
  }

  subtract(firstVector: TangentVector, secondVector: TangentVector) {
    this.x = firstVector.x - secondVector.x
    this.y = firstVector.y - secondVector.y
    this.z = firstVector.z - secondVector.z

    return this
  }

  scale(scalar: number) {
    this.x *= scalar
    this.y *= scalar
    this.z *= scalar

    return this
  }

  calculateDotProduct(vector: TangentVector) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z
  }

  calculateCrossProduct(firstVector: TangentVector, secondVector: TangentVector) {
    const x = firstVector.y * secondVector.z - firstVector.z * secondVector.y
    const y = firstVector.z * secondVector.x - firstVector.x * secondVector.z
    const z = firstVector.x * secondVector.y - firstVector.y * secondVector.x

    this.x = x
    this.y = y
    this.z = z

    return this
  }

  calculateLength() {
    return Math.hypot(this.x, this.y, this.z)
  }

  normalize() {
    const magnitude = this.calculateLength()

    if (magnitude > 1e-8) {
      this.x /= magnitude
      this.y /= magnitude
      this.z /= magnitude
    }

    return this
  }

  copyFrom(vector: TangentVector) {
    this.x = vector.x
    this.y = vector.y
    this.z = vector.z

    return this
  }
}

class _Vector2 {
  constructor(
    public x = 0,
    public y = 0
  ) {}

  set(x: number, y: number) {
    this.x = x
    this.y = y

    return this
  }

  subtract(firstVector: _Vector2, secondVector: _Vector2) {
    this.x = firstVector.x - secondVector.x
    this.y = firstVector.y - secondVector.y

    return this
  }
}

function computeTangentsAndBitangents(
  vertices: Float32Array,
  descriptor: VertexDescriptor,
  indices: Uint16Array | Uint32Array | undefined,
  topology: PrimitiveTopology
): { tangents: Float32Array; bitangents: Float32Array } {
  const count = descriptor.count
  const stride = descriptor.byteStride / 4
  const positionOffset = descriptor.attributes.position.byteOffset / 4
  const normalOffset =
    descriptor.attributes.normal?.byteOffset !== undefined ? descriptor.attributes.normal.byteOffset / 4 : -1
  const textureCoordinateOffset =
    descriptor.attributes.textureCoordinates?.byteOffset !== undefined
      ? descriptor.attributes.textureCoordinates.byteOffset / 4
      : -1
  const tangentOffset =
    descriptor.attributes.tangent?.byteOffset !== undefined ? descriptor.attributes.tangent.byteOffset / 4 : -1

  const tangentAccumulator = new Array<TangentVector>(count)
  const bitangentAccumulator = new Array<TangentVector>(count)
  const normals = new Array<TangentVector>(count)

  for (let vertexIndex = 0; vertexIndex < count; vertexIndex++) {
    tangentAccumulator[vertexIndex] = new TangentVector()
    bitangentAccumulator[vertexIndex] = new TangentVector()

    const normal = new TangentVector(
      normalOffset >= 0 ? vertices[vertexIndex * stride + normalOffset] : 0,
      normalOffset >= 0 ? vertices[vertexIndex * stride + normalOffset + 1] : 0,
      normalOffset >= 0 ? vertices[vertexIndex * stride + normalOffset + 2] : 1
    )

    normals[vertexIndex] = normal
  }

  const firstPosition = new TangentVector(),
    secondPosition = new TangentVector(),
    thirdPosition = new TangentVector()
  const firstTextureCoordinate = new _Vector2(),
    secondTextureCoordinate = new _Vector2(),
    thirdTextureCoordinate = new _Vector2()
  const firstPositionDifference = new TangentVector(),
    secondPositionDifference = new TangentVector()
  const firstTextureDifference = new _Vector2(),
    secondTextureDifference = new _Vector2()

  const addTriangle = (firstIndex: number, secondIndex: number, thirdIndex: number) => {
    firstPosition.set(
      vertices[firstIndex * stride + positionOffset],
      vertices[firstIndex * stride + positionOffset + 1],
      vertices[firstIndex * stride + positionOffset + 2]
    )
    secondPosition.set(
      vertices[secondIndex * stride + positionOffset],
      vertices[secondIndex * stride + positionOffset + 1],
      vertices[secondIndex * stride + positionOffset + 2]
    )
    thirdPosition.set(
      vertices[thirdIndex * stride + positionOffset],
      vertices[thirdIndex * stride + positionOffset + 1],
      vertices[thirdIndex * stride + positionOffset + 2]
    )
    firstTextureCoordinate.set(
      textureCoordinateOffset >= 0 ? vertices[firstIndex * stride + textureCoordinateOffset] : 0,
      textureCoordinateOffset >= 0 ? vertices[firstIndex * stride + textureCoordinateOffset + 1] : 0
    )
    secondTextureCoordinate.set(
      textureCoordinateOffset >= 0 ? vertices[secondIndex * stride + textureCoordinateOffset] : 0,
      textureCoordinateOffset >= 0 ? vertices[secondIndex * stride + textureCoordinateOffset + 1] : 0
    )
    thirdTextureCoordinate.set(
      textureCoordinateOffset >= 0 ? vertices[thirdIndex * stride + textureCoordinateOffset] : 0,
      textureCoordinateOffset >= 0 ? vertices[thirdIndex * stride + textureCoordinateOffset + 1] : 0
    )
    firstPositionDifference.subtract(secondPosition, firstPosition)
    secondPositionDifference.subtract(thirdPosition, firstPosition)
    firstTextureDifference.subtract(secondTextureCoordinate, firstTextureCoordinate)
    secondTextureDifference.subtract(thirdTextureCoordinate, firstTextureCoordinate)

    const determinant =
      firstTextureDifference.x * secondTextureDifference.y - firstTextureDifference.y * secondTextureDifference.x

    if (Math.abs(determinant) < 1e-8) {
      return
    }

    const inverseDeterminant = 1.0 / determinant

    const tangent = new TangentVector(
      (firstPositionDifference.x * secondTextureDifference.y - secondPositionDifference.x * firstTextureDifference.y) *
        inverseDeterminant,
      (firstPositionDifference.y * secondTextureDifference.y - secondPositionDifference.y * firstTextureDifference.y) *
        inverseDeterminant,
      (firstPositionDifference.z * secondTextureDifference.y - secondPositionDifference.z * firstTextureDifference.y) *
        inverseDeterminant
    )

    const bitangent = new TangentVector(
      (secondPositionDifference.x * firstTextureDifference.x - firstPositionDifference.x * secondTextureDifference.x) *
        inverseDeterminant,
      (secondPositionDifference.y * firstTextureDifference.x - firstPositionDifference.y * secondTextureDifference.x) *
        inverseDeterminant,
      (secondPositionDifference.z * firstTextureDifference.x - firstPositionDifference.z * secondTextureDifference.x) *
        inverseDeterminant
    )

    tangentAccumulator[firstIndex].add(tangent)
    tangentAccumulator[secondIndex].add(tangent)
    tangentAccumulator[thirdIndex].add(tangent)
    bitangentAccumulator[firstIndex].add(bitangent)
    bitangentAccumulator[secondIndex].add(bitangent)
    bitangentAccumulator[thirdIndex].add(bitangent)
  }

  if (indices) {
    for (let triangleIndex = 0; triangleIndex + 2 < indices.length; triangleIndex += 3) {
      addTriangle(indices[triangleIndex]!, indices[triangleIndex + 1]!, indices[triangleIndex + 2]!)
    }
  } else if (topology === 'triangles') {
    for (let triangleIndex = 0; triangleIndex + 2 < count; triangleIndex += 3) {
      addTriangle(triangleIndex, triangleIndex + 1, triangleIndex + 2)
    }
  }

  const tangents = new Float32Array(count * 3)
  const bitangents = new Float32Array(count * 3)

  const temporaryVector = new TangentVector(),
    normalCrossTangent = new TangentVector()

  for (let vertexIndex = 0; vertexIndex < count; vertexIndex++) {
    const normal = normals[vertexIndex]
    const tangent =
      tangentOffset >= 0
        ? temporaryVector.set(
            vertices[vertexIndex * stride + tangentOffset],
            vertices[vertexIndex * stride + tangentOffset + 1],
            vertices[vertexIndex * stride + tangentOffset + 2]
          )
        : temporaryVector.copyFrom(tangentAccumulator[vertexIndex])
    const normalDotTangent = normal.calculateDotProduct(tangent)

    tangent.x -= normal.x * normalDotTangent
    tangent.y -= normal.y * normalDotTangent
    tangent.z -= normal.z * normalDotTangent

    if (tangent.calculateLength() > 1e-8) {
      tangent.normalize()
    } else {
      tangent.set(1, 0, 0)
    }

    normalCrossTangent.calculateCrossProduct(normal, tangent)

    const handedness =
      tangentOffset >= 0
        ? vertices[vertexIndex * stride + tangentOffset + 3] < 0
          ? -1
          : 1
        : normalCrossTangent.x * bitangentAccumulator[vertexIndex].x +
              normalCrossTangent.y * bitangentAccumulator[vertexIndex].y +
              normalCrossTangent.z * bitangentAccumulator[vertexIndex].z <
            0
          ? -1
          : 1
    const bitangent = new TangentVector(
      normalCrossTangent.x * handedness,
      normalCrossTangent.y * handedness,
      normalCrossTangent.z * handedness
    ).normalize()

    tangents[vertexIndex * 3 + 0] = tangent.x
    tangents[vertexIndex * 3 + 1] = tangent.y
    tangents[vertexIndex * 3 + 2] = tangent.z
    bitangents[vertexIndex * 3 + 0] = bitangent.x
    bitangents[vertexIndex * 3 + 1] = bitangent.y
    bitangents[vertexIndex * 3 + 2] = bitangent.z
  }

  return { tangents, bitangents }
}
