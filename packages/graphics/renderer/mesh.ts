import { Serializable, Serialize } from '@luz/serialization'
import { BoundingBoxDefinition, PrimitiveTopology } from '@luz/formats'
import type { BoneWeight, IndexDescriptor, MeshDefinition, VertexDescriptor } from '@luz/formats'

export type {
  IndexDescriptor,
  IndexFormat,
  BoundingBoxDefinition,
  AttributeDescriptor,
  VertexDescriptor,
  VertexFormat
} from '@luz/formats'

export interface ResolvedMeshGeometry {
  vertices: Float32Array
  indices?: Uint16Array | Uint32Array
  descriptor: VertexDescriptor
}

export interface MeshOptions extends Omit<Partial<MeshDefinition>, 'vertices' | 'indices' | 'weights'> {
  vertices?: readonly number[] | VertexDescriptor
  indices?: readonly number[] | IndexDescriptor
  weights?: readonly BoneWeight[]
  resolvedGeometry?: ResolvedMeshGeometry
}

export class Mesh extends Serializable {
  @Serialize()
  readonly topology: PrimitiveTopology = 'triangles'

  @Serialize()
  readonly vertices: readonly number[] | VertexDescriptor = []

  @Serialize()
  readonly indices: readonly number[] | IndexDescriptor = []

  @Serialize()
  readonly boundingBox?: BoundingBoxDefinition

  @Serialize()
  readonly weights: readonly BoneWeight[] = []

  @Serialize()
  readonly material!: string

  resolvedGeometry?: ResolvedMeshGeometry

  private revision = 0

  get geometryRevision(): number {
    return this.revision
  }

  // Geometry buffers are borrowed. Invalidate after edits before recompiling or reading cached bounding boxes.
  invalidateGeometry(): void {
    this.revision += 1
  }

  constructor(options: MeshOptions = {}) {
    super()

    this.topology = options.topology ?? 'triangles'
    this.vertices = options.vertices ?? []
    this.indices = options.indices ?? []
    this.boundingBox = options.boundingBox
    this.weights = options.weights ?? []
    this.resolvedGeometry = options.resolvedGeometry

    if (options.material !== undefined) {
      this.material = options.material
    }
  }

  static async deserialize(data: unknown): Promise<Mesh> {
    return (await super.deserialize(data)) as Mesh
  }
}
