import type { Entity, Light, Rectangle } from '@luz/core'

export interface LightBatch {
  light: Light
  entities: Entity[]
  shadowEntities?: Entity[][]
  scissor?: Rectangle
}
