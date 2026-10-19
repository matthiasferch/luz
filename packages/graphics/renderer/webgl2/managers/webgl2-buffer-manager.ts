import type { FrameBuffer } from '../../../buffers/frame-buffer'
import type { RenderBuffer } from '../../../buffers/render-buffer'
import type { UniformBuffer } from '../../../buffers/uniform-buffer'
import type { VertexBuffer } from '../../../buffers/vertex-buffer'
import type { BufferManager } from '../../render-backend'
import type { Buffer } from '../../../types/buffer'
import type { Texture } from '../../../types/texture'

export class WebGL2BufferManager implements BufferManager {
  private readonly buffers = new Set<Buffer>()
  private readonly activeBuffers: Partial<Record<Buffer.Type, Buffer>> = {}

  constructor(private gl: WebGL2RenderingContext) {}

  create(target: 'frameBuffer'): FrameBuffer
  create(target: 'renderBuffer'): RenderBuffer
  create(target: 'uniformBuffer'): UniformBuffer
  create(target: 'vertexBuffer'): VertexBuffer

  create(target: Buffer.Type) {
    switch (target) {
      case 'frameBuffer': {
        const frameBuffer = this.gl.createFramebuffer() as FrameBuffer | null

        if (!frameBuffer) {
          throw new Error('Unable to allocate frame buffer')
        }

        frameBuffer.type = 'frameBuffer'
        frameBuffer.target = this.gl.FRAMEBUFFER
        frameBuffer.attachments = {}

        this.buffers.add(frameBuffer)

        return frameBuffer
      }

      case 'renderBuffer': {
        const renderBuffer = this.gl.createRenderbuffer() as RenderBuffer | null

        if (!renderBuffer) {
          throw new Error('Unable to allocate render buffer')
        }

        renderBuffer.type = 'renderBuffer'
        renderBuffer.target = this.gl.RENDERBUFFER

        this.buffers.add(renderBuffer)

        return renderBuffer
      }

      case 'uniformBuffer': {
        const buffer = this.gl.createBuffer() as UniformBuffer | null

        if (!buffer) {
          throw new Error('Unable to allocate uniform buffer')
        }

        buffer.type = 'uniformBuffer'
        buffer.usage = this.gl.DYNAMIC_DRAW
        buffer.target = this.gl.UNIFORM_BUFFER

        this.buffers.add(buffer)

        return buffer
      }

      case 'vertexBuffer': {
        const buffer = this.gl.createBuffer() as VertexBuffer | null

        if (!buffer) {
          throw new Error('Unable to allocate vertex buffer')
        }

        buffer.type = 'vertexBuffer'
        buffer.target = this.gl.ARRAY_BUFFER
        buffer.capacity = 0
        buffer.byteLength = 0

        this.buffers.add(buffer)

        return buffer
      }

      default:
        throw new Error(`Invalid buffer target: ${target}`)
    }
  }

  update(buffer: UniformBuffer, data: AllowSharedBufferSource, offset?: number): void
  update(buffer: VertexBuffer, data: AllowSharedBufferSource): void
  update(buffer: UniformBuffer | VertexBuffer, data: AllowSharedBufferSource, offset?: number): void {
    if (!this.buffers.has(buffer)) {
      throw new Error('Cannot update an unknown or destroyed buffer')
    }

    if (buffer.type === 'vertexBuffer') {
      if (offset !== undefined) {
        throw new Error('Vertex buffer updates replace the populated range')
      }

      if (data.byteLength === 0) {
        buffer.byteLength = 0

        return
      }

      this.bind(buffer)

      if (data.byteLength > buffer.capacity) {
        const capacity = Math.max(256, 2 ** Math.ceil(Math.log2(data.byteLength)))

        this.gl.bufferData(buffer.target, capacity, this.gl.DYNAMIC_DRAW)

        buffer.capacity = capacity
      }

      this.gl.bufferSubData(buffer.target, 0, data)

      buffer.byteLength = data.byteLength

      return
    }

    this.bind(buffer)

    if (offset !== undefined) {
      this.gl.bufferSubData(buffer.target, offset, data)
    } else {
      this.gl.bufferData(buffer.target, data, buffer.usage)
    }
  }

