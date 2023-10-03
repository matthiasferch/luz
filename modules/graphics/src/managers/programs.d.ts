import { UniformBuffer } from '../buffers/uniform-buffer';
import { Program } from '../types/program';
import { Shader } from '../types/shader';
import { Uniform } from '../types/uniform';
export declare class Programs {
    private gl;
    private programs;
    private usedProgram;
    constructor(gl: WebGL2RenderingContext);
    create(vertexShader: Shader, fragmentShader: Shader): Program | null;
    update(program: Program, data?: {
        uniforms?: Record<string, Uniform.Value>;
        uniformBuffers?: Record<string, UniformBuffer>;
    }): void;
    use(program: Program): void;
    private setupAttributes;
    private setupUniforms;
    private setupUniformBlocks;
    private setupTexureSlots;
    private isUniformArray;
}
