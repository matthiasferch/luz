import { Transform } from '@luz/core'
import { Serialize, Register } from '@luz/utilities'
import { vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'

// General ellipsoid with three semi-axes radii along local X, Y, Z.
@Register()
export class Ellipsoid extends Volume {
  readonly type: Collider.Type = 'Ellipsoid'

  @Serialize()
  readonly radii: vec3 // [a, b, c] along local X, Y, Z

  // World-space unit axes corresponding to local X, Y, Z
  readonly axes: vec3[]

  constructor({ origin = vec3.zero, radii = vec3.one } = {}) {
    super({ origin })

    this.radii = radii.copy()
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
    const { x: a, y: b, z: c } = this.radii

    // Principal moments of inertia for a solid ellipsoid
    const Ixx = (1 / 5) * mass * (b * b + c * c)
    const Iyy = (1 / 5) * mass * (a * a + c * c)
    const Izz = (1 / 5) * mass * (a * a + b * b)

    this.inverseInertia.set([Ixx, 0, 0, 0, Iyy, 0, 0, 0, Izz])
    this.inverseInertia.multiply(rotationMatrix).invert()
  }

  // Effective radius along a given world-space direction.
  effectiveRadius(direction: vec3): number {
    const { x: ax, y: ay, z: az } = this.radii

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

