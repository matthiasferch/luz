import type { Transform } from '@luz/core'
import { Serialize, Register } from '@luz/serialization'
import { Vector3 } from '@luz/math'
import type { Collider } from '../collider'
import { assertPositiveDimensions } from '../collider'
import { Volume } from '../volume'

@Register('sphere')
export class Sphere extends Volume {
  readonly type = 'sphere'

  @Serialize()
  readonly radius: number

  constructor({ origin = Vector3.createZero(), radius = 1.0 } = {}) {
    super({ origin })

    this.radius = radius

    this.validate()
  }

  validate(): void {
    super.validate()
    assertPositiveDimensions(this.radius)
  }

  applyTransform(transform: Transform) {
    this.updateCenter(transform)
  }

  calculateInverseInertia(mass: number, _transform: Transform) {
    const { radius } = this

    const inertia = (2 / 5) * mass * radius * radius
    const inverse = inertia > 0 ? 1 / inertia : 0

    this.inverseInertia.set([inverse, 0, 0, 0, inverse, 0, 0, 0, inverse])
  }

  calculateSupportPoint(direction: Vector3): Vector3 {
    return direction.clone().normalize().scale(this.radius).add(this.center)
  }
}

export const isSphere = (collider: Collider): collider is Sphere => {
  return collider.type === 'sphere'
}
