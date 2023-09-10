import { Collision, CollisionDispatcher } from '../physics'
import { vec3 } from '../vectors'
import { Body } from './components/body'
import { Entity } from './entity'

export class Scene {

  readonly gravity: vec3

  readonly entities: Record<string, Entity> = {}

  readonly collisions: Required<Collision>[] = []

  private collisionDispatcher: CollisionDispatcher

  private elapsedTime: number = 0

  private readonly timestep: number = 1000 / 60

  constructor() {
    this.gravity = new vec3([0, -9.81, 0])

    this.collisionDispatcher = new CollisionDispatcher()
  }

  update(deltaTime: number) {
    const entities = Object.values(this.entities)

    this.elapsedTime += deltaTime

    // prepare bodies
    entities.forEach((entity) => {
      entity.bodies.forEach((body) => {
        body.prepare(entity)
      })
    })

    while (this.elapsedTime >= this.timestep) {
      const bodies = entities.reduce((bodies: Body[], entity) => {
        return [...bodies, ...entity.bodies]
      }, [])

      this.updatePhysics(bodies)

      // fixed update
      entities.forEach((entity) => {
        entity.fixedUpdate(this.timestep)
      })

      this.elapsedTime -= this.timestep
    }

    // variable update
    entities.forEach((entity) => {
      entity.update(deltaTime)
    })
  }

  private updatePhysics(bodies: Body[]) {
    this.applyGravity(bodies)
    this.detectCollisions(bodies)

    this.resolveCollisions(0.9, 0.2)
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

        const collision = this.collide(b1, b2)

        if (collision) {
          this.collisions.push({
            ...collision,
            bodies: [b1, b2]
          })
        }
      })
    })
  }

  private resolveCollisions(friction: number, restitution: number) {
    this.collisions.forEach(({ bodies, contact, normal }) => {
      const [b1, b2] = bodies

      const v = vec3.subtract(b2.linearVelocity, b1.linearVelocity)

      const n = vec3.dot(v, normal)

      if (n >= 0) {
        return
      }

      const r = -(1.0 + restitution) * n

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
        const { volume } = body
        const { center } = volume

        const d = vec3.subtract(contact, center)

        body.angularVelocity.add(vec3.cross(d, i))
      })
    })
  }

  private collide(b1: Body, b2: Body) {
    const { volume: c1 } = b1
    const { volume: c2 } = b2

    return this.collisionDispatcher.dispatch(c1, c2)
  }

  toJSON() {
    const { gravity, entities } = this

    return { gravity, entities }
  }

}