import { Collider, CollisionDispatcher, Sphere } from '@luz/physics'
import { Serializable, Serialize } from '@luz/utilities'
import { vec3 } from '@luz/vectors'
import { Body } from './components/body'
import { Entity } from './entity'
import { CollisionManifold } from '@luz/physics/collision'

export class Scene extends Serializable {
  @Serialize()
  readonly gravity: vec3

  @Serialize(Entity)
  readonly entities: Record<string, Entity> = {}

  @Serialize(Collider)
  readonly colliders: Record<string, Collider> = {}

  readonly collisionManifolds: CollisionManifold[] = []

  private collisionDispatcher: CollisionDispatcher

  private elapsedTime: number = 0

  private readonly timestep: number = 1000 / 60

  constructor() {
    super()

    this.gravity = new vec3([0, -9.81, 0])

    this.collisionDispatcher = new CollisionDispatcher()
  }

  update(deltaTime: number) {
    const entities = Object.values(this.entities)

    this.elapsedTime += deltaTime

    // transform bodies
    entities.forEach((entity) => {
      Object.values(entity.bodies).forEach((body) => {
        body.transform(entity)
      })
    })

    while (this.elapsedTime >= this.timestep) {
      const bodies = entities.reduce((bodies: Body[], entity) => {
        return [...bodies, ...Object.values(entity.bodies)]
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

    this.resolveCollisions(0.0, 0.4)
  }

  private applyGravity(bodies: Body[]) {
    bodies.forEach((body) => {
      body.force.add(vec3.scale(this.gravity, body.mass))
    })
  }

  private detectCollisions(bodies: Body[]) {
    this.collisionManifolds.length = 0 // Reset the collisions array for each frame

    bodies.forEach((b1) => {
      bodies.forEach((b2) => {
        if (b1 === b2) return // Skip self-collision

        // Get the collision manifold from the dispatcher
        const collisions = this.collisionDispatcher.dispatch(b1.volume, b2.volume)

        if (collisions && collisions.length > 0) {
          this.collisionManifolds.push({
            bodies: [b1, b2],
            collisions
          })
        }
      })
    })

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

  private resolveCollisions(friction: number, restitution: number) {
    this.collisionManifolds.forEach(({ bodies, collisions }) => {
      const [b1, b2] = bodies // b1 is dynamic, b2 could be null (static geometry)

      collisions.forEach(({ contact, normal, distance }) => {
        const r1 = vec3.subtract(contact, b1.volume.center) // Vector from b1's center of mass to contact point

        // Calculate relative velocity at the contact point
        const relativeVelocity = vec3.subtract(
          b2
            ? vec3.add(b2.linearVelocity, vec3.cross(b2.angularVelocity, vec3.subtract(contact, b2.volume.center)))
            : vec3.zero,
          vec3.add(b1.linearVelocity, vec3.cross(b1.angularVelocity, r1))
        )

        // Decompose relative velocity into normal and tangential components
        const velocityAlongNormal = vec3.dot(relativeVelocity, normal)

        if (b2 && velocityAlongNormal > 0) {
          return // Bodies are moving apart, no need to resolve the collision
        }

        const tangent = vec3.subtract(relativeVelocity, vec3.scale(normal, velocityAlongNormal))
        const tangentLength = tangent.length
        const tangentDirection = tangentLength > 0 ? tangent.normalize() : vec3.zero

        // Calculate restitution impulse (only along the normal direction)
        const impulseScalar = -(1.0 + restitution) * velocityAlongNormal

        const inverseMass1 = b1.mass > 0 ? 1.0 / b1.mass : 0
        const inverseMass2 = b2 ? (b2.mass > 0 ? 1.0 / b2.mass : 0) : 0

        const totalInverseMass = inverseMass1 + inverseMass2

        if (totalInverseMass === 0) {
          return // No response needed if both bodies are static
        }

        // Calculate impulse for the normal direction
        const normalImpulse = vec3.scale(normal, impulseScalar / totalInverseMass)

        // Apply linear impulse to b1 (if dynamic)
        if (inverseMass1 > 0) {
          b1.linearVelocity.subtract(vec3.scale(normalImpulse, inverseMass1))
        }

        // Apply the linear impulse to b2 (if dynamic)
        if (b2 && inverseMass2 > 0) {
          b2.linearVelocity.add(vec3.scale(normalImpulse, inverseMass2))
        }

        // --- Simplified Rolling Without Slipping ---

        // Apply friction impulse to reduce sliding and create rolling
        if (b1.volume instanceof Sphere && tangentLength > 0) {
          const frictionImpulseScalar = Math.min(friction * impulseScalar, tangentLength / totalInverseMass)
          const frictionImpulse = vec3.scale(tangentDirection, frictionImpulseScalar)

          if (inverseMass1 > 0) {
            b1.linearVelocity.subtract(vec3.scale(frictionImpulse, inverseMass1))
          }

          if (b2 && inverseMass2 > 0) {
            b2.linearVelocity.add(vec3.scale(frictionImpulse, inverseMass2))
          }

          // Calculate the angular velocity based on linear velocity for rolling without slipping
          const sphereRadius = b1.volume.radius // Assuming b1 is a sphere
          const linearVelocity = b1.linearVelocity.length

          // Apply angular velocity to match rolling condition: v = r * ω
          const rollingAngularVelocity = vec3
            .cross(normal, b1.linearVelocity)
            .normalize()
            .scale(linearVelocity / sphereRadius)
          b1.angularVelocity.set(rollingAngularVelocity)
        }

        // --- End of Rolling Calculation ---

        // Apply positional correction to prevent sinking/penetration (using distance)
        const correctionFactor = 0.8 // Tunable correction factor for positional adjustment
        const correction = vec3.scale(normal, (distance * correctionFactor) / totalInverseMass)

        if (inverseMass1 > 0) {
          b1.linearCorrection.add(vec3.scale(correction, inverseMass1))
        }

        if (b2 && inverseMass2 > 0) {
          b2.linearCorrection.subtract(vec3.scale(correction, inverseMass2)) // Move b2 in the opposite direction
        }
      })
    })
  }
}
