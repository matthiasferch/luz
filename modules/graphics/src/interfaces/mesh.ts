import { VertexArray } from '../types/vertex-array'

export class Mesh {

  constructor(
    readonly topology: Mesh.Topology,
    readonly vertexArray: VertexArray
  ) {}

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