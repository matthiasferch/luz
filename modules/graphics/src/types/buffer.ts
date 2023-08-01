import { FrameBuffer } from '../buffers/frame-buffer'
import { RenderBuffer } from '../buffers/render-buffer'
import { UniformBuffer } from '../buffers/uniform-buffer'

export type Buffer = FrameBuffer | RenderBuffer | UniformBuffer

export declare module Buffer {
  export enum Target {
    FrameBuffer = 1,
    RenderBuffer = 2,
    UniformBuffer = 3
  }
}