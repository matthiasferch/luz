import { Collider, CollisionDispatcher } from '@luz/physics'
import { BoundingBox, Broadphase, BroadphaseEntry } from '@luz/physics/broadphase'
import { Serializable, Serialize } from '@luz/utilities'
import { vec3 } from '@luz/vectors'
import { Body } from './components/body'
import { Biped } from './components/biped'
import { Entity } from './entity'
import { CollisionManifold } from '@luz/physics/collision'
import { Component } from './component'
import { BroadphaseCache } from '@luz/physics/broadphase/sweep'

const STEP_COUNT: number = 4
const FRAME_RATE: number = 1 / 60

const velocityIterations: number = 8
const positionIterations: number = 8

const contactRestVelocity: number = 0.002
const penetrationTolerance: number = 0.001

const positionCorrectionFactor: number = 0.25
const positionCorrectionPerStep: number = 0.005
// Additional clamp for static (body vs collider) resolution to avoid creep
const positionCorrectionPerStepStatic: number = 0.02
// Baumgarte factor to convert penetration depth into velocity bias
const baumgarteFactor: number = 0.2
// Consider surfaces with upward normal above this threshold as "ground".
// Express the threshold via a slope angle in degrees for easier tuning.
const groundMaxSlopeDegrees: number = 45 // degrees
const groundMinNormalY: number = Math.cos((groundMaxSlopeDegrees * Math.PI) / 180)
// Allow larger per-step separation for dynamic pairs involving a Biped
// (applied to the non-biped body), to reduce tunneling.
const bipedDynamicCorrectionPerStep: number = 0.02

const isBodyComponent = (component: Component): component is Body => {
  return component.type === 'Body' || component.type === 'Biped'
}

const isBiped = (body: Body): body is Biped => {
  return body.type === 'Biped'
}

export class Scene extends Serializable {
  @Serialize()
  readonly gravity: vec3

  @Serialize()
  readonly friction: number = 0.2

  @Serialize()
  readonly restitution: number = 0.2

  @Serialize()
  readonly linearDamping: number = 0.02

  @Serialize()
  readonly angularDamping: number = 0.05

  @Serialize(Entity)
  readonly entities: Record<string, Entity> = {}

  @Serialize(Collider)
  readonly colliders: Record<string, Collider> = {}

  readonly collisionManifolds: CollisionManifold[] = []

  private collisionDispatcher: CollisionDispatcher

  private elapsedTime: number = 0

  // Debug: last broadphase stats
  lastBroadphaseStats: {
    bodies: number
    colliders: number
    candidateBodyPairs: number
    candidateBodyColliderPairs: number
    manifolds: number
  } | null = null

  constructor() {
    super()
    this.gravity = new vec3([0, -9.81, 0])
    this.collisionDispatcher = new CollisionDispatcher()
  }

  static async deserialize(data: Partial<Scene>) {
    return (await super.deserialize(data)) as Scene
  }

  update(deltaTime: number) {
    // Gather entities for this frame
    const sceneEntities = Object.values(this.entities)

    // Accumulate time for fixed-step simulation
    this.elapsedTime += deltaTime

    let fixedStepsExecuted = 0

    // Update world-space transforms on body components before simulation
    sceneEntities.forEach((entity) => {
      Object.values(entity.components).forEach((component) => {
        if (isBodyComponent(component)) {
          component.applyTransform(entity)
        }
      })
    })

    // Fixed timestep simulation loop
    while (this.elapsedTime >= FRAME_RATE && fixedStepsExecuted++ < STEP_COUNT) {
      // Flatten components and collect dynamic bodies
      const components = sceneEntities.reduce((all: Component[], entity) => {
        return [...all, ...Object.values(entity.components)]
      }, [])

      const bodies = components.filter((component) => isBodyComponent(component)) as Body[]

      // Apply per-step forces and damping
      this.applyGravity(bodies)
      this.applyDamping(bodies, FRAME_RATE)

      // Allow components to run fixed updates (controllers, animations, etc.)
      sceneEntities.forEach((entity) => {
        entity.fixedUpdate(FRAME_RATE)
      })

      // Run collision detection and resolution for this step
      this.solveCollisions(bodies)

      // Consume one fixed frame worth of accumulated time
      this.elapsedTime -= FRAME_RATE
    }

    // Variable-rate updates
    sceneEntities.forEach((entity) => {
      entity.update(deltaTime)
    })
  }

