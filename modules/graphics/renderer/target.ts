import { FrameBuffer } from '../buffers/frame-buffer'

export class RenderTarget {
  width: number
  height: number

  frameBuffer?: FrameBuffer
}
