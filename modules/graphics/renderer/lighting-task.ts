import { Entity, Light } from '@luz/core'

// Per-light work unit used by the render graph for shadow and light passes.
// Formerly referred to as a "LightJob".
export type LightingTask = {
  light: Light
  entities: Entity[]
  scissor?: { x: number; y: number; width: number; height: number }
}

