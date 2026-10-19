import type { Texture } from '../types/texture'
import type { RenderBuffer } from './render-buffer'

type Attachment = Texture | RenderBuffer

export type FrameBuffer = WebGLFramebuffer & {
  type: 'frameBuffer'

  target: number

  attachments: { [index: number]: Attachment }
}
