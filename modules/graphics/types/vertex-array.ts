export type VertexArray = WebGLVertexArrayObject & {
  topology: VertexArray.Topology

  indexCount: number
  vertexCount: number
}

export namespace VertexArray {
  export type Topology = 'Points' | 'Lines' | 'LineLoop' | 'LineStrip' | 'Triangles' | 'TriangleFan' | 'TriangleStrip'
}
