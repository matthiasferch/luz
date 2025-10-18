import { Model, Transform } from '@luz/core'

export type RenderBatch = {
  transform: Transform
  model: Model

  depth?: number
  uniforms?: Record<string, unknown>
  partitions?: string[]
}
