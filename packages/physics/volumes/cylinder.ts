import type { Transform } from '@luz/core'
import { Pool, Serialize, Register } from '@luz/serialization'
import { Vector3 } from '@luz/math'
import type { Collider } from '../collider'
import { assertPositiveDimensions } from '../collider'
import { Volume } from '../volume'

const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 8
})

@Register('cylinder')
export class Cylinder extends Volume {
  readonly type = 'cylinder'

  @Serialize()
  readonly radius: number

  @Serialize()
  readonly height: number

  @Serialize()
  readonly axisIndex: number

  readonly axes: Vector3[]

  constructor({ origin = Vector3.createZero(), radius = 1.0, height = 2.0, axisIndex = 1 } = {}) {
    super({ origin })

    this.radius = radius
    this.height = height
    this.axisIndex = axisIndex

    if (!Number.isInteger(axisIndex) || axisIndex < 0 || axisIndex > 2) {
      throw new Error('Cylinder axisIndex must be 0, 1 or 2')
    }

    this.axes = Cylinder.createLocalBasis(this.axisIndex).map((axis) => axis.clone())

    this.validate()
  }

  validate(): void {
    super.validate()
    assertPositiveDimensions(this.radius, this.height)

    if (!Number.isInteger(this.axisIndex) || this.axisIndex < 0 || this.axisIndex > 2) {
      throw new Error('Cylinder axisIndex must be 0, 1 or 2')
    }

    Cylinder.createLocalBasis(this.axisIndex).forEach((axis, index) => this.axes[index].set(axis))
  }

  applyTransform(transform: Transform) {
    const { rotation } = transform

    this.updateCenter(transform)

    const localBasis = Cylinder.createLocalBasis(this.axisIndex)

    localBasis.forEach((axis, index) => {
      rotation.transformVector3(axis, this.axes[index]).normalize()
    })
  }

  calculateInverseInertia(mass: number, transform: Transform) {
    const radius = this.radius
    const height = this.height

    // Principal moments for a solid cylinder about its center.
    const axial = (1 / 2) * mass * (radius * radius)
    const radial = (1 / 12) * mass * (3 * radius * radius + height * height)

    const diagonal = [radial, radial, radial]

    diagonal[this.axisIndex] = axial

    const Ixx = diagonal[0]
    const Iyy = diagonal[1]
    const Izz = diagonal[2]

    this.setPrincipalInverseInertia([Ixx, Iyy, Izz], transform)
  }

  calculateEffectiveRadius(direction: Vector3): number {
    return vectors.runInScope(() => {
      const length = direction.magnitude

      if (length === 0) {
        return 0
      }

      const normalizedDirection = Vector3.scale(direction, 1 / length, vectors.acquire())
      const cylinderAxis = this.axes[2]
      const absoluteAxisProjection = Math.abs(Vector3.calculateDotProduct(normalizedDirection, cylinderAxis))
      const radialProjection = Math.sqrt(Math.max(0, 1 - absoluteAxisProjection * absoluteAxisProjection))
      const halfHeight = this.height / 2
      const effectiveUnitRadius = this.radius * radialProjection + halfHeight * absoluteAxisProjection

      return length * effectiveUnitRadius
    })
  }

  calculateSupportPoint(direction: Vector3): Vector3 {
    return vectors.runInScope(() => {
      const length = direction.magnitude

      if (length === 0) {
        return this.center.clone()
      }

      const normalizedDirection = Vector3.scale(direction, 1 / length, vectors.acquire())
      const axis = this.axes[2]
      const halfHeight = this.height / 2
      const axialDot = Vector3.calculateDotProduct(normalizedDirection, axis)
      const axialOffset = Vector3.scale(axis, axialDot >= 0 ? halfHeight : -halfHeight, vectors.acquire())
      const radialDirection = Vector3.subtract(
        normalizedDirection,
        Vector3.scale(axis, axialDot, vectors.acquire()),
        normalizedDirection
      )

      if (radialDirection.magnitude > 0) {
        radialDirection.normalize().scale(this.radius)
      }

      return Vector3.add(this.center, Vector3.add(axialOffset, radialDirection, axialOffset))
    })
  }

  private static createLocalBasis(axisIndex: number): Vector3[] {
    const basis = [Vector3.createRight(), Vector3.createUp(), Vector3.createForward()]

    if (axisIndex === 2) {
      return basis
    }

    const reordered = basis.slice()

    reordered[2] = basis[axisIndex]
    reordered[axisIndex] = basis[2]

    return reordered
  }
}

export const isCylinder = (collider: Collider): collider is Cylinder => {
  return collider.type === 'cylinder'
}
