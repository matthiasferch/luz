import type { Transform } from '@luz/core'
import { Pool, Serialize, Register } from '@luz/serialization'
import { Vector3 } from '@luz/math'
import type { Collider } from '../collider'
import { assertPositiveDimensions } from '../collider'
import { Volume } from '../volume'

const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 4
})

@Register('ellipsoid')
export class Ellipsoid extends Volume {
  readonly type = 'ellipsoid'

  @Serialize()
  readonly radius: Vector3

  readonly axes: Vector3[]

  constructor({ origin = Vector3.createZero(), radius = Vector3.createOne() } = {}) {
    super({ origin })

    this.radius = radius.clone()
    this.axes = Vector3.createAxes()

    this.validate()
  }

  validate(): void {
    super.validate()
    assertPositiveDimensions(...this.radius.xyz)
  }

  applyTransform(transform: Transform) {
    const { rotation } = transform

    this.updateCenter(transform)
    Vector3.createAxes(this.axes).forEach((axis) => {
      rotation.transformVector3(axis, axis).normalize()
    })
  }

  calculateInverseInertia(mass: number, transform: Transform) {
    const { x, y, z } = this.radius

    // Principal moments of inertia for a solid ellipsoid (about principal axes)
    const Ixx = (1 / 5) * mass * (y * y + z * z)
    const Iyy = (1 / 5) * mass * (x * x + z * z)
    const Izz = (1 / 5) * mass * (x * x + y * y)

    this.setPrincipalInverseInertia([Ixx, Iyy, Izz], transform)
  }

  calculateEffectiveRadius(direction: Vector3): number {
    const { x: ax, y: ay, z: az } = this.radius

    const dx = Vector3.calculateDotProduct(direction, this.axes[0])
    const dy = Vector3.calculateDotProduct(direction, this.axes[1])
    const dz = Vector3.calculateDotProduct(direction, this.axes[2])

    return Math.sqrt((dx * ax) ** 2 + (dy * ay) ** 2 + (dz * az) ** 2)
  }

  calculateSupportPoint(direction: Vector3): Vector3 {
    return vectors.runInScope(() => {
      const extent = this.calculateEffectiveRadius(direction)
      const point = this.center.clone()

      if (extent > 0) {
        const contribution = vectors.acquire()

        this.axes.forEach((axis, index) =>
          point.add(
            Vector3.scale(
              axis,
              (this.radius[index] ** 2 * Vector3.calculateDotProduct(direction, axis)) / extent,
              contribution
            )
          )
        )
      }

      return point
    })
  }
}

export const isEllipsoid = (collider: Collider): collider is Ellipsoid => {
  return collider.type === 'ellipsoid'
}
