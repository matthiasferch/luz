import { FrameBuffer } from '../buffers/frame-buffer'

export class RenderTarget {
  width: number
  height: number

  frameBuffer?: FrameBuffer

  constructor({ width, height, frameBuffer }: { width: number; height: number; frameBuffer?: FrameBuffer }) {
    this.width = width
    this.height = height

    this.frameBuffer = frameBuffer
  }
}
