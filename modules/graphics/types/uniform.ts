import { Texture } from './texture'

export type Uniform = WebGLActiveInfo & {
  location: WebGLUniformLocation
}

export interface UniformBlock {
  name: string
  index: number
  binding: number

  offsets: Record<string, number>
}

export type UniformValue = boolean | number | Float32Array | Texture
