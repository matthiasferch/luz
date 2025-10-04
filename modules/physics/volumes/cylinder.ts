import { Transform } from '@luz/core'
import { Serialize, Register } from '@luz/utilities'
import { mat3, vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'

// Right circular cylinder oriented along local Z axis.
@Register()
export class Cylinder extends Volume {
  readonly type: Collider.Type = 'Cylinder'

  @Serialize()
  readonly radius: number

  @Serialize()
  readonly height: number // full height along axis

  // World-space unit axes corresponding to local X, Y, Z
  readonly axes: vec3[]

  constructor({ origin = vec3.zero, radius = 1.0, height = 2.0 } = {}) {
    super({ origin })

    this.radius = radius
    this.height = height

    this.axes = vec3.axes.map((axis) => axis.copy())
  }

  applyTransform(transform: Transform) {
    const { translation, rotation } = transform

    // Update center
    vec3.add(this.origin, translation, this.center)

    // Rotate local axes
    vec3.axes.forEach((axis, index) => {
      rotation.transformVec3(axis, this.axes[index]).normalize()
    })
  }

  calculateInverseInertia(mass: number, transform: Transform) {
    const { rotationMatrix } = transform
    const r = this.radius
    const h = this.height

    // Principal moments for a solid cylinder about its center (axis along local Z)
    const Ixx = (1 / 12) * mass * (3 * r * r + h * h)
    const Iyy = (1 / 12) * mass * (3 * r * r + h * h)
    const Izz = (1 / 2) * mass * (r * r)

    // Inverse in body space
    const invIxx = Ixx > 0 ? 1 / Ixx : 0
    const invIyy = Iyy > 0 ? 1 / Iyy : 0
    const invIzz = Izz > 0 ? 1 / Izz : 0
    const IbodyInv = new mat3([invIxx, 0, 0, 0, invIyy, 0, 0, 0, invIzz])

    // World-space inverse inertia: R * IbodyInv * R^T
    const Rt = rotationMatrix.copy().transpose()
    this.inverseInertia.reset()
    this.inverseInertia[0] = Rt[0]; this.inverseInertia[1] = Rt[1]; this.inverseInertia[2] = Rt[2]
    this.inverseInertia[3] = Rt[3]; this.inverseInertia[4] = Rt[4]; this.inverseInertia[5] = Rt[5]
    this.inverseInertia[6] = Rt[6]; this.inverseInertia[7] = Rt[7]; this.inverseInertia[8] = Rt[8]
    this.inverseInertia.multiply(IbodyInv)
    this.inverseInertia.multiply(rotationMatrix)
  }

  // Effective support radius along a world-space direction (not necessarily normalized).
  effectiveRadius(direction: vec3): number {
    const len = direction.length
    if (len === 0) return 0
    const n = vec3.scale(direction, 1 / len, new vec3())
    const a = this.axes[2] // cylinder axis (unit)
    const adot = Math.abs(vec3.dot(n, a))
    const radial = Math.sqrt(Math.max(0, 1 - adot * adot))
    const halfH = this.height / 2
    const rEffUnit = this.radius * radial + halfH * adot
    return len * rEffUnit
  }
}

