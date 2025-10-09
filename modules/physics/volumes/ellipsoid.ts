import { Transform } from '@luz/core'
import { Serialize, Register } from '@luz/utilities'
import { mat3, vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'

// General ellipsoid with three semi-axes radius along local X, Y, Z.
@Register()
export class Ellipsoid extends Volume {
  readonly type: Collider.Type = 'Ellipsoid'

  @Serialize()
  readonly radius: vec3 // [a, b, c] along local X, Y, Z

  // World-space unit axes corresponding to local X, Y, Z
  readonly axes: vec3[]

  constructor({ origin = vec3.zero, radius = vec3.one } = {}) {
    super({ origin })

    this.radius = radius.copy()
    this.axes = vec3.axes.map((axis) => axis.copy())
  }

  applyTransform(transform: Transform) {
    const { translation, rotation } = transform

    // Update the center of the ellipsoid
    vec3.add(this.origin, translation, this.center)

    // Rotate the local axes into world space
    vec3.axes.forEach((axis, index) => {
      rotation.transformVec3(axis, this.axes[index]).normalize()
    })
  }

  calculateInverseInertia(mass: number, transform: Transform) {
    const { rotationMatrix } = transform
    const { x: a, y: b, z: c } = this.radius

    // Principal moments of inertia for a solid ellipsoid (about principal axes)
    const Ixx = (1 / 5) * mass * (b * b + c * c)
    const Iyy = (1 / 5) * mass * (a * a + c * c)
    const Izz = (1 / 5) * mass * (a * a + b * b)

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

  // Effective radius along a given world-space direction.
  effectiveRadius(direction: vec3): number {
    const { x: ax, y: ay, z: az } = this.radius

    // Components of direction along local axes
    const dx = vec3.dot(direction, this.axes[0])
    const dy = vec3.dot(direction, this.axes[1])
    const dz = vec3.dot(direction, this.axes[2])

    const len2 = dx * dx + dy * dy + dz * dz
    if (len2 === 0) return 0

    const invR2 = (dx * dx) / (ax * ax) + (dy * dy) / (ay * ay) + (dz * dz) / (az * az)
    return Math.sqrt(len2) / Math.sqrt(invR2)
  }
}

export const isEllipsoid = (collider: Collider): collider is Ellipsoid => {
  return collider.type === 'Ellipsoid'
}