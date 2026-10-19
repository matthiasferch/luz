import { Serialize, Register } from '@luz/serialization'
import { Vector3 } from '@luz/math'
import { Collider } from '../collider'

@Register('plane')
export class Plane extends Collider {
  readonly type = 'plane'

  @Serialize()
  readonly normal: Vector3 = Vector3.createUp()

  @Serialize()
  distance: number = 0

  constructor({ normal = Vector3.createUp(), distance = 0 } = {}) {
    super()

    this.normal = normal.clone()
    this.distance = distance

    this.validate()
  }

  validate(): void {
    const length = this.normal.magnitude

    if (!Number.isFinite(length) || length === 0 || !Number.isFinite(this.distance)) {
      throw new Error('Invalid plane equation')
    }

    this.normal.scale(1 / length)

    this.distance /= length
  }

  calculateSignedDistance(point: Vector3): number {
    return Vector3.calculateDotProduct(point, this.normal) - this.distance
  }
}

export const isPlane = (collider: Collider): collider is Plane => {
  return collider.type === 'plane'
}
