import { VertexArray } from '../types/vertex-array'

export interface Mesh {
  topology: Mesh.Topology
  vertexArray: VertexArray
}

export module Mesh {
  export enum Topology {
    Points,

    Lines,
    LineLoop,
    LineStrip,

    Triangles,
    TriangleFan,
    TriangleStrip
  }
}