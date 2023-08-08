import { Transform } from '@luz/core'
import { vec3 } from '@luz/vectors'

import { collideCuboidWithCuboid } from '../collisions/cuboid'
import { collidePlaneWithCuboid } from '../collisions/plane'
import { Collider } from '../collider'
import { collideRayWithCuboid } from '../collisions/ray'
import { collideSphereWithCuboid } from '../collisions/sphere'
import { Collision } from '../collision'
import { Plane } from './plane'
import { Ray } from './ray'
import { Sphere } from './sphere'

export class Cuboid extends Collider {

  readonly center: vec3
  readonly extents: vec3

  constructor({
    center = vec3.zero,
    extents = vec3.one
  } = {}) {
    super()

    this.center = center.copy()
    this.extents = extents.copy()
  }

  collide(collider: Collider): Collision | null {
    if (collider instanceof Ray) {
      return collideRayWithCuboid(collider, this)
    }

    if (collider instanceof Plane) {
      return collidePlaneWithCuboid(collider, this)
    }

    if (collider instanceof Sphere) {
      return collideSphereWithCuboid(collider, this)
    }

    if (collider instanceof Cuboid) {
      return collideCuboidWithCuboid(this, collider)
    }

    return null
  }

  transform(transform: Transform) {
    const { translation, rotationMatrix } = transform

    const center = this.center.copy().add(translation);
    const extents = rotationMatrix.transform(this.extents)

    return new Cuboid({ center, extents })
  }

}
