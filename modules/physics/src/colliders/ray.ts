import { Transform } from '@luz/core'
import { vec3 } from '@luz/vectors'
import { Collider } from '../collider'

export class Ray extends Collider {

  type = Collider.Type.Ray

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

  transform(transform: Transform) {
    const { modelMatrix, rotationMatrix } = transform

    const origin = modelMatrix.transformVec3(this.origin)
    const direction = rotationMatrix.transform(this.direction)
  }

  toJSON() {
    const { origin, direction } = this

    return { origin, direction }
  }

}
