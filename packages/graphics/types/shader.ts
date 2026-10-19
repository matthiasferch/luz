export type Shader = WebGLShader & {
  isCompiled: boolean
}

export type ShaderStage = 'vertex' | 'fragment'
