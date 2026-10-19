export type UniformBuffer = WebGLBuffer & {
  type: 'uniformBuffer'

  target: number
  usage: number
}
