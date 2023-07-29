import { vec3 } from '@luz/vectors'

import { Collider } from './collider'
import { Transform } from './transform'

export interface RigidBody {
  mass: number

  velocity: vec3
  force: vec3

  transform: Transform
  collider: Collider
}