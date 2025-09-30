import { Collider, CollisionDispatcher, Sphere } from '@luz/physics'
import { Serializable, Serialize } from '@luz/utilities'
import { vec3 } from '@luz/vectors'
import { Body } from './components/body'
import { Entity } from './entity'
import { CollisionManifold } from '@luz/physics/collision'

const timestep: number = 1000 / 60

const velocityIterations: number = 8
const positionIterations: number = 8

const contactRestVelocity: number = 0.001
const penetrationTolerance: number = 0.0005
const positionCorrectionFactor: number = 0.2

export class Scene extends Serializable {
  @Serialize()
  readonly gravity: vec3

  @Serialize()
  readonly friction: number = 0.6

  @Serialize()
  readonly restitution: number = 0.2

  @Serialize(Entity)
  readonly entities: Record<string, Entity> = {}

  @Serialize(Collider)
  readonly colliders: Record<string, Collider> = {}

  readonly collisionManifolds: CollisionManifold[] = []

  private collisionDispatcher: CollisionDispatcher

  private elapsedTime: number = 0

  constructor() {
    super()

    this.gravity = new vec3([0, -9.81, 0])

    this.collisionDispatcher = new CollisionDispatcher()
  }

  static async deserialize(data: Partial<Scene>) {
    return (await super.deserialize(data)) as Scene
  }

  update(deltaTime: number) {
    const entities = Object.values(this.entities)

    this.elapsedTime += deltaTime

    // transform bodies
    entities.forEach((entity) => {
      Object.values(entity.bodies).forEach((body) => {
        body.applyTransform(entity)
      })
    })

    while (this.elapsedTime >= timestep) {
      const bodies = entities.reduce((acc: Body[], entity) => {
        return [...acc, ...Object.values(entity.bodies)]
      }, [])

      this.applyGravity(bodies)

      entities.forEach((entity) => {
        entity.fixedUpdate(timestep)
      })

      this.solveCollisions(bodies)

      this.elapsedTime -= timestep
    }

    // variable update
    entities.forEach((entity) => {
      entity.update(deltaTime)
    })
  }

  private solveCollisions(bodies: Body[]) {
    for (let iteration = 0; iteration < velocityIterations; iteration++) {
      this.detectCollisions(bodies)

      if (this.collisionManifolds.length === 0) {
        break
      }

      this.resolveVelocities()
    }

    for (let iteration = 0; iteration < positionIterations; iteration++) {
      this.detectCollisions(bodies)

      if (this.collisionManifolds.length === 0) {
        break
      }

      const applied = this.resolvePositions()

      if (!applied) {
        break
      }
    }
  }

  private applyGravity(bodies: Body[]) {
    bodies.forEach((body) => {
      body.force.add(vec3.scale(this.gravity, body.mass))
    })
  }

  private detectCollisions(bodies: Body[]) {
    this.collisionManifolds.length = 0 // Reset the collisions array for each frame

    for (let i = 0; i < bodies.length; i++) {
      const b1 = bodies[i]

      for (let j = i + 1; j < bodies.length; j++) {
        const b2 = bodies[j]

        const collisions = this.collisionDispatcher.dispatch(b1.volume, b2.volume)

        if (collisions && collisions.length > 0) {
          this.collisionManifolds.push({
            bodies: [b1, b2],
            collisions
          })
        }
      }
    }

    bodies.forEach((body) => {
      const colliders = Object.values(this.colliders)

      colliders.forEach((collider) => {
        const collisions = this.collisionDispatcher.dispatch(body.volume, collider)

        if (collisions && collisions.length > 0) {
          this.collisionManifolds.push({
            bodies: [body, null],
            collisions
          })
        }
      })
    })
  }

