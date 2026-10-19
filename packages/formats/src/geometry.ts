import type { Tuple3 } from './tuples'

export const GEOMETRY_MAGIC = 'LUZG'
export const GEOMETRY_HEADER_LENGTH = 16
export const GEOMETRY_MAJOR_VERSION = 1
export const GEOMETRY_MINOR_VERSION = 0

export type VertexFormat = 'float32x3' | 'float32x2' | 'float32x4'
export type IndexFormat = 'uint16' | 'uint32'

export const VERTEX_FORMAT_BYTE_LENGTH: Readonly<Record<VertexFormat, number>> = {
  float32x2: 8,
  float32x3: 12,
  float32x4: 16
}

export interface GeometryReference {
  uri: string
  byteLength: number
}

export interface AttributeDescriptor<Format extends VertexFormat = VertexFormat> {
  format: Format
  byteOffset: number
}

export interface VertexDescriptor {
  byteOffset: number
  count: number
  byteStride: number
  attributes: {
    position: AttributeDescriptor<'float32x3'>
    normal?: AttributeDescriptor<'float32x3'>
    textureCoordinates?: AttributeDescriptor<'float32x2'>
    tangent?: AttributeDescriptor<'float32x4'>
  }
}

export interface IndexDescriptor {
  byteOffset: number
  count: number
  format: IndexFormat
}

export interface BoundingBoxDefinition {
  minimum: Tuple3
  maximum: Tuple3
}
