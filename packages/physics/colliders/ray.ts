import { Serialize, Register } from '@luz/serialization'
import { Vector3 } from '@luz/math'
import { Collider } from '../collider'

@Register('ray')
export class Ray extends Collider {
  readonly type = 'ray'

  @Serialize()
  readonly origin: Vector3 = Vector3.createZero()

  @Serialize()
  readonly direction: Vector3 = Vector3.createUp()

  constructor({ origin = Vector3.createZero(), direction = Vector3.createUp() } = {}) {
    super()

    this.origin = origin.clone()
    this.direction = direction.clone()

    this.validate()
  }

  validate(): void {
    if (
      this.origin.xyz.some((value) => !Number.isFinite(value)) ||
      !Number.isFinite(this.direction.magnitude) ||
      this.direction.magnitude === 0
    ) {
      throw new Error('Ray requires a finite origin and nonzero finite direction')
    }

    this.direction.normalize()
  }
}

export const isRay = (collider: Collider): collider is Ray => {
  return collider.type === 'ray'
}
