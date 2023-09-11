import { Transform } from '../../core'
import { Serialized } from '../../utilities'
import { vec3 } from '../../vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'

export class Sphere extends Volume {

  readonly type = Collider.Type.Sphere

  @Serialized
  readonly radius: number

  constructor({
    origin = vec3.zero,
    radius = 1.0
  }) {
    super({ origin })

    this.radius = radius
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

}
