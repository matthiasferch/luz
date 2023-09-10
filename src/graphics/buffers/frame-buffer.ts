import { Texture } from '../types/texture'
import { RenderBuffer } from './render-buffer'

type Attachment = Texture | RenderBuffer

export type FrameBuffer = WebGLFramebuffer & {
  target: number

  attachments: { [index: number]: Attachment }
}