import { Serialized } from '../../utilities'
import { vec3 } from '../../vectors'
import { Collider } from '../collider'

export class Plane extends Collider {

  type = Collider.Type.Plane

  @Serialized
  readonly normal: Readonly<vec3>

  @Serialized
  readonly distance: number

  constructor({
    normal = vec3.up,
    distance = 0
  } = {}) {
    super()

    this.normal = normal.copy()

    this.distance = distance
  }

}
