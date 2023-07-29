import { vec3 } from '@luz/vectors'

import { Collider } from '../collider'
import { Collision } from '../collision'
import { Transform } from '../transform'
import { Sphere } from './sphere'
import { collideRayWithCuboid, collideRayWithPlane, collideRayWithRay, collideRayWithSphere } from '../collisions/ray'
import { Plane } from './plane'
import { Cuboid } from './cuboid'

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

  collide(collider: Collider, t1: Transform, t2: Transform): Collision | null {
    if (collider instanceof Ray) {
      return collideRayWithRay(this, collider, t1, t2)
    }

    if (collider instanceof Plane) {
      return collideRayWithPlane(this, collider, t1, t2)
    }

    if (collider instanceof Sphere) {
      return collideRayWithSphere(this, collider, t1, t2)
    }

    if (collider instanceof Cuboid) {
      return collideRayWithCuboid(this, collider, t1, t2)
    }

    return null
  }

  transform(transform: Transform) {
    const { modelMatrix, rotationMatrix } = transform

    const origin = modelMatrix.transformVec3(this.origin)
    const direction = rotationMatrix.transform(this.direction)

    return new Ray({ origin, direction })
  }

}
