import { Transform } from '@luz/core'
import { vec3 } from '@luz/vectors'

import { Collider } from '../collider'
import { Collision } from '../collision'
import { collideRayWithSphere } from '../collisions/ray'
import { Ray } from './ray'
import { collidePlaneWithSphere } from '../collisions/plane'
import { Plane } from './plane'
import { Cuboid } from './cuboid'
import { collideSphereWithCuboid, collideSphereWithSphere } from '../collisions/sphere'

export class Sphere extends Collider {

  readonly center: vec3

  radius: number

  constructor({
    center = vec3.zero,
    radius = 1.0
  }) {
    super()

    this.center = center.copy()
    this.radius = radius
  }

  collide(collider: Collider, t1: Transform, t2: Transform): Collision | null {
    if (collider instanceof Ray) {
      return collideRayWithSphere(collider, this, t1, t2)
    }

    if (collider instanceof Plane) {
      return collidePlaneWithSphere(collider, this, t1, t2)
    }

    if (collider instanceof Sphere) {
      return collideSphereWithSphere(this, collider, t1, t2)
    }

    if (collider instanceof Cuboid) {
      return collideSphereWithCuboid(this, collider, t1, t2)
    }

    return null
  }

  transform(transform: Transform) {
    const { modelMatrix } = transform

    const center = modelMatrix.transformVec3(this.center)

    return new Sphere({ center, radius: this.radius })
  }

}
