import { Attribute } from './attribute';
import { Uniform, UniformBlock } from './uniform';
export type Program = WebGLProgram & {
    attributes: Record<string, Attribute>;
    uniforms: Record<string, Uniform>;
    uniformBlocks: Record<string, UniformBlock>;
    textureSlots: Record<string, number>;
};
