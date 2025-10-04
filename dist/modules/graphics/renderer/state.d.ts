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
export declare namespace State {
    type CullMode = 'None' | 'Front' | 'Back';
    type BlendMode = 'None' | 'Additive' | 'Transparent';
    type DepthTest = 'None' | 'Never' | 'Always' | 'Equal' | 'NotEqual' | 'Less' | 'LessEqual' | 'Greater' | 'GreaterEqual';
}
