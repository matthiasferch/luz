import type { Model } from '../model'
import type { Primitive } from '../types/primitive'
import type { RenderMaterial } from './render-material'

export interface RenderModel {
  readonly source: Model
  readonly materials: Record<string, RenderMaterial>
  readonly primitives: Record<string, Primitive>
}
