import { vec4 } from '@luz/vectors';
import { FrameBuffer } from '../buffers/frame-buffer';
export type RenderTarget = {
    width: number;
    height: number;
    clearColor?: vec4;
    clearDepth?: number;
    clearStencil?: number;
    depthMask?: boolean;
    colorMask?: boolean[];
    frameBuffer?: FrameBuffer;
};
