import { Transform } from '@luz/core'
import { mat3, vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'

export class Sphere extends Volume {

  type = Collider.Type.Sphere

  readonly origin: vec3

  readonly center: vec3

  readonly inertia: mat3

  radius: number

  constructor({
    origin = vec3.zero,
    radius = 1.0
  }) {
    super()

    this.origin = origin.copy()
    this.center = origin.copy()

    this.radius = radius

    this.inertia = new mat3()
  }

  transform(transform: Transform) {
    const { translation } = transform

    vec3.add(this.origin, translation, this.center)
  }

  calculateInertia(mass: number, transform: Transform) {
    const { radius } = this

    const t = (2 / 5) * mass * radius * radius

    this.inertia.set([
      t, 0, 0,
      0, t, 0,
      0, 0, t
    ])

    this.inertia.invert()
  }

  toJSON() {
    const { center, radius } = this

    return { center, radius }
  }

}
