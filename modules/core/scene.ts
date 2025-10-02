import { Collider, CollisionDispatcher } from '@luz/physics'
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
  readonly friction: number = 0.2

  @Serialize()
  readonly restitution: number = 0.2

  @Serialize()
  readonly linearDamping: number = 0.001

  @Serialize()
  readonly angularDamping: number = 0.001

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

      this.applyDamping(bodies, timestep)

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

  private applyDamping(bodies: Body[], deltaTime: number) {
    const hasLinear = this.linearDamping > 0
    const hasAngular = this.angularDamping > 0

    if (!hasLinear && !hasAngular) {
      return
    }

    const linearFactor = hasLinear ? Math.exp(-this.linearDamping * deltaTime) : 1
    const angularFactor = hasAngular ? Math.exp(-this.angularDamping * deltaTime) : 1

    bodies.forEach((body) => {
      if (body.mass <= 0) {
        return
      }

      if (hasLinear) {
        body.linearVelocity.scale(linearFactor)
      }

      if (hasAngular) {
        body.angularVelocity.scale(angularFactor)
      }
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

        const r2 = b2 ? vec3.subtract(contact, b2.volume.center, new vec3()) : null

        const contactVelocity2 = b2
          ? vec3.add(
            b2.linearVelocity,
            vec3.cross(b2.angularVelocity, r2!, new vec3()),
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

        const inverseInertia1 = b1.volume.inverseInertia
        const inverseInertia2 = b2 ? b2.volume.inverseInertia : null

        const computeEffectiveMass = (direction: vec3) => {
          let denominator = totalInverseMass

          if (inverseMass1 > 0) {
            const r1CrossDir = vec3.cross(r1, direction, new vec3())
            const angularComponent1 = vec3.cross(inverseInertia1.transform(r1CrossDir, new vec3()), r1, new vec3())
            denominator += vec3.dot(angularComponent1, direction)
          }

          if (b2 && inverseMass2 > 0 && r2 && inverseInertia2) {
            const r2CrossDir = vec3.cross(r2, direction, new vec3())
            const angularComponent2 = vec3.cross(inverseInertia2.transform(r2CrossDir, new vec3()), r2, new vec3())
            denominator += vec3.dot(angularComponent2, direction)
          }

          return denominator
        }

        const normalEffectiveMass = computeEffectiveMass(normal)

        if (normalEffectiveMass <= 0) {
          return
        }

        const normalImpulseMagnitude = impulseScalar / normalEffectiveMass
        const normalImpulse = vec3.scale(normal, normalImpulseMagnitude, new vec3())

        if (inverseMass1 > 0) {
          b1.linearVelocity.subtract(vec3.scale(normalImpulse, inverseMass1, new vec3()))
          const angularImpulse1 = inverseInertia1.transform(vec3.cross(r1, normalImpulse, new vec3()), new vec3())
          b1.angularVelocity.subtract(angularImpulse1)
        }

        if (b2 && inverseMass2 > 0 && r2 && inverseInertia2) {
          b2.linearVelocity.add(vec3.scale(normalImpulse, inverseMass2, new vec3()))
          const angularImpulse2 = inverseInertia2.transform(vec3.cross(r2, normalImpulse, new vec3()), new vec3())
          b2.angularVelocity.add(angularImpulse2)
        }

        // --- Tangential Friction Response ---

        if (tangentLength > 0) {
          const frictionEffectiveMass = computeEffectiveMass(tangentDirection)

          if (frictionEffectiveMass > 0) {
            let frictionImpulseMagnitude = -vec3.dot(relativeVelocity, tangentDirection) / frictionEffectiveMass
            const maxFrictionImpulse = this.friction * Math.abs(normalImpulseMagnitude)
            frictionImpulseMagnitude = Math.max(-maxFrictionImpulse, Math.min(frictionImpulseMagnitude, maxFrictionImpulse))

            if (frictionImpulseMagnitude !== 0) {
              const frictionImpulse = vec3.scale(tangentDirection, frictionImpulseMagnitude, new vec3())

              if (inverseMass1 > 0) {
                b1.linearVelocity.subtract(vec3.scale(frictionImpulse, inverseMass1, new vec3()))
                const angularImpulse1 = inverseInertia1.transform(vec3.cross(r1, frictionImpulse, new vec3()), new vec3())
                b1.angularVelocity.subtract(angularImpulse1)
              }

              if (b2 && inverseMass2 > 0 && r2 && inverseInertia2) {
                b2.linearVelocity.add(vec3.scale(frictionImpulse, inverseMass2, new vec3()))
                const angularImpulse2 = inverseInertia2.transform(vec3.cross(r2, frictionImpulse, new vec3()), new vec3())
                b2.angularVelocity.add(angularImpulse2)
              }
            }
          }
        }

        // --- End of Tangential Response ---
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