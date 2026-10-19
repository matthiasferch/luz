import type { PrimitiveTopology } from '@luz/formats'

export type VertexArray = WebGLVertexArrayObject & {
  topology: PrimitiveTopology

  indexCount: number
  indexType: number
  vertexCount: number
}
