import { Serializable, Serialize } from '@luz/utilities/serializable'
import { VertexArray } from '../types/vertex-array'
import { Mesh } from '../types/mesh'
import { Weight } from './weight'

export class Partition extends Serializable {
  @Serialize()
  readonly topology: VertexArray.Topology = 'Triangles'

  @Serialize()
  readonly vertices: number[] = []

  @Serialize()
  readonly indices: number[] = []

  @Serialize()
  readonly weights: Weight[] = []

  @Serialize()
  readonly material: string

  mesh?: Mesh

  constructor(data: Partial<Partition> = {}) {
    super()

    Object.assign(this, data)
  }
}
