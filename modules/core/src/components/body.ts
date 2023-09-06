import { Volume } from '@luz/physics'
import { quat, vec3 } from '@luz/vectors'
import { Component } from '../component'
import { Transform } from '../transform'

export class Body extends Component {

  type = Component.Type.Body

  timestep = Component.Timestep.Fixed

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

  update(transform: Transform, deltaTime: number) {
    const { mass, volume } = this

    volume.calculateInertia(mass, transform)

    this.integrateLinearVelocity(transform, deltaTime)
    this.integrateAngularVelocity(transform, deltaTime)
  }

  toJSON() {
    const { mass, volume, force, torque, linearVelocity, angularVelocity } = this

    return { ...super.toJSON(), mass, volume, force, torque, linearVelocity, angularVelocity }
  }

  private integrateLinearVelocity(transform: Transform, deltaTime: number) {
    const acceleration = vec3.scale(this.force, this.mass)

    this.linearVelocity.add(acceleration.scale(deltaTime))

    transform.translation.add(vec3.scale(this.linearVelocity, deltaTime))

    this.force.reset()
  }

  private integrateAngularVelocity(transform: Transform, deltaTime: number) {
    const { inertia } = this.volume

    const acceleration = inertia.transform(this.torque)

    this.angularVelocity.add(acceleration.scale(deltaTime));

    const axis = vec3.normalize(this.angularVelocity)
    const angle = this.angularVelocity.length * deltaTime

    transform.rotation.multiply(quat.fromAxisAngle(axis, angle))

    this.torque.reset()
  }

}