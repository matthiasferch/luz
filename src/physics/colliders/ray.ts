import { vec3 } from '../../vectors'
import { Collider } from '../collider'

export class Ray extends Collider {

  type = Collider.Type.Ray

  readonly origin: Readonly<vec3>

  readonly direction: Readonly<vec3>

  constructor({
    origin = vec3.zero,
    direction = vec3.up
  }) {
    super()

    this.origin = origin.copy()
    this.direction = direction.copy().normalize()
  }

  toJSON() {
    const { origin, direction } = this

    return { origin, direction }
  }

}