  private solveCollisions(bodies: Body[]) {
    const bipeds = bodies.filter((body) => isBiped(body)) as Biped[]

    bipeds.forEach((biped) => biped.onGround = false)

    // Velocity phase (positions fixed). Cache broadphase once across iterations.
    const velocityBroadphaseCache = Broadphase.buildCache(bodies, Object.values(this.colliders))
    for (let iteration = 0; iteration < velocityIterations; iteration++) {
      // Broadphase + narrowphase populate collisionManifolds
      this.detectCollisions(bodies, velocityBroadphaseCache)
      if (this.collisionManifolds.length === 0) break
      this.updateBipedGroundState()
      this.resolveVelocities()
    }

    // Position phase
    for (let iteration = 0; iteration < positionIterations; iteration++) {
      // Positions may change each iteration; recompute broadphase per iteration
      this.detectCollisions(bodies)
      if (this.collisionManifolds.length === 0) break
      this.updateBipedGroundState()
      const applied = this.resolvePositions()
      if (!applied) break
    }
  }

  private applyGravity(bodies: Body[]) {
    const gravityForce = new vec3()
    bodies.forEach((body) => {
      if (body.mass <= 0) return
      vec3.scale(this.gravity, body.mass, gravityForce)
      body.force.add(gravityForce)
    })
  }

  private applyDamping(bodies: Body[], deltaTime: number) {
    const hasLinear = this.linearDamping > 0
    const hasAngular = this.angularDamping > 0
    if (!hasLinear && !hasAngular) return

    const linearFactor = hasLinear ? Math.exp(-this.linearDamping * deltaTime) : 1
    const angularFactor = hasAngular ? Math.exp(-this.angularDamping * deltaTime) : 1

    bodies.forEach((body) => {
      if (body.mass <= 0) return
      if (hasLinear) body.linearVelocity.scale(linearFactor)
      if (hasAngular) body.angularVelocity.scale(angularFactor)
    })
  }

  private detectCollisions(bodies: Body[], cache?: BroadphaseCache) {
    this.collisionManifolds.length = 0

    // Prepare or use cache
    const sortedBodyEntries: Array<BroadphaseEntry<Body>> = cache?.bodySorted ?? bodies
      .map((body) => ({ item: body, bounds: new BoundingBox(body.volume) }))
      .sort((a, b) => a.bounds.minimum.x - b.bounds.minimum.x)

    const allColliders = Object.values(this.colliders)

    const finiteColliders = allColliders.filter((c) => c.type !== 'Plane')
    const sortedFiniteColliderEntries: Array<BroadphaseEntry<Collider>> = cache?.finiteSorted ?? finiteColliders
      .map((c) => ({ item: c, bounds: new BoundingBox(c) }))
      .sort((a, b) => a.bounds.minimum.x - b.bounds.minimum.x)

    const infiniteColliders: Collider[] = cache?.infinite ?? allColliders.filter((c) => c.type === 'Plane')

    // Broadphase candidate pairs
    const candidateBodyPairs: Array<[Body, Body]> = Broadphase.findCandidatePairs(sortedBodyEntries)
    const candidateFiniteBodyColliderPairs: Array<[Body, Collider]> = Broadphase.findCandidatePairsAcrossSets(sortedBodyEntries, sortedFiniteColliderEntries)

    // Always-candidate body pairs with infinite colliders (e.g., planes)
    const candidateInfiniteBodyColliderPairs: Array<[Body, Collider]> = []
    for (const bodyEntry of sortedBodyEntries) {
      for (const infinite of infiniteColliders) candidateInfiniteBodyColliderPairs.push([bodyEntry.item, infinite])
    }

    // Narrowphase
    let totalManifoldCount = 0
    for (const [b1, b2] of candidateBodyPairs) {
      if (b1 === b2) continue
      const collisions = this.collisionDispatcher.dispatch(b1.volume, b2.volume)
      if (collisions && collisions.length > 0) {
        this.collisionManifolds.push({ bodies: [b1, b2], collisions })
        totalManifoldCount++
      }
    }
    for (const [b, c] of candidateFiniteBodyColliderPairs) {
      const collisions = this.collisionDispatcher.dispatch(b.volume, c)
      if (collisions && collisions.length > 0) {
        this.collisionManifolds.push({ bodies: [b, null], collisions })
        totalManifoldCount++
      }
    }
    for (const [b, c] of candidateInfiniteBodyColliderPairs) {
      const collisions = this.collisionDispatcher.dispatch(b.volume, c)
      if (collisions && collisions.length > 0) {
        this.collisionManifolds.push({ bodies: [b, null], collisions })
        totalManifoldCount++
      }
    }

    // Debug stats
    this.lastBroadphaseStats = {
      bodies: bodies.length,
      colliders: allColliders.length,
      candidateBodyPairs: candidateBodyPairs.length,
      candidateBodyColliderPairs: candidateFiniteBodyColliderPairs.length + candidateInfiniteBodyColliderPairs.length,
      manifolds: totalManifoldCount,
    }
    // If needed, timing can be measured by users from outside using Date.now()
  }



