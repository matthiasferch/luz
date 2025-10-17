import { Model, Transform } from '@luz/core'

// Immutable description of a single draw submission.
// Does not execute anything; the RenderQueue uses these to issue draws.
export type RenderBatch = {
  transform: Transform
  model: Model
  depth?: number
  uniforms?: Record<string, unknown>
  partitions?: string[]
}
