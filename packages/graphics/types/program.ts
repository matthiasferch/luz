import type { Attribute } from './attribute'
import type { ShaderUniform, UniformBlock } from './uniform'

export type Program = WebGLProgram & {
  attributes: Record<string, Attribute>

  uniforms: Record<string, ShaderUniform>
  uniformBlocks: Record<string, UniformBlock>

  textureSlots: Record<string, number>
}