  private resolveVelocities() {
    this.collisionManifolds.forEach(({ bodies, collisions }) => {
      const [b1, b2] = bodies

      collisions.forEach(({ contact, normal: collisionNormal, distance }) => {
        const normal = Broadphase.orientNormalForPair(collisionNormal, contact, b1, b2)

        // Contact point offsets
        const r1 = vec3.subtract(contact, b1.volume.center, new vec3())
        const contactVelocity1 = vec3.add(
          b1.linearVelocity,
          vec3.cross(b1.angularVelocity, r1, new vec3()),
          new vec3()
        )

        const r2 = b2 ? vec3.subtract(contact, b2.volume.center, new vec3()) : null
        const contactVelocity2 = b2
          ? vec3.add(b2.linearVelocity, vec3.cross(b2.angularVelocity, r2!, new vec3()), new vec3())
          : null

        // Relative velocity
        const relativeVelocity = contactVelocity2
          ? vec3.subtract(contactVelocity2, contactVelocity1, new vec3())
          : vec3.subtract(vec3.zero, contactVelocity1, new vec3())

        const velocityAlongNormal = vec3.dot(relativeVelocity, normal)
        if (velocityAlongNormal > 0) return // separating

        // Tangent
        const tangent = vec3.subtract(relativeVelocity, vec3.scale(normal, velocityAlongNormal, new vec3()))
        const tangentLength = tangent.length
        const tangentDirection = tangentLength > 0 ? tangent.normalize() : vec3.zero

        const restitution = Math.abs(velocityAlongNormal) < contactRestVelocity ? 0 : this.restitution
        // Baumgarte positional bias to fight penetration creep
        const depth = Math.max(distance - penetrationTolerance, 0)
        const bias = (baumgarteFactor / FRAME_RATE) * depth

        const impulseScalar = Math.max(-((1.0 + restitution) * velocityAlongNormal) + bias, 0)

        // Mass/inertia
        // Treat Biped as immovable for dynamic collisions, but allow
        // normal impulses vs static colliders (b2 === null) to prevent tunneling.
        const b1IsBiped = b1.type === 'Biped'
        const b2IsBiped = b2 ? b2.type === 'Biped' : false
        const invMass1Base = b1.mass > 0 ? 1.0 / b1.mass : 0
        const invMass2Base = b2 ? (b2.mass > 0 ? 1.0 / b2.mass : 0) : 0
        const inverseMass1 = b1IsBiped && b2 ? 0 : invMass1Base
        const inverseMass2 = b2 ? (b2IsBiped ? 0 : invMass2Base) : 0
        const totalInverseMass = inverseMass1 + inverseMass2
        if (totalInverseMass === 0) return

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
        if (normalEffectiveMass <= 0) return

        const normalImpulseMagnitude = impulseScalar > 0 ? impulseScalar / normalEffectiveMass : 0
        if (normalImpulseMagnitude > 0) {
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
        }

        // Friction
        // --- Tangential Friction (stick–slip) ---
        if (tangentLength > 0) {
          const frictionEffectiveMass = computeEffectiveMass(tangentDirection)
          if (frictionEffectiveMass > 0) {
            // Desired impulse to zero tangential velocity (static attempt)
            let jt = -vec3.dot(relativeVelocity, tangentDirection) / frictionEffectiveMass

            const jn = Math.abs(normalImpulseMagnitude)
            const mu_s = this.friction * 1.5   // static friction coefficient (tune)
            const mu_d = this.friction         // dynamic friction coefficient

            // Clamp for stick or slip
            if (Math.abs(jt) <= mu_s * jn) {
              // Static friction: use exactly what's needed to stop tangential motion
              // (jt already computed)
            } else {
              // Dynamic friction: clamp to Coulomb bound
              jt = Math.sign(jt) * mu_d * jn
            }

            if (jt !== 0) {
              const frictionImpulse = vec3.scale(tangentDirection, jt, new vec3())

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

      })
    })
  }

  private resolvePositions(): boolean {
    let appliedCorrection = false

    // IMPORTANT: one correction per manifold (pair), using MAX penetration across contacts.
    this.collisionManifolds.forEach(({ bodies, collisions }) => {
      const [b1, b2] = bodies

      // Pick the deepest contact and a stable normal for the pair
      let maxDepth = 0
      let chosenNormal: vec3 | null = null
      let chosenContact: vec3 | null = null

      for (const { contact, normal: nIn, distance } of collisions) {
        const depth = Math.max(distance - penetrationTolerance, 0)
        if (depth > maxDepth) {
          maxDepth = depth
          chosenContact = contact
          // Orient normal deterministically
          chosenNormal = Broadphase.orientNormalForPair(nIn, contact, b1, b2)
        }
      }

      if (!chosenNormal || !chosenContact || maxDepth <= 0) {
        return
      }

      // For position correction:
      // - Do not move Biped in dynamic-dynamic pairs (let the other body move)
      // - Allow Biped to be corrected against static colliders (b2 === null)
      const b1IsBiped = b1.type === 'Biped'
      const b2IsBiped = b2 ? b2.type === 'Biped' : false

      const invMass1Base = b1.mass > 0 ? 1.0 / b1.mass : 0
      const invMass2Base = b2 ? (b2.mass > 0 ? 1.0 / b2.mass : 0) : 0

      const inverseMass1 = b1IsBiped && b2 ? 0 : invMass1Base
      const inverseMass2 = b2 ? (b2IsBiped ? 0 : invMass2Base) : 0
      const totalInverseMass = inverseMass1 + inverseMass2
      if (totalInverseMass === 0) return

      // Single correction for the pair
      let correctionMagnitude = (maxDepth * positionCorrectionFactor) / totalInverseMass

      // Clamp per-step correction. For biped-vs-dynamic pairs, scale the clamp so that the
      // non-biped body can move up to a fixed amount regardless of its mass.
      let perStepClamp = positionCorrectionPerStep
      // Allow larger correction for static pairs (body vs collider)
      if (!b2) {
        perStepClamp = Math.max(perStepClamp, positionCorrectionPerStepStatic)
      }
      if (b2 && b1IsBiped && inverseMass2 > 0) {
        // Ensure b2 can move up to bipedDynamicCorrectionPerStep this iteration
        perStepClamp = Math.max(perStepClamp, bipedDynamicCorrectionPerStep / inverseMass2)
      } else if (!b2 && b1IsBiped) {
        // biped vs static: keep default clamp
      } else if (b2IsBiped && inverseMass1 > 0) {
        // Ensure b1 can move up to bipedDynamicCorrectionPerStep this iteration
        perStepClamp = Math.max(perStepClamp, bipedDynamicCorrectionPerStep / inverseMass1)
      }
      if (correctionMagnitude > perStepClamp) {
        correctionMagnitude = perStepClamp
      }

      const correction = vec3.scale(chosenNormal, correctionMagnitude, new vec3())

      // Move b1 opposite n, b2 along n (same pairing as velocity impulses)
      if (inverseMass1 > 0) {
        b1.applyPositionCorrection(vec3.scale(correction, -inverseMass1, new vec3()))
        appliedCorrection = true
      }
      if (b2 && inverseMass2 > 0) {
        b2.applyPositionCorrection(vec3.scale(correction, +inverseMass2, new vec3()))
        appliedCorrection = true
      }
    })

    return appliedCorrection
  }

  private updateBipedGroundState() {
    // Mark bipeds as onGround only if contact is below center AND
    // the surface normal is sufficiently upward (not a wall).
    this.collisionManifolds.forEach(({ bodies, collisions }) => {
      const [b1, b2] = bodies
      const b1IsBiped = b1.type === 'Biped'
      const b2IsBiped = b2 ? b2.type === 'Biped' : false

      if (!b1IsBiped && !b2IsBiped) return

      collisions.forEach(({ contact, normal }) => {
        const isGroundish = normal.y >= groundMinNormalY
        if (b1IsBiped) {
          const r1 = vec3.subtract(contact, b1.volume.center, new vec3())
          if (r1.y < 0 && isGroundish) (b1 as Biped).onGround = true
        }
        if (b2 && b2IsBiped) {
          const r2 = vec3.subtract(contact, b2.volume.center, new vec3())
          if (r2.y < 0 && isGroundish) (b2 as Biped).onGround = true
        }
      })
    })
  }
}
