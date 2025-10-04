import { UniformBuffer } from '../buffers/uniform-buffer';
import { Program } from '../types/program';
import { Shader } from '../types/shader';
import { Uniform } from '../types/uniform';
type UniformData = Partial<{
    uniforms: Record<string, Uniform.Value>;
    uniformBuffers: Record<string, UniformBuffer>;
}>;
export declare class Programs {
    private gl;
    private programs;
    private usedProgram;
    constructor(gl: WebGL2RenderingContext);
    create(vertexShader: Shader, fragmentShader: Shader, data?: UniformData): Program | null;
    update(program: Program, data: UniformData): void;
    use(program: Program): void;
    private setupAttributes;
    private setupUniforms;
    private setupUniformBlocks;
    private setupTexureSlots;
    private isUniformArray;
}
export {};
