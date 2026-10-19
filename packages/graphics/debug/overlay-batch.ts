import { Vector3 } from '@luz/math'
import type { VertexBuffer } from '../buffers/vertex-buffer'
import type { RenderBackend } from '../renderer/render-backend'
import type { DrawPrimitive } from '../types/primitive'

export class OverlayBatch {
  private vertices = new Float32Array(256)
  private buffer?: VertexBuffer
  private primitive?: DrawPrimitive
  private length = 0

  readonly color: Vector3

  constructor(
    color: string,
    readonly isCone = false
  ) {
    this.color = new Vector3([1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16) / 255))
  }

  get isEmpty(): boolean {
    return this.length === 0
  }

  reset(): void {
    this.length = 0
  }

  append(vertices: number[]): void {
    const count = vertices.length

    if (this.length + count > this.vertices.length) {
      const expandedVertices = new Float32Array(2 ** Math.ceil(Math.log2(this.length + count)))

      expandedVertices.set(this.vertices)

      this.vertices = expandedVertices
    }

    this.vertices.set(vertices, this.length)

    this.length += count
  }

  draw(backend: RenderBackend): void {
    if (!this.length) {
      return
    }

    if (!this.primitive) {
      const buffer = backend.buffers.create('vertexBuffer')

      try {
        this.primitive = backend.primitives.create({
          topology: 'triangles',
          vertexCount: this.isCone ? 96 : 6,
          attributes: [
            { buffer, location: 7, format: 'float32x3', byteStride: 24, divisor: 1 },
            { buffer, location: 8, format: 'float32x3', byteStride: 24, byteOffset: 12, divisor: 1 }
          ]
        })
        this.buffer = buffer
      } catch (error) {
        backend.buffers.destroy(buffer)

        throw error
      }
    }

    backend.buffers.update(this.buffer!, this.vertices.subarray(0, this.length))
    backend.draw(this.primitive, { instanceCount: this.length / 6 })
  }

  destroy(backend: RenderBackend): void {
    if (this.primitive) {
      backend.primitives.destroy(this.primitive)

      this.primitive = undefined
    }

    if (this.buffer) {
      backend.buffers.destroy(this.buffer)

      this.buffer = undefined
    }

    this.reset()
  }
}
