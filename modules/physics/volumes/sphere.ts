import { Transform } from '@luz/core'
import { Serialize } from '@luz/utilities'
import { vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'

export class Sphere extends Volume {
  readonly type: Collider.Type = 'sphere'

  @Serialize()
  readonly radius: number

  constructor({ origin = vec3.zero, radius = 1.0 }) {
    super({ origin })

    this.radius = radius
  }

  transform(transform: Transform) {
    const { translation } = transform

    vec3.add(this.origin, translation, this.center)
  }

  calculateInverseInertia(mass: number, transform: Transform) {
    const { radius } = this

    const t = (2 / 5) * mass * radius * radius

    this.inverseInertia.set([t, 0, 0, 0, t, 0, 0, 0, t])
    this.inverseInertia.invert()
  }
}
