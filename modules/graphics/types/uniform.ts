import { Texture } from './texture'

export type Uniform = WebGLActiveInfo & {
  location: WebGLUniformLocation
}

export namespace Uniform {
  export type Value = number | Float32Array | Texture

  export interface Block {
    name: string
    index: number
    binding: number

    offsets: Record<string, number>
  }
}
