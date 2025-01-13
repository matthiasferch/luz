import { Serializable, Serialize } from '@luz/utilities/serializable'
import { VertexArray } from '../types/vertex-array'
import { Mesh } from '../types/mesh'

export class Partition extends Serializable<Partition> {
  @Serialize()
  readonly topology: VertexArray.Topology = 'Triangles'

  @Serialize()
  readonly vertices: number[] = []

  @Serialize()
  readonly indices: number[] = []

  @Serialize()
  readonly material: string

  mesh?: Mesh
}
