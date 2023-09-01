import { Collision } from '@luz/physics'
import { vec3 } from '@luz/vectors'
import { Component } from './component'
import { Body } from './components/body'
import { Entity } from './entity'

export class Scene {

  readonly gravity = new vec3([0, -9.81, 0])

  readonly entities: Record<string, Entity> = {}

  readonly collisions: Required<Collision>[] = []

  update(deltaTime: number) {
    const entities = Object.values(this.entities)

    const components = entities.reduce((components: Component[], entity) => {
      return [...components, ...Object.values(entity.components)]
    }, [])

    const bodies = components.filter(({ type }) => {
      return type === Component.Type.Body
    }) as Body[]

    // bodies
    this.updateBodies(bodies)

    // entities
    entities.forEach((entity) => {
      entity.update(deltaTime)
    })
  }

  private updateBodies(bodies: Body[]) {
    this.applyGravity(bodies)

    this.detectCollisions(bodies)
    this.resolveCollisions()
  }

  private applyGravity(bodies: Body[]) {
    bodies.forEach((body) => {
      body.force.add(vec3.scale(this.gravity, body.mass))
    })
  }

  private detectCollisions(bodies: Body[]) {
    this.collisions.length = 0

    bodies.forEach((b1) => {
      bodies.forEach((b2) => {
        if (b1 === b2) {
          return
        }

        const { volume: c1 } = b1
        const { volume: c2 } = b2

        const collision = c1.collide(c2)

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
    const friction = 0.1
    const restitution = 0.2

    this.collisions.forEach(({ bodies, contact, normal }) => {
      const [b1, b2] = bodies

      const v = vec3.subtract(b2.linearVelocity, b1.linearVelocity)

      const n = vec3.dot(v, normal)

      if (n >= 0) {
        return
      }

      const r = -(1 + restitution) * n

      const m1 = 1.0 / b1.mass
      const m2 = 1.0 / b2.mass

      const m = m1 + m2

      const i = vec3.scale(normal, r / m)

      b1.linearVelocity.subtract(vec3.scale(i, m1))
      b2.linearVelocity.add(vec3.scale(i, m2))

      const t = vec3.subtract(v, vec3.scale(normal, n))
      const f = vec3.scale(t, -(m1 + m2) * friction)

      b1.linearVelocity.subtract(vec3.scale(f, m1))
      b2.linearVelocity.add(vec3.scale(f, m2))

      bodies.forEach((body) => {
        const { mass, volume } = body
  
        const d = vec3.subtract(contact, volume.center)
        const t = volume.calculateInertia(mass).invert()
  
        body.angularVelocity.add(t.transform(vec3.cross(d, i)))
      })
    })
  }

  toJSON() {
    const { gravity, entities } = this

    return { gravity, entities }
  }

}