  format(buffer: RenderBuffer, format: number, width: number, height: number) {
    this.bind(buffer)
    this.gl.renderbufferStorage(buffer.target, format, width, height)
  }

  destroy(buffer: Buffer): void {
    if (!this.buffers.delete(buffer)) {
      return
    }

    if (this.activeBuffers[buffer.type] === buffer) {
      this.unbind(buffer.type)
    }

    switch (buffer.type) {
      case 'frameBuffer': {
        const frameBuffer = buffer as FrameBuffer

        this.gl.deleteFramebuffer(buffer)

        frameBuffer.attachments = {}

        break
      }
      case 'renderBuffer':
        this.gl.deleteRenderbuffer(buffer)
        break
      case 'uniformBuffer':
      case 'vertexBuffer':
        this.gl.deleteBuffer(buffer)

        if (buffer.type === 'vertexBuffer') {
          buffer.capacity = 0
          buffer.byteLength = 0
        }

        break
    }
  }

  destroyAll(): void {
    for (const buffer of this.buffers) {
      this.destroy(buffer)
    }
  }

  attach(framebuffer: FrameBuffer, texture: Texture, attachment: number): void
  attach(frameBuffer: FrameBuffer, renderBuffer: RenderBuffer, attachment: number): void

  attach(frameBuffer: FrameBuffer, data: Texture | RenderBuffer, attachment: number) {
    this.bind(frameBuffer)

    switch (data.target) {
      case this.gl.TEXTURE_2D:
        this.gl.framebufferTexture2D(frameBuffer.target, attachment, data.target, data, 0)

        break

      case this.gl.RENDERBUFFER:
        this.gl.framebufferRenderbuffer(frameBuffer.target, attachment, this.gl.RENDERBUFFER, data)

        break
    }

    if (attachment >= this.gl.COLOR_ATTACHMENT0 && attachment <= this.gl.COLOR_ATTACHMENT0 + 15) {
      const present = new Set<number>(
        Object.keys(frameBuffer.attachments)
          .map((elementIndex) => parseInt(elementIndex, 10))
          .filter(
            (attachment) => attachment >= this.gl.COLOR_ATTACHMENT0 && attachment <= this.gl.COLOR_ATTACHMENT0 + 15
          )
      )

      present.add(attachment)

      const buffers = Array.from(present).sort(
        (firstAttachment, secondAttachment) => firstAttachment - secondAttachment
      )

      this.gl.drawBuffers(buffers as unknown as number[])
    }

    if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('Frame buffer is incomplete')
    }

    frameBuffer.attachments[attachment] = data
  }

  bind(buffer: Buffer) {
    const { type, target } = buffer

    const activeBuffer = this.activeBuffers[type]

    // Mesh setup also binds ARRAY_BUFFER directly, so vertex bindings cannot be cached here.
    if (activeBuffer === buffer && buffer.type !== 'vertexBuffer') {
      return
    }

    switch (type) {
      case 'frameBuffer':
        this.gl.bindFramebuffer(target, buffer)

        break

      case 'renderBuffer':
        this.gl.bindRenderbuffer(target, buffer)

        break

      default:
        this.gl.bindBuffer(target, buffer)

        break
    }

    this.activeBuffers[type] = buffer
  }

  unbind(type: Buffer.Type) {
    switch (type) {
      case 'frameBuffer':
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)

        break

      case 'renderBuffer':
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null)

        break

      case 'uniformBuffer':
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, null)

        break

      case 'vertexBuffer':
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)

        break
    }

    delete this.activeBuffers[type]
  }

  unbindFrameBuffer() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
    delete this.activeBuffers['frameBuffer']
  }

  unbindRenderBuffer() {
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null)
    delete this.activeBuffers['renderBuffer']
  }

  unbindUniformBuffer() {
    this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, null)
    delete this.activeBuffers['uniformBuffer']
  }
}
