import { VertexArray } from '../types/vertex-array'

export interface Mesh {
  topology: Mesh.Topology
  vertexArray: VertexArray
}

export declare module Mesh {
  export enum Topology {
    Points,
    Lines,
    Triangles
  }
}