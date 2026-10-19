import type { Transform } from '@luz/core'
import type { RenderModel } from './render-model'

export interface RenderBatch {
  transform: Transform
  model: RenderModel

  depth?: number
  uniforms?: object
  meshes?: string[]
}
