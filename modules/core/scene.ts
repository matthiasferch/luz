import { Collider, CollisionDispatcher } from '@luz/physics'
import { AABB, sweepAndPrunePairs, sweepAndPrunePairsAB, AABBEntry } from '@luz/physics/broadphase'
import { Serializable, Serialize } from '@luz/utilities'
import { vec3 } from '@luz/vectors'
import { Body } from './components/body'
import { Biped } from './components/biped'
import { Entity } from './entity'
import { CollisionManifold } from '@luz/physics/collision'
import { Component } from './component'

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
    const entities = Object.values(this.entities)

    this.elapsedTime += deltaTime

    let steps = 0

    // transform bodies
    entities.forEach((entity) => {
      Object.values(entity.components).forEach((component) => {
        if (isBodyComponent(component)) {
          component.applyTransform(entity)
        }
      })
    })

    while (this.elapsedTime >= FRAME_RATE && steps++ < STEP_COUNT) {
      const components = entities.reduce((components: Component[], entity) => {
        return [...components, ...Object.values(entity.components)]
      }, [])

      const bodies = components.filter((component) => {
        return isBodyComponent(component)
      }) as Body[]

      this.applyGravity(bodies)
      this.applyDamping(bodies, FRAME_RATE)

      // fixed update
      entities.forEach((entity) => {
        entity.fixedUpdate(FRAME_RATE)
      })

      this.solveCollisions(bodies)

      this.elapsedTime -= FRAME_RATE
    }

    // variable update
    entities.forEach((entity) => {
      entity.update(deltaTime)
    })
  }

  private solveCollisions(bodies: Body[]) {
    // Reset onGround for all bipeds before solving
    (bodies.filter((b): b is Biped => b.type === 'Biped') as Biped[]).forEach((b) => {
      b.onGround = false
    })

    // Velocity phase (positions fixed). Cache broadphase once across iterations.
    const velocityBroadphase = this.buildBroadphaseCache(bodies)
    for (let iteration = 0; iteration < velocityIterations; iteration++) {
      this.detectCollisions(bodies, velocityBroadphase)
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

  private detectCollisions(bodies: Body[], cache?: {
    bodySorted: Array<AABBEntry<Body>>
    finiteSorted: Array<AABBEntry<Collider>>
    infinite: Collider[]
  }) {
    this.collisionManifolds.length = 0

    // Prepare or use cache
    const bodySorted: Array<AABBEntry<Body>> = cache?.bodySorted ?? bodies
      .map((body) => ({ item: body, aabb: AABB.fromVolume(body.volume) }))
      .sort((a, b) => a.aabb.minX - b.aabb.minX)

    const allColliders = Object.values(this.colliders)

    const finiteSorted: Array<AABBEntry<Collider>> = cache?.finiteSorted ?? allColliders
      .map((c) => ({ item: c, aabb: AABB.fromCollider(c) }))
      .filter((e): e is AABBEntry<Collider> => !!e.aabb)
      .sort((a, b) => a.aabb.minX - b.aabb.minX)

    const infinite: Collider[] = cache?.infinite ?? allColliders.filter((c) => AABB.fromCollider(c) === null)

    // Broadphase: pairs
    const bodyPairs: Array<[Body, Body]> = sweepAndPrunePairs(bodySorted)
    const colliderPairs: Array<[Body, Collider]> = sweepAndPrunePairsAB(bodySorted, finiteSorted)
    // Add body pairs with infinite colliders
    const colliderPairsWithInfinite: Array<[Body, Collider]> = []
    for (const be of bodySorted) {
      for (const ic of infinite) colliderPairsWithInfinite.push([be.item, ic])
    }

    // Narrowphase
    let manifoldCount = 0
    for (const [b1, b2] of bodyPairs) {
      if (b1 === b2) continue
      const collisions = this.collisionDispatcher.dispatch(b1.volume, b2.volume)
      if (collisions && collisions.length > 0) {
        this.collisionManifolds.push({ bodies: [b1, b2], collisions })
        manifoldCount++
      }
    }
    for (const [b, c] of colliderPairs) {
      const collisions = this.collisionDispatcher.dispatch(b.volume, c)
      if (collisions && collisions.length > 0) {
        this.collisionManifolds.push({ bodies: [b, null], collisions })
        manifoldCount++
      }
    }
    for (const [b, c] of colliderPairsWithInfinite) {
      const collisions = this.collisionDispatcher.dispatch(b.volume, c)
      if (collisions && collisions.length > 0) {
        this.collisionManifolds.push({ bodies: [b, null], collisions })
        manifoldCount++
      }
    }

    // Debug stats
    this.lastBroadphaseStats = {
      bodies: bodies.length,
      colliders: allColliders.length,
      candidateBodyPairs: bodyPairs.length,
      candidateBodyColliderPairs: colliderPairs.length + colliderPairsWithInfinite.length,
      manifolds: manifoldCount,
    }
    // If needed, timing can be measured by users from outside using Date.now()
  }

  private buildBroadphaseCache(bodies: Body[]): {
    bodySorted: Array<AABBEntry<Body>>
    finiteSorted: Array<AABBEntry<Collider>>
    infinite: Collider[]
  } {
    const bodySorted: Array<AABBEntry<Body>> = bodies
      .map((body) => ({ item: body, aabb: AABB.fromVolume(body.volume) }))
      .sort((a, b) => a.aabb.minX - b.aabb.minX)

    const allColliders = Object.values(this.colliders)
    const finite: Array<AABBEntry<Collider>> = []
    const infinite: Collider[] = []
    for (const c of allColliders) {
      const aabb = AABB.fromCollider(c)
      if (aabb) finite.push({ item: c, aabb })
      else infinite.push(c)
    }
    const finiteSorted = finite.sort((a, b) => a.aabb.minX - b.aabb.minX)

    return { bodySorted, finiteSorted, infinite }
  }

  // Stable per-pair normal orientation (shared by both solvers)
  private orientNormalForPair(
    nIn: vec3,
    contact: vec3,
    b1: Body,
    b2: Body | null
  ): vec3 {
    const n = nIn.copy()
    const r1 = vec3.subtract(contact, b1.volume.center, new vec3())
    if (b2) {
      const c12 = vec3.subtract(b2.volume.center, b1.volume.center, new vec3())
      if (vec3.dot(n, c12) < 0) n.scale(-1)
    } else {
      if (vec3.dot(n, r1) < 0) n.scale(-1)
    }
    return n
  }

  private resolveVelocities() {
    this.collisionManifolds.forEach(({ bodies, collisions }) => {
      const [b1, b2] = bodies

      collisions.forEach(({ contact, normal: collisionNormal, distance }) => {
        const normal = this.orientNormalForPair(collisionNormal, contact, b1, b2)

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
          chosenNormal = this.orientNormalForPair(nIn, contact, b1, b2)
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
