import { Attribute } from './attribute'
import { Uniform } from './uniform'

export type Program = WebGLProgram & {
  attributes: Record<string, Attribute>

  uniforms: Record<string, Uniform>
  uniformBlocks: Record<string, Uniform.Block>

  textureSlots: Record<string, number>
}