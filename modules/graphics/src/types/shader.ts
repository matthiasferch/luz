export type Shader = WebGLShader & {
  compiled: boolean
}

export declare module Shader {
  export enum Stage {
    VertexShader,
    FragmentShader
  }
}