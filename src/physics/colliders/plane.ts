import { vec3 } from '../../vectors'
import { Collider } from '../collider'

export class Plane extends Collider {

  type = Collider.Type.Plane

  readonly normal: Readonly<vec3>

  readonly distance: number

  constructor({
    normal = vec3.up,
    distance = 0
  } = {}) {
    super()

    this.normal = normal.copy()

    this.distance = distance
  }

  toJSON() {
    const { normal, distance } = this

    return { normal, distance }
  }

}
