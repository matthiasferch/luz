import { vec3 } from '@luz/vectors'

import { Body } from './body'
import { Collision } from './collision'

export class World {

  private bodies: Body[] = []

  private collisions: Required<Collision>[] = []

  private readonly gravity = new vec3([0, -9.81, 0])

  update(deltaTime: number) {
    this.applyGravity()

    this.detectCollisions()
    this.resolveCollisions()

    this.updateBodies(deltaTime)
  }

  private applyGravity() {
    this.bodies.forEach((body) => {
      body.force.add(vec3.scale(this.gravity, body.mass))
    })
  }

  private detectCollisions() {
    this.collisions.length = 0

    this.bodies.forEach((b1) => {
      this.bodies.forEach((b2) => {
        if (b1 === b2) {
          return
        }

        const collision = b1.collider.collide(
          b2.collider, 
          b1.transform, 
          b2.transform
        )

        if (collision) {
          this.collisions.push({
            ...collision,
            bodies: [b1, b2]
          })
        }
      })
    })
  }

  private resolveCollisions() {
    this.collisions.forEach((collision) => {
      const [b1, b2] = collision.bodies

      const d = vec3.subtract(b2.velocity, b1.velocity)
      const n = vec3.dot(d, collision.normal)

      const m1 = 1.0 / b1.mass
      const m2 = 1.0 / b2.mass

      if (n >= 0) {
        return
      }

      const j = -1.0 * n / (m1 + m2)
      const impulse = vec3.scale(collision.normal, j)

      b1.velocity.subtract(vec3.scale(impulse, m1))
      b2.velocity.add(vec3.scale(impulse, m2))
    })
  }

  private updateBodies(deltaTime: number) {
    this.bodies.forEach((body) => {
      body.velocity.add(vec3.scale(body.force, body.mass).scale(deltaTime))
      body.transform.translation.add(vec3.scale(body.velocity, deltaTime))

      body.force.reset()
    })
  }

}