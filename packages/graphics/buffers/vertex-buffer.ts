export type VertexBuffer = WebGLBuffer & {
  type: 'vertexBuffer'
  target: number
  capacity: number
  byteLength: number
}
