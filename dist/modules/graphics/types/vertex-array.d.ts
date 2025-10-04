export type VertexArray = WebGLVertexArrayObject & {
    topology: VertexArray.Topology;
    indexCount: number;
    vertexCount: number;
};
export declare namespace VertexArray {
    type Topology = 'Points' | 'Lines' | 'LineLoop' | 'LineStrip' | 'Triangles' | 'TriangleFan' | 'TriangleStrip';
}
