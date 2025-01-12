import { FrameBuffer } from '../buffers/frame-buffer'
import { RenderBuffer } from '../buffers/render-buffer'
import { UniformBuffer } from '../buffers/uniform-buffer'
import { Buffer } from '../types/buffer'
import { Texture } from '../types/texture'

export class Buffers {
  private buffers: Buffer[] = []

  private boundBuffers: Record<number, Buffer> = {}

  constructor(private gl: WebGL2RenderingContext) {}

  create(target: 'FrameBuffer'): FrameBuffer

  create(target: 'RenderBuffer'): RenderBuffer

  create(target: 'UniformBuffer', data?: any): UniformBuffer

  create(target: Buffer.Target, data?: any) {
    switch (target) {
      case 'FrameBuffer':
        const frameBuffer = this.gl.createFramebuffer() as FrameBuffer

        frameBuffer.target = this.gl.FRAMEBUFFER

        frameBuffer.attachments = {}

        this.buffers.push(frameBuffer)

        return frameBuffer

      case 'RenderBuffer':
        const renderBuffer = this.gl.createRenderbuffer() as RenderBuffer

        renderBuffer.target = this.gl.RENDERBUFFER

        this.buffers.push(renderBuffer)

        return renderBuffer

      case 'UniformBuffer':
        const buffer = this.gl.createBuffer() as UniformBuffer

        buffer.target = this.gl.UNIFORM_BUFFER
        buffer.usage = this.gl.DYNAMIC_DRAW

        if (data) {
          this.update(buffer, data)
        }

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

  attach(framebuffer: FrameBuffer, texture: Texture, attachment: number)
  attach(frameBuffer: FrameBuffer, renderBuffer: RenderBuffer, attachment: number)

  attach(frameBuffer: FrameBuffer, data: Texture | RenderBuffer, attachment: number) {
    this.bind(frameBuffer)

    switch (data.target) {
      case this.gl.TEXTURE_2D:
        console.log('TEXTURE_2D', frameBuffer.target, attachment, data.target, data)
        this.gl.framebufferTexture2D(frameBuffer.target, attachment, data.target, data, 0)

        break

      case this.gl.RENDERBUFFER:
        console.log('RENDERBUFFER', frameBuffer.target, attachment, data.target, data)
        this.gl.framebufferRenderbuffer(frameBuffer.target, attachment, this.gl.RENDERBUFFER, data)

        break
    }

    if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('Framebuffer is incomplete')
    }

    frameBuffer.attachments[attachment] = data
  }

  use(frameBuffer: FrameBuffer) {
    this.bind(frameBuffer)
  }

  private bind(buffer: Buffer) {
    const boundBuffer = buffer ? this.boundBuffers[buffer.target] : null

    if (boundBuffer === buffer) {
      // return
    }

    switch (buffer.target) {
      case this.gl.FRAMEBUFFER:
        const frameBuffer = boundBuffer as FrameBuffer

        if (frameBuffer) {
          Object.values(frameBuffer.attachments).forEach((attachment) => {
            const texture = attachment as Texture
            const { target, useMipmaps } = texture

            if (useMipmaps) {
              this.gl.bindTexture(target, texture)
              this.gl.generateMipmap(target)
            }
          })
        }

        this.gl.bindFramebuffer(buffer.target, buffer)

        break

      case this.gl.RENDERBUFFER:
        this.gl.bindRenderbuffer(buffer.target, buffer)

        break

      default:
        this.gl.bindBuffer(buffer.target, buffer)

        break
    }

    this.boundBuffers[buffer.target] = buffer
  }
}
