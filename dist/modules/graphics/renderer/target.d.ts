import { FrameBuffer } from '../buffers/frame-buffer';
export declare class RenderTarget {
    width: number;
    height: number;
    frameBuffer?: FrameBuffer;
    constructor({ width, height, frameBuffer }: {
        width: number;
        height: number;
        frameBuffer?: FrameBuffer;
    });
}
