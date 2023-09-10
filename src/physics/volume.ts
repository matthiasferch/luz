import { Transform } from '../core'
import { mat3, vec3 } from '../vectors'
import { Collider } from './collider'

export abstract class Volume extends Collider {

  readonly center: vec3

  readonly inertia: mat3

  protected readonly origin: vec3

  constructor({
    origin = vec3.zero
  } = {}) {
    super()

    this.origin = origin.copy()
    this.center = origin.copy()

    this.inertia = new mat3()
  }

  toJSON() {
    const { origin } = this

    return { origin }
  }

  abstract transform(transform: Transform): void

  abstract calculateInertia(mass: number, transform: Transform): void

}

