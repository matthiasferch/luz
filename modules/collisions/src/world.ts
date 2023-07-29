import { vec3 } from '@luz/vectors'

import { RigidBody } from './rigid-body'
import { Collision } from './collision'

export class World {

  private bodies: RigidBody[] = []

  private collisions: Required<Collision>[] = []

  private gravity = new vec3([0, -9.81, 0])

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

		this.bodies.forEach((a) => {
      this.bodies.forEach((b) => {
				if (a === b) {
          return
        }

				const collision = a.collider.collide(b.collider, a.transform, b.transform)

        if (collision) {
          this.collisions.push({ 
            ...collision, 
            bodies: [a, b] 
          })
        }
			})
		})
  }

  private resolveCollisions() {
    this.collisions.forEach((collision) => {
      const a = collision.bodies[0]
      const b = collision.bodies[1]

			const d = vec3.subtract(b.velocity, a.velocity)
			const n = vec3.dot(d, collision.normal)

			const m1 = 1.0 / a.mass
			const m2 = 1.0 / b.mass

      if (n >= 0) {
        return
      }

			const j = -1.0 * n / (m1 + m2)
			const impulse = vec3.scale(collision.normal, j)

			a.velocity.subtract(vec3.scale(impulse, m1))
			b.velocity.add(vec3.scale(impulse, m2))
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