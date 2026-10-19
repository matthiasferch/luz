import type { Transform } from '@luz/core'
import { Pool, Serialize } from '@luz/serialization'
import { Matrix3, Vector3 } from '@luz/math'
import { Collider } from './collider'

const unitAxes = Vector3.createAxes()

const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 8
})

export abstract class Volume extends Collider {
  @Serialize()
  protected readonly origin: Vector3 = Vector3.createZero()

  readonly center: Vector3
  readonly inverseInertia: Matrix3

  constructor({ origin = Vector3.createZero() } = {}) {
    super()

    this.origin = origin.clone()
    this.center = origin.clone()
    this.inverseInertia = new Matrix3()
  }

  serialize() {
    const { origin } = this

    return {
      ...super.serialize(),
      origin: origin.serialize()
    }
  }

  abstract applyTransform(transform: Transform): void

  abstract calculateInverseInertia(mass: number, transform: Transform): void

  abstract calculateSupportPoint(direction: Vector3): Vector3

  validate(): void {
    if (this.origin.xyz.some((value) => !Number.isFinite(value))) {
      throw new Error('Shape origin must be finite')
    }

    this.center.set(this.origin)
  }

  protected updateCenter(transform: Transform): void {
    transform.rotation.transformVector3(this.origin, this.center).add(transform.translation)
  }

  protected setPrincipalInverseInertia(moments: number[], transform: Transform): void {
    vectors.runInScope(() => {
      const axes = unitAxes.map((axis) => transform.rotation.transformVector3(axis, vectors.acquire()).normalize())

      this.inverseInertia.reset()

      for (let column = 0; column < 3; column++) {
        for (let row = 0; row < 3; row++) {
          this.inverseInertia[column * 3 + row] = axes.reduce(
            (sum, axis, index) => sum + (moments[index] > 0 ? (axis[row] * axis[column]) / moments[index] : 0),
            0
          )
        }
      }
    })
  }
}
