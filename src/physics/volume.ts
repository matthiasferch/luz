import { Transform } from '../core'
import { Serialized } from '../utilities'
import { mat3, vec3 } from '../vectors'
import { Collider } from './collider'

export abstract class Volume extends Collider {

  @Serialized
  readonly origin: Readonly<vec3>

  readonly center: vec3

  readonly inertia: mat3

  constructor({
    origin = vec3.zero
  } = {}) {
    super()

    this.origin = origin.copy()
    this.center = origin.copy()

    this.inertia = new mat3()
  }

  serialize() {
    const { origin } = this

    return {
      ...super.serialize(),
      origin: origin.serialize()
    }
  }

  abstract transform(transform: Transform): void

  abstract calculateInertia(mass: number, transform: Transform): void

}

