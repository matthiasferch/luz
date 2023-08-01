import { Transform } from '@luz/core'
import { vec3 } from '@luz/vectors'

import { Collider } from './collider'

export interface Body {
  mass: number

  velocity: vec3
  force: vec3

  transform: Transform
  collider: Collider
}