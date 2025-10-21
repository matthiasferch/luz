export type Shader = WebGLShader & {
  isCompiled: boolean
}

export type ShaderStage = 'Vertex' | 'Fragment'
