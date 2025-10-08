import { Volume } from '@luz/physics'
import { Serialize, Register } from '@luz/utilities'
import { quat, vec3 } from '@luz/vectors'
import { Component } from '../component'
import { Transform } from '../transform'

@Register()
export class Body extends Component {
  readonly type: Component.Type = 'Body'
  readonly timestep: Component.Timestep = 'Fixed'

  @Serialize()
  mass: number

  @Serialize()
  restitution: number = 0.2

  @Serialize()
  friction: number = 0.2

  @Serialize()
  volume: Volume

  readonly force: vec3
  readonly torque: vec3

  readonly linearVelocity: vec3
  readonly angularVelocity: vec3

  readonly angularCorrection: vec3

  private lastTransform: Transform | null = null

  constructor({ mass = 1.0 } = {}) {
    super()

    this.mass = mass

    this.force = vec3.zero.copy()
    this.torque = vec3.zero.copy()

    this.linearVelocity = vec3.zero.copy()
    this.angularVelocity = vec3.zero.copy()

    this.angularCorrection = vec3.zero.copy()
  }

  applyTransform(transform: Transform) {
    const { volume } = this

    volume.applyTransform(transform)

    this.lastTransform = transform
  }

  applyPositionCorrection(delta: vec3) {
    if (!this.lastTransform) {
      return
    }

    this.lastTransform.translation.add(delta)
    this.volume.applyTransform(this.lastTransform)
  }

  update(transform: Transform, deltaTime: number) {
    const { mass, volume } = this

    if (mass <= 0) {
      this.force.reset()
      this.torque.reset()

      this.linearVelocity.reset()
      this.angularVelocity.reset()

      volume.inverseInertia.reset()
      this.angularCorrection.reset()

      return
    }

    volume.calculateInverseInertia(mass, transform)

    this.integrateLinearVelocity(transform, deltaTime)
    this.integrateAngularVelocity(transform, deltaTime)
  }

  private integrateLinearVelocity(transform: Transform, deltaTime: number) {
    const acceleration = vec3.scale(this.force, 1 / this.mass)

    this.linearVelocity.add(acceleration.scale(deltaTime))

    transform.translation.add(vec3.scale(this.linearVelocity, deltaTime))

    this.volume.applyTransform(transform)

    this.force.reset()
  }

  private integrateAngularVelocity(transform: Transform, deltaTime: number) {
    const { inverseInertia } = this.volume

    const acceleration = inverseInertia.transform(this.torque)

    this.angularVelocity.add(acceleration.scale(deltaTime))

    const axis = vec3.normalize(this.angularVelocity)
    const angle = this.angularVelocity.length * deltaTime

    if (angle !== 0) {
      transform.rotation.multiply(quat.fromAxisAngle(axis, angle))
    }

    this.torque.reset()

    this.angularCorrection.reset()
  }
}

export const isBodyComponent = (component: Component): component is Body => {
  return component.type === 'Body' || component.type === 'Biped'
}

