import { VertexArray } from '../types/vertex-array';
export declare class Mesh {
    readonly topology: Mesh.Topology;
    readonly vertexArray: VertexArray;
    constructor(topology: Mesh.Topology, vertexArray: VertexArray);
}
export declare module Mesh {
    enum Topology {
        Points = "points",
        Lines = "lines",
        LineLoop = "line-loop",
        LineStrip = "line-strip",
        Triangles = "triangles",
        TriangleFan = "triangle-fan",
        TriangleStrip = "triangle-strip"
    }
}
