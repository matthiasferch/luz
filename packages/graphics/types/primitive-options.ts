import type { PrimitiveTopology, VertexFormat } from '@luz/formats'
import type { VertexBuffer } from '../buffers/vertex-buffer'

export interface VertexBinding {
  buffer: VertexBuffer
  location: number
  format: VertexFormat
  byteOffset?: number
  byteStride?: number
  divisor?: number
}

export interface PrimitiveOptions {
  topology: PrimitiveTopology
  vertexCount: number
  attributes: readonly VertexBinding[]
}

export interface DrawOptions {
  instanceCount?: number
  isMirrored?: boolean
}
