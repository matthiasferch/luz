import { FrameBuffer } from '../buffers/frame-buffer';
import { RenderBuffer } from '../buffers/render-buffer';
import { UniformBuffer } from '../buffers/uniform-buffer';
export type Buffer = FrameBuffer | RenderBuffer | UniformBuffer;
export declare module Buffer {
    enum Target {
        FrameBuffer = 0,
        RenderBuffer = 1,
        UniformBuffer = 2
    }
}
