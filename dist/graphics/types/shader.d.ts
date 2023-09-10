export type Shader = WebGLShader & {
    compiled: boolean;
};
export declare module Shader {
    enum Stage {
        VertexShader = 0,
        FragmentShader = 1
    }
}
