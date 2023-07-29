import { vec4 } from '@luz/vectors'

import { collidePlaneWithCuboid, collidePlaneWithSphere } from '../collisions/plane'
import { Collider } from '../collider'
import { collideRayWithPlane } from '../collisions/ray'
import { Collision } from '../collision'
import { Cuboid } from './cuboid'
import { Ray } from './ray'
import { Sphere } from './sphere'
import { Transform } from '../transform'

export class Plane extends Collider {

  readonly equation: vec4

  constructor({
    equation = vec4.up
  } = {}) {
    super()

    this.equation = equation.copy()
  }

  collide(collider: Collider, t1: Transform, t2: Transform): Collision | null {
    if (collider instanceof Ray) {
      return collideRayWithPlane(collider, this, t1, t2)
    }

    if (collider instanceof Sphere) {
      return collidePlaneWithSphere(this, collider, t1, t2)
    }

    if (collider instanceof Cuboid) {
      return collidePlaneWithCuboid(this, collider, t1, t2)
    }

    return null
  }

  transform(transform: Transform) {
    const { inverseTransposeMatrix } = transform

    return new Plane({ 
      equation: inverseTransposeMatrix.transform(this.equation) 
    })
  }

}
