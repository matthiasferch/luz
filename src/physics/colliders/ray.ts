import { Serialized } from '../../utilities'
import { vec3 } from '../../vectors'
import { Collider } from '../collider'

export class Ray extends Collider {

  type = Collider.Type.Ray

  @Serialized
  readonly origin: Readonly<vec3>

  @Serialized
  readonly direction: Readonly<vec3>

  constructor({
    origin = vec3.zero,
    direction = vec3.up
  }) {
    super()

    this.origin = origin.copy()
    this.direction = direction.copy().normalize()
  }

}
