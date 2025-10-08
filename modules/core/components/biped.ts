import { Register } from '@luz/utilities'
import { quat } from '@luz/vectors'
import { Body } from './body'
import { Transform } from '../transform'
import { Component } from '../component'

@Register()
export class Biped extends Body {
  readonly type: Component.Type = 'Biped'
  // True when a contact exists below the biped this step
  onGround: boolean = false

  update(transform: Transform, deltaTime: number) {
    this.torque.reset()

    this.angularVelocity.reset()
    this.angularCorrection.reset()

    super.update(transform, deltaTime)

    const { yaw } = transform.rotation

    quat.fromEulerAngles(yaw, 0, 0, transform.rotation)
  }
}

export const isBipedComponent = (body: Body): body is Biped => {
  return body.type === 'Biped'
}
