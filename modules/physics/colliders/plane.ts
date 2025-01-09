import { Serialize, RegisterClass } from '@luz/utilities'
import { vec3 } from '@luz/vectors'
import { Collider } from '../collider'

@RegisterClass
export class Plane extends Collider {
  type: Collider.Type = 'Plane'

  @Serialize()
  readonly normal: vec3

  @Serialize()
  readonly distance: number

  constructor({ normal = vec3.up, distance = 0 } = {}) {
    super()

    this.normal = normal.copy()

    this.distance = distance
  }

  signedDistance(point: vec3): number {
    return vec3.dot(point, this.normal) - this.distance
  }
}
