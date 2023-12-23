import { VertexArray } from '../types/vertex-array'

export class Mesh {

  constructor(
    readonly topology: Mesh.Topology,
    readonly vertexArray: VertexArray
  ) {}

}

export module Mesh {

  export enum Topology {
    Points = 'points',

    Lines = 'lines',
    LineLoop = 'line-loop',
    LineStrip = 'line-strip',

    Triangles = 'triangles',
    TriangleFan = 'triangle-fan',
    TriangleStrip = 'triangle-strip'
  }

}