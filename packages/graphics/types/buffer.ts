import type { FrameBuffer } from '../buffers/frame-buffer'
import type { RenderBuffer } from '../buffers/render-buffer'
import type { UniformBuffer } from '../buffers/uniform-buffer'
import type { VertexBuffer } from '../buffers/vertex-buffer'

export type Buffer = FrameBuffer | RenderBuffer | UniformBuffer | VertexBuffer

export namespace Buffer {
  export type Type = 'frameBuffer' | 'renderBuffer' | 'uniformBuffer' | 'vertexBuffer'
}
