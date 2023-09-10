import { Shader } from '../types/shader';
export declare class Shaders {
    private gl;
    private shaders;
    constructor(gl: WebGL2RenderingContext);
    create(stage: Shader.Stage, source: string, headers?: string[]): Shader | null;
}
