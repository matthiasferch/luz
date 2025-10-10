export type UniformBuffer = WebGLBuffer & {
  type: 'UniformBuffer'

  target: number
  usage: number
}