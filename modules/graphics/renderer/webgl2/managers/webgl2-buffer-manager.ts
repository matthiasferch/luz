import { FrameBuffer } from '../../../buffers/frame-buffer'
import { RenderBuffer } from '../../../buffers/render-buffer'
import { UniformBuffer } from '../../../buffers/uniform-buffer'
import { BufferManager } from '../../renderer'
import { Buffer } from '../../../types/buffer'
import { Texture } from '../../../types/texture'

export class WebGL2BufferManager implements BufferManager {
  private readonly buffers: Buffer[] = []

  private readonly activeBuffers: Partial<Record<Buffer.Type, Buffer>> = {}

  constructor(private gl: WebGL2RenderingContext) { }

  create(target: 'FrameBuffer'): FrameBuffer
  create(target: 'RenderBuffer'): RenderBuffer
  create(target: 'UniformBuffer'): UniformBuffer

  create(target: Buffer.Type) {
    switch (target) {
      case 'FrameBuffer':
        const frameBuffer = this.gl.createFramebuffer() as FrameBuffer

        frameBuffer.type = 'FrameBuffer'
        frameBuffer.target = this.gl.FRAMEBUFFER

        frameBuffer.attachments = {}

        this.buffers.push(frameBuffer)

        return frameBuffer

      case 'RenderBuffer':
        const renderBuffer = this.gl.createRenderbuffer() as RenderBuffer

        renderBuffer.type = 'RenderBuffer'
        renderBuffer.target = this.gl.RENDERBUFFER

        this.buffers.push(renderBuffer)

        return renderBuffer

      case 'UniformBuffer':
        const buffer = this.gl.createBuffer() as UniformBuffer

        buffer.type = 'UniformBuffer'
        buffer.usage = this.gl.DYNAMIC_DRAW
        buffer.target = this.gl.UNIFORM_BUFFER

        this.buffers.push(buffer)

        return buffer

      default:
        throw new Error(`Invalid buffer target: ${target}`)
    }
  }

  update(buffer: UniformBuffer, data: any, offset?: number) {
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

    // Ensure draw buffers are configured for color attachments
    if (attachment >= this.gl.COLOR_ATTACHMENT0 && attachment <= (this.gl.COLOR_ATTACHMENT0 + 15)) {
      const drawBufCount = attachment - this.gl.COLOR_ATTACHMENT0 + 1
      const bufs = new Array(drawBufCount).fill(0).map((_, i) => this.gl.COLOR_ATTACHMENT0 + i)
      this.gl.drawBuffers(bufs as unknown as number[])
    }

    if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('Frame buffer is incomplete')
    }

    frameBuffer.attachments[attachment] = data
  }

  bind(buffer: Buffer) {
    const { type, target } = buffer

    const activeBuffer = this.activeBuffers[type]

    if (activeBuffer === buffer) {
      return
    }

    switch (type) {
      case 'FrameBuffer':

        /*const frameBuffer = buffer as FrameBuffer

        Object.values(frameBuffer.attachments).forEach((attachment) => {
          const texture = attachment as Texture
          const { target, useMipmaps } = texture

          if (useMipmaps) {
            this.gl.bindTexture(target, texture)
            this.gl.generateMipmap(target)
          }
        })*/

        this.gl.bindFramebuffer(target, buffer)

        break

      case 'RenderBuffer':

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
      case 'FrameBuffer':
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)

        break

      case 'RenderBuffer':
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null)

        break

      case 'UniformBuffer':
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, null)

        break
    }

    delete this.activeBuffers[type]
  }

  unbindFrameBuffer() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
    delete this.activeBuffers['FrameBuffer']
  }

  unbindRenderBuffer() {
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null)
    delete this.activeBuffers['RenderBuffer']
  }

  unbindUniformBuffer() {
    this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, null)
    delete this.activeBuffers['UniformBuffer']
  }
}
