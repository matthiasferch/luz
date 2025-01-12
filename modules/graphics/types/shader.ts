export type Shader = WebGLShader & {
  isCompiled: boolean
}

export namespace Shader {
  export type Stage = 'Vertex' | 'Fragment'
}
