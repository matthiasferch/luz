export declare class State {
    private gl;
    private activeCullMode;
    private activeBlendMode;
    private activeDepthTest;
    constructor(gl: WebGL2RenderingContext);
    set cullMode(cullMode: State.CullMode);
    set blendMode(blendMode: State.BlendMode);
    set depthTest(depthTest: State.DepthTest);
}
export declare module State {
    enum CullMode {
        None = 0,
        Front = 1,
        Back = 2
    }
    enum BlendMode {
        None = 0,
        Additive = 1,
        Transparent = 2
    }
    enum DepthTest {
        None = 0,
        Never = 1,
        Always = 2,
        Equal = 3,
        NotEqual = 4,
        Less = 5,
        LessEqual = 6,
        Greater = 7,
        GreaterEqual = 8
    }
}
