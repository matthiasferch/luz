import type { BlendMode, ColorMask, CullMode, DepthTest } from './render-state'

export interface PipelineDefinition {
  $schema?: string
  cullMode?: CullMode
  blendMode?: BlendMode
  depthTest?: DepthTest
  depthMask?: boolean
  colorMask?: ColorMask
  vertexShader: string
  fragmentShader: string
}
