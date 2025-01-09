import { Serializable, Serialize } from '@luz/utilities/serializable'
import { VertexArray } from '../types/vertex-array'
import { Material } from './material'

export class Mesh extends Serializable {
  @Serialize()
  readonly topology: Mesh.Topology = 'triangles'

  @Serialize()
  readonly vertices: number[] = []

  @Serialize()
  readonly indices: number[] = []

  @Serialize()
  material?: Material | string

  vertexArray: VertexArray | null = null

  constructor(data: Partial<Mesh> = {}) {
    super()

    Object.assign(this, data)
  }
}

export namespace Mesh {
  export type Topology = 'points' | 'lines' | 'lineLoop' | 'lineStrip' | 'triangles' | 'triangleFan' | 'triangleStrip'
}
