import { Transform } from '@luz/core'
import { vec3, vec4 } from '@luz/vectors'
import { Collider } from '../collider'
import { Collision } from '../collision'
import { collidePlaneWithCuboid, collidePlaneWithSphere } from '../collisions/plane'
import { collideRayWithPlane } from '../collisions/ray'
import { Cuboid } from '../volumes/cuboid'
import { Sphere } from '../volumes/sphere'
import { Ray } from './ray'

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

  get normal() {
    const { equation } = this

    return new vec3([equation.x, equation.y, equation.z]).normalize()
  }

  toJSON() {
    const { equation } = this

    return { equation }
  }

}
