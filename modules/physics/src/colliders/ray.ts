import { Transform } from '@luz/core'
import { vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Collision } from '../collision'
import { collideRayWithCuboid, collideRayWithPlane, collideRayWithRay, collideRayWithSphere } from '../collisions/ray'
import { Cuboid } from '../volumes/cuboid'
import { Sphere } from '../volumes/sphere'
import { Plane } from './plane'

export class Ray extends Collider {

  readonly origin: vec3
  readonly direction: vec3

  constructor({
    origin = vec3.zero,
    direction = vec3.up
  }) {
    super()

    this.origin = origin.copy()
    this.direction = direction.copy().normalize()
  }

  collide(collider: Collider): Collision | null {
    if (collider instanceof Ray) {
      return collideRayWithRay(this, collider)
    }

    if (collider instanceof Plane) {
      return collideRayWithPlane(this, collider)
    }

    if (collider instanceof Sphere) {
      return collideRayWithSphere(this, collider)
    }

    if (collider instanceof Cuboid) {
      return collideRayWithCuboid(this, collider)
    }

    return null
  }

  transform(transform: Transform) {
    const { modelMatrix, rotationMatrix } = transform

    const origin = modelMatrix.transformVec3(this.origin)
    const direction = rotationMatrix.transform(this.direction)

    return new Ray({ origin, direction })
  }

  toJSON() {
    const { origin, direction } = this

    return { origin, direction }
  }

}
