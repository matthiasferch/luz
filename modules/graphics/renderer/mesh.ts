import { VertexArray } from '../types/vertex-array'
import { Material } from './material'

export class Mesh {
  readonly topology: Mesh.Topology
  readonly vertexArray: VertexArray

  material?: Material

  constructor({ topology, vertexArray }: { topology: Mesh.Topology; vertexArray: VertexArray }) {
    this.topology = topology
    this.vertexArray = vertexArray
  }
}

export namespace Mesh {
  export type Topology = 'points' | 'lines' | 'lineLoop' | 'lineStrip' | 'triangles' | 'triangleFan' | 'triangleStrip'
}
