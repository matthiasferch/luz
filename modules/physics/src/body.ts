import { Transform } from '@luz/core'
import { vec3 } from '@luz/vectors'

import { Collider } from './collider'

export class Body {

  mass: number

  collider: Collider
  transform: Transform

  readonly velocity: vec3
  readonly force: vec3

  constructor({
    mass = 1.0
  } = {}) {
    this.mass = mass

    this.velocity = vec3.zero.copy()
    this.force = vec3.zero.copy()
  }

}