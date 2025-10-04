export type Shader = WebGLShader & {
    isCompiled: boolean;
};
export declare namespace Shader {
    type Stage = 'Vertex' | 'Fragment';
}
