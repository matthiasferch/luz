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
import { Transform } from '../transform'

const { min, max } = Math

export class Cuboid extends Collider {

  readonly minimum: vec3
  readonly maximum: vec3

  constructor({
    minimum = vec3.one,
    maximum = vec3.one
  } = {}) {
    super()

    this.minimum = minimum.copy()
    this.maximum = maximum.copy()
  }

  collide(collider: Collider, t1: Transform, t2: Transform): Collision | null {
    if (collider instanceof Ray) {
      return collideRayWithCuboid(collider, this, t1, t2)
    }

    if (collider instanceof Plane) {
      return collidePlaneWithCuboid(collider, this, t1, t2)
    }

    if (collider instanceof Sphere) {
      return collideSphereWithCuboid(collider, this, t1, t2)
    }

    if (collider instanceof Cuboid) {
      return collideCuboidWithCuboid(this, collider, t1, t2)
    }

    return null
  }

  transform(transform: Transform) {
    const { modelMatrix } = transform

    const minimum = modelMatrix.transformVec3(this.minimum)
    const maximum = modelMatrix.transformVec3(this.maximum)

    return new Cuboid({
      minimum: new vec3([
        min(minimum.x, maximum.x),
        min(minimum.y, maximum.y),
        min(minimum.z, maximum.z)
      ]),
      maximum: new vec3([
        max(minimum.x, maximum.x),
        max(minimum.y, maximum.y),
        max(minimum.z, maximum.z)
      ])
    })
  }

}
