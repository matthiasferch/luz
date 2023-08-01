export type Shader = WebGLShader & {
  compiled: boolean
}

export module Shader {
  export enum Stage {
    VertexShader,
    FragmentShader
  }
}