import { Transform } from '@luz/core'
import { vec4 } from '@luz/vectors'

import { collidePlaneWithCuboid, collidePlaneWithSphere } from '../collisions/plane'
import { Collider } from '../collider'
import { collideRayWithPlane } from '../collisions/ray'
import { Collision } from '../collision'
import { Cuboid } from './cuboid'
import { Ray } from './ray'
import { Sphere } from './sphere'

export class Plane extends Collider {

  readonly equation: vec4

  constructor({
    equation = vec4.up
  } = {}) {
    super()

    this.equation = equation.copy()
  }

  collide(collider: Collider): Collision | null {
    if (collider instanceof Ray) {
      return collideRayWithPlane(collider, this)
    }

    if (collider instanceof Sphere) {
      return collidePlaneWithSphere(this, collider)
    }

    if (collider instanceof Cuboid) {
      return collidePlaneWithCuboid(this, collider)
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
