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
    create(target: 'FrameBuffer'): FrameBuffer;
    create(target: 'RenderBuffer'): RenderBuffer;
    create(target: 'UniformBuffer', data?: any): UniformBuffer;
    update(buffer: UniformBuffer, data: any, offset?: number): void;
    format(buffer: RenderBuffer, format: number, width: number, height: number): void;
    attach(framebuffer: FrameBuffer, texture: Texture, attachment: number): void;
    attach(frameBuffer: FrameBuffer, renderBuffer: RenderBuffer, attachment: number): void;
    bind(buffer: Buffer): void;
    unbind(target: Buffer.Target): void;
}
