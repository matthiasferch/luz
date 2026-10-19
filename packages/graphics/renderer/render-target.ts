import type { FrameBuffer } from '../buffers/frame-buffer'
import type { Rectangle } from '@luz/core'

export interface RenderTarget {
  width: number
  height: number
  frameBuffer?: FrameBuffer
  viewport?: Rectangle
}
