import { Register } from '@luz/serialization'
import { Quaternion } from '@luz/math'
import type { Transform } from '@luz/core'
import { Body } from './body'

@Register('biped')
export class Biped extends Body {
  readonly type = 'biped'

  isGrounded: boolean = false

  update(transform: Transform, deltaTime: number) {
    this.torque.reset()
    this.angularVelocity.reset()
    this.angularCorrection.reset()
    super.update(transform, deltaTime)

    const { yaw } = transform.rotation

    Quaternion.setFromEulerAngles(yaw, 0, 0, transform.rotation)
  }
}

export const isBiped = (body: Body): body is Biped => {
  return body.type === 'biped'
}
