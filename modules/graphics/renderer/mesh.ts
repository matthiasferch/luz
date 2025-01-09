import { Serializable, Serialize } from '@luz/utilities/serializable'
import { VertexArray } from '../types/vertex-array'
import { Material } from './material'

export class Mesh extends Serializable {
  @Serialize()
  readonly topology: Mesh.Topology

  @Serialize()
  readonly vertices: number[]

  @Serialize()
  readonly indices: number[]

  @Serialize()
  material?: Material | string

  vertexArray: VertexArray | null = null

  constructor({ topology = 'triangles', vertices = [], indices = [], material }: Partial<Mesh> = {}) {
    super()

    this.topology = topology
    this.vertices = vertices
    this.indices = indices
    this.material = material
  }
}

export namespace Mesh {
  export type Topology = 'points' | 'lines' | 'lineLoop' | 'lineStrip' | 'triangles' | 'triangleFan' | 'triangleStrip'
}
