import { Entity, Light } from '@luz/core'
import { Scissor } from './scissor'

// Per-light work unit used by the render graph for shadow and light passes.
// Formerly referred to as a "LightJob".
export type LightingTask = {
  light: Light
  entities: Entity[]
  scissor?: Scissor
}
