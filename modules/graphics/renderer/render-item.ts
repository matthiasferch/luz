import { Model, Transform } from '@luz/core'

// Immutable description of a single draw submission.
// Does not execute anything; the RenderQueue uses these to issue draws.
export type RenderItem = {
  transform: Transform
  model: Model
  // Optional depth value for sorting (camera-space z or similar)
  depth?: number
  // Optional key for stable state sorting (program|texture|mesh)
  sortKey?: number | string
  // Optional extra uniforms specific to this draw
  uniforms?: Record<string, unknown>
}

