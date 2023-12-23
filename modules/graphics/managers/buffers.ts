import { FrameBuffer } from '../buffers/frame-buffer'
import { RenderBuffer } from '../buffers/render-buffer'
import { UniformBuffer } from '../buffers/uniform-buffer'
import { Buffer } from '../types/buffer'
import { Texture } from '../types/texture'

export class Buffers {

  private buffers: Buffer[] = []

  private boundBuffers: Record<number, Buffer> = {}

  constructor(private gl: WebGL2RenderingContext) { }

  create(target: Buffer.Target.FrameBuffer): FrameBuffer
  create(target: Buffer.Target.RenderBuffer): RenderBuffer
  create(target: Buffer.Target.UniformBuffer): UniformBuffer

  create(target: Buffer.Target) {
    switch (target) {
      case Buffer.Target.FrameBuffer:

        const frameBuffer = this.gl.createFramebuffer() as FrameBuffer

        frameBuffer.target = this.gl.FRAMEBUFFER

        frameBuffer.attachments = {}

        this.buffers.push(frameBuffer)

        return frameBuffer

      case Buffer.Target.RenderBuffer:

        const renderBuffer = this.gl.createRenderbuffer() as RenderBuffer

        renderBuffer.target = this.gl.RENDERBUFFER

        this.buffers.push(renderBuffer)

        return renderBuffer

      case Buffer.Target.UniformBuffer:

        const buffer = this.gl.createBuffer() as UniformBuffer

        buffer.target = this.gl.UNIFORM_BUFFER
        buffer.usage = this.gl.DYNAMIC_DRAW

        this.buffers.push(buffer)

        return buffer
    }
  }

  update(buffer: UniformBuffer, source: any, offset?: number) {
    this.bind(buffer)

    if (offset !== undefined) {
      this.gl.bufferSubData(buffer.target, offset, source)
    } else {
      this.gl.bufferData(buffer.target, source, buffer.usage)
    }
  }

  format(buffer: RenderBuffer, format: number, width: number, height: number) {
    this.bind(buffer)

    this.gl.renderbufferStorage(buffer.target, format, width, height)
  }

  attach(framebuffer: FrameBuffer, texture: Texture, attachment: number): void
  attach(frameBuffer: FrameBuffer, renderBuffer: RenderBuffer, attachment: number): void

  attach(framebuffer: FrameBuffer, buffer: Texture | RenderBuffer, attachment: number) {
    this.bind(framebuffer)

    switch (buffer.target) {
      case this.gl.TEXTURE_2D:
        this.gl.framebufferTexture2D(framebuffer.target, attachment, buffer.target, buffer, 0)

        break

      case this.gl.RENDERBUFFER:
        this.gl.framebufferRenderbuffer(framebuffer.target, attachment, this.gl.RENDERBUFFER, buffer)

        break
    }

    framebuffer.attachments[attachment] = buffer
  }

  use(framebuffer: FrameBuffer) {
    this.bind(framebuffer)
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
          Object.values(frameBuffer.attachments).forEach(attachment => {
            const texture = attachment as Texture

            if (texture.useMipmaps) {
              this.gl.bindTexture(texture.target, texture)
              this.gl.generateMipmap(texture.target)
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