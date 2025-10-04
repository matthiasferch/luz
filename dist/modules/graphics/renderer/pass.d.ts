import { vec4 } from '@luz/vectors';
import { Program } from '../types/program';
import { State } from './state';
import { Serializable } from '@luz/utilities';
export declare class RenderPass extends Serializable {
    readonly clearColor: vec4;
    readonly clearDepth: number;
    readonly cullMode: State.CullMode;
    readonly blendMode: State.BlendMode;
    readonly depthTest: State.DepthTest;
    readonly depthMask: boolean;
    readonly colorMask: boolean[];
    readonly vertexShader: string;
    readonly fragmentShader: string;
    program: Program | null;
    constructor(data: Partial<RenderPass>);
    static deserialize(data: Partial<RenderPass>): Promise<RenderPass>;
}
