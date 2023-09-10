import { FrameBuffer } from '../buffers/frame-buffer';
import { RenderBuffer } from '../buffers/render-buffer';
import { UniformBuffer } from '../buffers/uniform-buffer';
import { Buffer } from '../types/buffer';
import { Texture } from '../types/texture';
export declare class Buffers {
    private gl;
    private buffers;
    private boundBuffers;
    constructor(gl: WebGL2RenderingContext);
    create(target: Buffer.Target.FrameBuffer): FrameBuffer;
    create(target: Buffer.Target.RenderBuffer): RenderBuffer;
    create(target: Buffer.Target.UniformBuffer): UniformBuffer;
    update(buffer: UniformBuffer, source: any, offset?: number): void;
    format(buffer: RenderBuffer, format: number, width: number, height: number): void;
    attach(framebuffer: FrameBuffer, texture: Texture, attachment: number): void;
    attach(frameBuffer: FrameBuffer, renderBuffer: RenderBuffer, attachment: number): void;
    use(framebuffer: FrameBuffer): void;
    private bind;
}
