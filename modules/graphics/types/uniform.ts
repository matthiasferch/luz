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

export namespace Uniform {
  export type Value = boolean | number | Float32Array | Texture
}
