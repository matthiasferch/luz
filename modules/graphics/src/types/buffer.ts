import { FrameBuffer } from '../buffers/frame-buffer'
import { RenderBuffer } from '../buffers/render-buffer'
import { UniformBuffer } from '../buffers/uniform-buffer'

export type Buffer = FrameBuffer | RenderBuffer | UniformBuffer

export module Buffer {

  export enum Target {
    FrameBuffer,
    RenderBuffer,
    UniformBuffer
  }
  
}