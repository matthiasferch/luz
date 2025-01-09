import { Serialize, RegisterClass } from '@luz/utilities'
import { vec3 } from '@luz/vectors'
import { Collider } from '../collider'

@RegisterClass
export class Ray extends Collider {
  type: Collider.Type = 'Ray'

  @Serialize()
  readonly origin: vec3

  @Serialize()
  readonly direction: vec3

  constructor({ origin = vec3.zero, direction = vec3.up }) {
    super()

    this.origin = origin.copy()
    this.direction = direction.copy().normalize()
  }
}
