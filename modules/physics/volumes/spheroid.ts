import { Transform } from '@luz/core'
import { Serialize, Register } from '@luz/utilities'
import { vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'

// A spheroid (ellipsoid of revolution) with equatorial radius a and polar radius c.
@Register()
export class Spheroid extends Volume {
  readonly type: Collider.Type = 'Spheroid'

  @Serialize()
  readonly equatorialRadius: number // a (applies to local X and Y)

  @Serialize()
  readonly polarRadius: number // c (applies to local Z)

  // Oriented axes (world-space unit basis vectors of the local X/Y/Z)
  readonly axes: vec3[]

  constructor({ origin = vec3.zero, equatorialRadius = 1.0, polarRadius = 1.0 } = {}) {
    super({ origin })

    this.equatorialRadius = equatorialRadius
    this.polarRadius = polarRadius

    this.axes = vec3.axes.map((axis) => axis.copy())
  }

  applyTransform(transform: Transform) {
    const { translation, rotation } = transform

    // Update center
    vec3.add(this.origin, translation, this.center)

    // Update oriented axes
    vec3.axes.forEach((axis, index) => {
      rotation.transformVec3(axis, this.axes[index]).normalize()
    })
  }

  calculateInverseInertia(mass: number, transform: Transform) {
    const { rotationMatrix } = transform
    const a = this.equatorialRadius
    const c = this.polarRadius

    // Principal moments for a solid spheroid (a = b != c)
    const Ixx = (1 / 5) * mass * (a * a + c * c)
    const Iyy = (1 / 5) * mass * (a * a + c * c)
    const Izz = (2 / 5) * mass * (a * a)

    this.inverseInertia.set([Ixx, 0, 0, 0, Iyy, 0, 0, 0, Izz])
    this.inverseInertia.multiply(rotationMatrix).invert()
  }

  // Returns effective radius along a world-space direction (not necessarily normalized)
  effectiveRadius(direction: vec3): number {
    const a = this.equatorialRadius
    const c = this.polarRadius

    // Project direction into local axes (world -> local components along axes)
    const dx = vec3.dot(direction, this.axes[0])
    const dy = vec3.dot(direction, this.axes[1])
    const dz = vec3.dot(direction, this.axes[2])

    // If direction is zero, radius is zero
    const len2 = dx * dx + dy * dy + dz * dz
    if (len2 === 0) return 0

    // Effective radius for axis-aligned ellipsoid along direction d:
    // r = |d| / sqrt((dx^2/a^2) + (dy^2/a^2) + (dz^2/c^2))
    const invR2 = (dx * dx) / (a * a) + (dy * dy) / (a * a) + (dz * dz) / (c * c)
    return Math.sqrt(len2) / Math.sqrt(invR2)
  }
}