  private resolveVelocities() {
    this.collisionManifolds.forEach(({ bodies, collisions }) => {
      const [b1, b2] = bodies // b1 is dynamic, b2 could be null (static geometry)

      collisions.forEach(({ contact, normal: collisionNormal, distance }) => {
        const r1 = vec3.subtract(contact, b1.volume.center, new vec3()) // Vector from b1's center of mass to contact point

        const normal = collisionNormal.copy()
        const directionToOther = b2
          ? vec3.subtract(b2.volume.center, b1.volume.center, new vec3())
          : r1.copy(new vec3())

        if (directionToOther.length > 0 && vec3.dot(normal, directionToOther) < 0) {
          normal.scale(-1)
        }

        const contactVelocity1 = vec3.add(
          b1.linearVelocity,
          vec3.cross(b1.angularVelocity, r1, new vec3()),
          new vec3()
        )

        const contactVelocity2 = b2
          ? vec3.add(
            b2.linearVelocity,
            vec3.cross(b2.angularVelocity, vec3.subtract(contact, b2.volume.center, new vec3()), new vec3()),
            new vec3()
          )
          : null

        // Calculate relative velocity at the contact point
        const relativeVelocity = contactVelocity2
          ? vec3.subtract(contactVelocity2, contactVelocity1, new vec3())
          : vec3.subtract(vec3.zero, contactVelocity1, new vec3())

        // Decompose relative velocity into normal and tangential components
        const velocityAlongNormal = vec3.dot(relativeVelocity, normal)

        if (velocityAlongNormal > 0) {
          return // Bodies are moving apart, no need to resolve the collision
        }

        const tangent = vec3.subtract(relativeVelocity, vec3.scale(normal, velocityAlongNormal, new vec3()))
        const tangentLength = tangent.length
        const tangentDirection = tangentLength > 0 ? tangent.normalize() : vec3.zero

        // Calculate restitution impulse (only along the normal direction)
        const impulseScalar = -(1.0 + this.restitution) * velocityAlongNormal

        const inverseMass1 = b1.mass > 0 ? 1.0 / b1.mass : 0
        const inverseMass2 = b2 ? (b2.mass > 0 ? 1.0 / b2.mass : 0) : 0

        const totalInverseMass = inverseMass1 + inverseMass2

        if (totalInverseMass === 0) {
          return // No response needed if both bodies are static
        }

        if (Math.abs(velocityAlongNormal) < contactRestVelocity && distance <= penetrationTolerance) {
          return
        }

        // Calculate impulse for the normal direction
        const normalImpulse = vec3.scale(normal, impulseScalar / totalInverseMass, new vec3())

        if (inverseMass1 > 0) {
          b1.linearVelocity.subtract(vec3.scale(normalImpulse, inverseMass1, new vec3()))
        }

        if (b2 && inverseMass2 > 0) {
          b2.linearVelocity.add(vec3.scale(normalImpulse, inverseMass2, new vec3()))
        }

        // --- Simplified Rolling Without Slipping ---

        if (b1.volume instanceof Sphere && tangentLength > 0) {
          const normalImpulseMagnitude = normalImpulse.length
          const maxFrictionImpulse = this.friction * normalImpulseMagnitude
          const desiredFrictionImpulse = Math.min(tangentLength / totalInverseMass, maxFrictionImpulse)

          if (desiredFrictionImpulse > 0) {
            const frictionImpulse = vec3.scale(tangentDirection, -desiredFrictionImpulse, new vec3())

            if (inverseMass1 > 0) {
              b1.linearVelocity.subtract(vec3.scale(frictionImpulse, inverseMass1, new vec3()))
            }

            if (b2 && inverseMass2 > 0) {
              b2.linearVelocity.add(vec3.scale(frictionImpulse, inverseMass2, new vec3()))
            }

            const sphereRadius = b1.volume.radius

            if (sphereRadius > 0) {
              const tangentialVelocity = vec3.subtract(
                b1.linearVelocity,
                vec3.scale(normal, vec3.dot(b1.linearVelocity, normal), new vec3()),
                new vec3()
              )
              const tangentialSpeed = tangentialVelocity.length

              const contactRadiusSq = r1.squaredLength

              if (tangentialSpeed > 0 && contactRadiusSq > 0) {
                const rollingAngularVelocity = vec3
                  .cross(r1, tangentialVelocity, new vec3())
                  .scale(-1 / contactRadiusSq)
                b1.angularVelocity.set(rollingAngularVelocity)
              }
            }
          }
        }

        // --- End of Rolling Calculation ---
      })
    })
  }

  private resolvePositions(): boolean {
    let appliedCorrection = false

    this.collisionManifolds.forEach(({ bodies, collisions }) => {
      const [b1, b2] = bodies

      collisions.forEach(({ normal, distance }) => {
        const inverseMass1 = b1.mass > 0 ? 1.0 / b1.mass : 0
        const inverseMass2 = b2 ? (b2.mass > 0 ? 1.0 / b2.mass : 0) : 0
        const totalInverseMass = inverseMass1 + inverseMass2

        if (totalInverseMass === 0) {
          return
        }

        const correctedDistance = Math.max(distance - penetrationTolerance, 0)

        if (correctedDistance <= 0) {
          return
        }

        const correctionMagnitude = (correctedDistance * positionCorrectionFactor) / totalInverseMass
        const correction = vec3.scale(normal, correctionMagnitude, new vec3())

        if (inverseMass1 > 0) {
          b1.applyPositionCorrection(vec3.scale(correction, inverseMass1, new vec3()))
          appliedCorrection = true
        }

        if (b2 && inverseMass2 > 0) {
          b2.applyPositionCorrection(vec3.scale(correction, -inverseMass2, new vec3()))
          appliedCorrection = true
        }
      })
    })

    return appliedCorrection
  }
}
