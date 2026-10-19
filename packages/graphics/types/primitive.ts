import type { RenderMaterial } from '../renderer/render-material'
import type { VertexArray } from '../types/vertex-array'

export interface DrawPrimitive {
  vertexArray: VertexArray
}

export interface Primitive extends DrawPrimitive {
  material: RenderMaterial
  generatedCoordinateMinimum: Float32Array
  generatedCoordinateExtent: Float32Array
}
