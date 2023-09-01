import { Volume } from '@luz/physics'
import { vec3 } from '@luz/vectors'
import { Component } from '../component'

export class Body extends Component {

  readonly type = Component.Type.Body

  mass: number

  volume: Volume

  readonly force: vec3
  readonly torque: vec3

  readonly linearVelocity: vec3
  readonly angularVelocity: vec3

  constructor({
    mass = 1.0
  } = {}) {
    super()

    this.mass = mass

    this.force = vec3.zero.copy()
    this.torque = vec3.zero.copy()

    this.linearVelocity = vec3.zero.copy()
    this.angularVelocity = vec3.zero.copy()
  }

  toJSON() {
    const { mass, volume, force, torque, linearVelocity, angularVelocity } = this

    return { ...super.toJSON(), mass, volume, force, torque, linearVelocity, angularVelocity }
  }

}