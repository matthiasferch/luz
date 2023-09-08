import { Transform } from '@luz/core'
import { vec3, vec4 } from '@luz/vectors'
import { Collider } from '../collider'

export class Plane extends Collider {

  type = Collider.Type.Plane

  readonly equation: vec4

  constructor({
    equation = vec4.up
  } = {}) {
    super()

    this.equation = equation.copy()
  }

  transform(transform: Transform) {
    const { inverseTransposeMatrix } = transform

    const equation = inverseTransposeMatrix.transform(this.equation)
  }

  get normal() {
    const { equation } = this

    return new vec3([
      equation.x, 
      equation.y, 
      equation.z
    ]).normalize()
  }

  toJSON() {
    const { equation } = this

    return { equation }
  }

}
