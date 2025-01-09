import { Transform } from '@luz/core'
import { Serialize } from '@luz/utilities'
import { mat3, vec3 } from '@luz/vectors'
import { Collider } from './collider'

export abstract class Volume extends Collider {
  @Serialize()
  protected readonly origin: vec3

  readonly center: vec3

  readonly inverseInertia: mat3

  constructor({ origin = vec3.zero } = {}) {
    super()

    this.origin = origin.copy()
    this.center = origin.copy()

    this.inverseInertia = new mat3()
  }

  serialize() {
    const { origin } = this

    return {
      ...super.serialize(),
      origin: origin.serialize()
    }
  }

  abstract transform(transform: Transform): void

  abstract calculateInverseInertia(mass: number, transform: Transform): void
}
