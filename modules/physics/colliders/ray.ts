import { Serialize, Register } from '@luz/utilities'
import { vec3 } from '@luz/vectors'
import { Collider } from '../collider'

@Register()
export class Ray extends Collider {
  type: Collider.Type = 'Ray'

  @Serialize()
  readonly origin: vec3 = vec3.zero

  @Serialize()
  readonly direction: vec3 = vec3.up

  constructor({ origin = vec3.zero, direction = vec3.up } = {}) {
    super()

    this.origin = origin.copy()
    this.direction = direction.copy().normalize()
  }
}

export const isRay = (collider: Collider): collider is Ray => {
  return collider.type === 'Ray'
}
