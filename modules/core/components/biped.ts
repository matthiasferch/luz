import { Serialize, Register } from '@luz/utilities'
import { quat, vec3 } from '@luz/vectors'
import { Body } from './body'
import { Transform } from '../transform'
import { Component } from '../component'

@Register()
export class Biped extends Body {
  readonly type: Component.Type = 'Biped'

  @Serialize()
  readonly kinetic: boolean = true

  @Serialize()
  readonly stepHeight: number = 0.3

  readonly desiredVelocity: vec3 = vec3.zero.copy()

  constructor({ mass = 0.0, kinetic = true, stepHeight = 0.3 } = {}) {
    super({ mass })

    this.kinetic = kinetic
    this.stepHeight = stepHeight
  }

  setVelocity(velocity: vec3) {
    velocity.copy(this.desiredVelocity)
  }

  applyMovement(direction: vec3, speed: number) {
    this.desiredVelocity.add(vec3.scale(direction, speed))
  }

  update(transform: Transform, deltaTime: number) {
    this.angularVelocity.reset()
    this.torque.reset()

    this.volume.inverseInertia.reset()

    if (this.kinetic) {
      // Ignore accumulated forces (gravity, etc.) for kinematic motion
      this.force.reset()

      // Simple stair stepping assist: lift slightly when moving horizontally
      const translation = vec3.scale(this.desiredVelocity, deltaTime, new vec3())
      const horizontalMovement = new vec3([translation.x, 0, translation.z])

      if (horizontalMovement.length > 0) {
        transform.translation.y += Math.min(this.stepHeight, horizontalMovement.length)
      }

      transform.translation.add(translation)

      // Keep upright (no pitch/roll)
      this.keepUpright(transform)

      // Apply to volume and record last transform for corrections
      this.applyTransform(transform)

      // Do not decay desired velocity; caller controls it
      return
    }

    // Non-kinematic fallback: basic linear integration without angular motion
    const acceleration = vec3.scale(this.force, 1 / Math.max(this.mass, 1e-6), new vec3())
    this.linearVelocity.add(vec3.scale(acceleration, deltaTime, new vec3()))

    transform.translation.add(vec3.scale(this.linearVelocity, deltaTime, new vec3()))

    this.force.reset()

    this.keepUpright(transform)
    this.applyTransform(transform)
  }

  private keepUpright(transform: Transform) {
    const { yaw } = transform.rotation

    quat.fromEulerAngles(yaw, 0, 0, transform.rotation)
  }
}
