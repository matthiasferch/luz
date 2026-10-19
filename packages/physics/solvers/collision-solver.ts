import { Matrix3, Quaternion, Vector3 } from '@luz/math'
import { Pool } from '@luz/serialization'
import type { CollisionManifold } from '../collision'
import type { Biped } from '../components/biped'
import type { Body } from '../components/body'

const isBiped = (body: Body): body is Biped => body.type === 'biped'

const penetrationTolerance: number = 0.0009
const groundedNormalThreshold: number = 0.7
const wakeImpulseThreshold: number = 0.05
const kinematicWakeVelocityThreshold: number = 0.01
const staticFrictionMultiplier: number = 1.25
const supportContactGracePeriod: number = 0.05

const groundSlopeThreshold: number = 45

const positionCorrectionFactor: number = 0.25

interface CachedContactImpulse {
  normalImpulse: number
  tangentImpulse: Vector3
  normal: Vector3
  anchor: Vector3
  otherAnchor: Vector3
  pair: string
  persistenceFrames: number
}

interface PreparedContact {
  firstBody: Body
  secondBody: Body | null
  firstMass: number
  secondMass: number
  firstOffset: Vector3
  secondOffset: Vector3 | null
  firstInertia: Matrix3
  secondInertia: Matrix3
  normal: Vector3
  tangent: Vector3
  bitangent: Vector3
  normalMass: number
  tangentMass: number
  bitangentMass: number
  tangentCoupling: number
  target: number
  dynamicFriction: number
  staticFriction: number
  impulse: CachedContactImpulse
  calculateRelativeVelocity(): Vector3
  hasWarmStarted: boolean
  isWakeOnImpactEnabled: boolean
}

export class CollisionSolver {
  readonly up = Vector3.createUp()

  private readonly vectors = new Pool({
    createObject: () => new Vector3(),

    resetObject: (vector) => vector.reset(),
    initialCapacity: 64
  })
  private readonly rotations = new Pool({
    createObject: () => new Quaternion(),

    resetObject: (rotation) => rotation.reset(),
    initialCapacity: 4
  })

  private wakeRevisions = new WeakMap<Body, number>()
  private quietTime = new WeakMap<Body, number>()
  private kinematicSupports = new WeakMap<Body, { velocity: Vector3; remainingTime: number }>()

  private calculateContactVelocity(body: Body, contact: Vector3): Vector3 {
    const offset = Vector3.subtract(contact, body.volume.center, this.vectors.acquire())

    return Vector3.add(
      body.linearVelocity,
      Vector3.calculateCrossProduct(body.angularVelocity, offset, this.vectors.acquire())
    )
  }

  finishStep(
    manifolds: readonly CollisionManifold[],
    bodies: Body[],
    deltaTime: number,
    supportedBodies = new Set<Body>()
  ): void {
    const neighbors = new Map<Body, Set<Body>>()
    const groundedBodies = new Set<Body>(supportedBodies)
    const observedKinematicSupports = new Map<Body, Vector3>()

    for (const body of bodies) {
      if (body.isDynamic) {
        neighbors.set(body, new Set())

        if (this.wakeRevisions.get(body) !== body.wakeRevision) {
          this.quietTime.set(body, 0)
        }

        this.wakeRevisions.set(body, body.wakeRevision)
      }
    }

    for (const manifold of manifolds) {
      const [firstBody, secondBody] = manifold.bodies

      if (secondBody && firstBody.isDynamic && secondBody.isDynamic) {
        neighbors.get(firstBody)?.add(secondBody)
        neighbors.get(secondBody)?.add(firstBody)
      }

      for (const collision of manifold.collisions) {
        this.vectors.runInScope(() => {
          const normal = collision.normal.copyTo(this.vectors.acquire())

          if ((!secondBody || !secondBody.isDynamic) && Vector3.calculateDotProduct(normal, this.up) < -0.7) {
            groundedBodies.add(firstBody)

            if (secondBody?.motionType === 'kinematic') {
              const velocity = this.calculateContactVelocity(secondBody, collision.point)
              const currentVelocity = observedKinematicSupports.get(firstBody)

              if (!currentVelocity || velocity.magnitude > currentVelocity.magnitude) {
                observedKinematicSupports.set(firstBody, velocity)
              }
            }
          }

          if (secondBody && !firstBody.isDynamic && Vector3.calculateDotProduct(normal, this.up) > 0.7) {
            groundedBodies.add(secondBody)

            if (firstBody.motionType === 'kinematic') {
              const velocity = this.calculateContactVelocity(firstBody, collision.point)
              const currentVelocity = observedKinematicSupports.get(secondBody)

              if (!currentVelocity || velocity.magnitude > currentVelocity.magnitude) {
                observedKinematicSupports.set(secondBody, velocity)
              }
            }
          }
        })
      }
    }

    for (const body of bodies) {
      if (!body.isDynamic) {
        continue
      }

      const observedVelocity = observedKinematicSupports.get(body)

      if (observedVelocity) {
        this.kinematicSupports.set(body, {
          velocity: observedVelocity,
          remainingTime: supportContactGracePeriod
        })
        continue
      }

      const support = this.kinematicSupports.get(body)

      if (!support) {
        continue
      }

      support.remainingTime -= deltaTime

      if (support.remainingTime <= 0) {
        this.kinematicSupports.delete(body)
      } else {
        groundedBodies.add(body)
      }
    }

    const visitedBodies = new Set<Body>()

    for (const body of neighbors.keys()) {
      if (visitedBodies.has(body)) {
        continue
      }

      const island: Body[] = []
      const pendingBodies = [body]

      while (pendingBodies.length) {
        const currentBody = pendingBodies.pop()!

        if (visitedBodies.has(currentBody)) {
          continue
        }

        visitedBodies.add(currentBody)
        island.push(currentBody)
        pendingBodies.push(...(neighbors.get(currentBody) ?? []))
      }

      const hasMovingKinematicSupport = island.some(
        (member) => (this.kinematicSupports.get(member)?.velocity.magnitude ?? 0) > kinematicWakeVelocityThreshold
      )
      const isQuiet =
        !hasMovingKinematicSupport &&
        island.some((member) => groundedBodies.has(member)) &&
        island.every((member) => member.linearVelocity.magnitude < 0.2 && member.angularVelocity.magnitude < 0.8)

      for (const member of island) {
        const elapsed = isQuiet ? (this.quietTime.get(member) ?? 0) + deltaTime : 0

        this.quietTime.set(member, elapsed)

        member.sleepFrames = Math.floor(elapsed / deltaTime)
      }

      if (isQuiet && island.every((member) => (this.quietTime.get(member) ?? 0) >= 0.3)) {
        island.forEach((member) => member.sleep())
      }
    }
  }
  private preparedContacts = new Map<object, PreparedContact>()
  private contactsByPair = new Map<string, Array<[string, CachedContactImpulse]>>()
  private nextContactId = 0
  get cachedContactCount(): number {
    return this.contactImpulseCache.size
  }

  get contactPersistence(): readonly number[] {
    return [...this.contactImpulseCache.values()].map((contact) => contact.persistenceFrames)
  }
  private contactImpulseCache: Map<string, CachedContactImpulse> = new Map()
  private supportContactCache: Map<string, CachedContactImpulse> = new Map()
  private activeContactKeys: Set<string> = new Set()
  private activeSupportContactKeys: Set<string> = new Set()
  private bodySupportIds: WeakMap<Body, number> = new WeakMap()
  private nextBodySupportId = 1

  private resolveBodySupportId(body: Body) {
    const existingId = this.bodySupportIds.get(body)

    if (existingId) {
      return existingId
    }

    const id = this.nextBodySupportId++

    this.bodySupportIds.set(body, id)

    return id
  }

  private quantizeSupportValue(value: number) {
    return Math.round(value * 100) / 100
  }

  private createSupportContactKey(manifoldId: string | undefined, contact: Vector3, normal: Vector3) {
    return [
      manifoldId ?? 'manifold',
      this.quantizeSupportValue(contact.x),
      this.quantizeSupportValue(contact.y),
      this.quantizeSupportValue(contact.z),
      this.quantizeSupportValue(normal.x),
      this.quantizeSupportValue(normal.y),
      this.quantizeSupportValue(normal.z)
    ].join(':')
  }

  private createFeaturePairSupportContactKey(
    manifold: Pick<CollisionManifold, 'id' | 'bodies'>,
    featurePairId: string
  ) {
    const [body, otherBody] = manifold.bodies

    if (!otherBody) {
      return `static-feature-pair:${this.resolveBodySupportId(body)}:${featurePairId}`
    }

    return `${manifold.id ?? 'manifold'}:feature-pair:${featurePairId}`
  }

  private isGroundedNormal(normal: Vector3) {
    return Math.abs(Vector3.calculateDotProduct(normal, this.up)) >= groundedNormalThreshold
  }

  private canUseFeaturePairSupportKey(
    manifold: Pick<CollisionManifold, 'bodies' | 'collisions' | 'isRestingContact' | 'contactType' | 'featurePairId'>,
    normal: Vector3
  ) {
    return !!manifold.featurePairId && this.isRestingSupportManifold(manifold, normal)
  }

  private createSupportKey(
    manifold: Pick<
      CollisionManifold,
      'id' | 'bodies' | 'collisions' | 'isRestingContact' | 'contactType' | 'featurePairId'
    >,
    contact: Vector3,
    normal: Vector3
  ) {
    return this.canUseFeaturePairSupportKey(manifold, normal)
      ? this.createFeaturePairSupportContactKey(manifold, manifold.featurePairId!)
      : this.createSupportContactKey(manifold.id, contact, normal)
  }

  private isRestingSupportManifold(
    manifold: Pick<CollisionManifold, 'bodies' | 'collisions' | 'isRestingContact' | 'contactType'>,
    normal: Vector3
  ) {
    return (
      manifold.isRestingContact === true &&
      manifold.contactType === 'patch' &&
      manifold.collisions.length > 1 &&
      this.isGroundedNormal(normal)
    )
  }

  collectStaticSupportBodies(manifolds: readonly CollisionManifold[]): Set<Body> {
    const supportedBodies = new Set<Body>()

    for (const manifold of manifolds) {
      const [firstBody, secondBody] = manifold.bodies

      for (const collision of manifold.collisions) {
        this.vectors.runInScope(() => {
          const normal = collision.normal.copyTo(this.vectors.acquire())

          if (
            (!secondBody || !secondBody.isDynamic) &&
            Vector3.calculateDotProduct(normal, this.up) < -groundedNormalThreshold
          ) {
            supportedBodies.add(firstBody)
          }

          if (
            secondBody &&
            !firstBody.isDynamic &&
            Vector3.calculateDotProduct(normal, this.up) > groundedNormalThreshold
          ) {
            supportedBodies.add(secondBody)
          }
        })
      }
    }

    return supportedBodies
  }

  private applyImpulse(
    body: Body | null,
    inverseMass: number,
    inverseInertia: Matrix3 | null,
    contactOffset: Vector3 | null,
    impulse: Vector3,
    direction: 'subtract' | 'add'
  ) {
    if (!body || inverseMass <= 0 || !contactOffset || !inverseInertia) {
      return
    }

    if (direction === 'subtract') {
      body.linearVelocity.subtract(Vector3.scale(impulse, inverseMass, this.vectors.acquire()))
      body.angularVelocity.subtract(
        inverseInertia.transform(
          Vector3.calculateCrossProduct(contactOffset, impulse, this.vectors.acquire()),
          this.vectors.acquire()
        )
      )

      return
    }

    body.linearVelocity.add(Vector3.scale(impulse, inverseMass, this.vectors.acquire()))
    body.angularVelocity.add(
      inverseInertia.transform(
        Vector3.calculateCrossProduct(contactOffset, impulse, this.vectors.acquire()),
        this.vectors.acquire()
      )
    )
  }

  beginVelocityFrame() {
    this.preparedContacts.clear()
    this.contactsByPair.clear()

    for (const entry of this.contactImpulseCache) {
      const pair = entry[1].pair
      const contacts = this.contactsByPair.get(pair) ?? []

      contacts.push(entry)
      this.contactsByPair.set(pair, contacts)
    }

    this.activeContactKeys.clear()
    this.activeSupportContactKeys.clear()
  }

  resetCachedContacts() {
    this.quietTime = new WeakMap()
    this.kinematicSupports = new WeakMap()

    this.preparedContacts.clear()
    this.contactsByPair.clear()

    this.wakeRevisions = new WeakMap()

    this.contactImpulseCache.clear()
    this.supportContactCache.clear()
    this.activeContactKeys.clear()
    this.activeSupportContactKeys.clear()
  }

  endVelocityFrame() {
    this.contactImpulseCache.forEach((_value, key) => {
      if (!this.activeContactKeys.has(key)) {
        this.contactImpulseCache.delete(key)
      }
    })
    this.supportContactCache.forEach((_value, key) => {
      if (!this.activeSupportContactKeys.has(key)) {
        this.supportContactCache.delete(key)
      }
    })
  }

  updateBipedGroundState(manifolds: readonly CollisionManifold[]): void {
    for (const manifold of manifolds) {
      const [firstBody, secondBody] = manifold.bodies

      for (const collision of manifold.collisions) {
        this.vectors.runInScope(() => {
          const normal = collision.normal.copyTo(this.vectors.acquire())
          const slope = Math.cos((groundSlopeThreshold * Math.PI) / 180)

          if (isBiped(firstBody) && Vector3.calculateDotProduct(normal, this.up) <= -slope) {
            firstBody.isGrounded = true
          }

          if (secondBody && isBiped(secondBody) && Vector3.calculateDotProduct(normal, this.up) >= slope) {
            secondBody.isGrounded = true
          }
        })
      }
    }
  }

  private prepareContacts(manifolds: readonly CollisionManifold[], isWarmStartEnabled: boolean): void {
    for (const manifold of manifolds) {
      const [firstBody, secondBody] = manifold.bodies
      const pair =
        this.resolveBodySupportId(firstBody) + ':' + (secondBody ? this.resolveBodySupportId(secondBody) : manifold.id)

      for (const collision of manifold.collisions) {
        if (this.preparedContacts.has(collision)) {
          continue
        }

        this.vectors.runInScope(() => {
          const normal = collision.normal.normalize()
          const anchor = firstBody.convertToLocalPoint(collision.point)
          const otherAnchor = secondBody ? secondBody.convertToLocalPoint(collision.point) : collision.point.clone()

          // Match each previous-frame contact at most once, in local coordinates.
          let match: [string, CachedContactImpulse] | undefined
          let separation = 0.03 * 0.03 * 2

          const anchorOffset = this.vectors.acquire()

          for (const entry of this.contactsByPair.get(pair) ?? []) {
            const [key, value] = entry

            if (
              value.pair !== pair ||
              this.activeContactKeys.has(key) ||
              Vector3.calculateDotProduct(value.normal, normal) < 0.98
            ) {
              continue
            }

            const error =
              Vector3.subtract(anchor, value.anchor, anchorOffset).squaredMagnitude +
              Vector3.subtract(otherAnchor, value.otherAnchor, anchorOffset).squaredMagnitude

            if (error < separation) {
              match = entry
              separation = error
            }
          }

          const key = match?.[0] ?? 'contact:' + this.nextContactId++
          const cachedImpulse = match?.[1]
          const impulse: CachedContactImpulse = {
            pair,
            anchor,
            otherAnchor,
            normal,
            normalImpulse: isWarmStartEnabled ? (cachedImpulse?.normalImpulse ?? 0) : 0,
            tangentImpulse: isWarmStartEnabled
              ? (cachedImpulse?.tangentImpulse.clone() ?? new Vector3())
              : new Vector3(),
            persistenceFrames: (cachedImpulse?.persistenceFrames ?? 0) + 1
          }

          impulse.tangentImpulse.subtract(
            Vector3.scale(normal, Vector3.calculateDotProduct(impulse.tangentImpulse, normal), this.vectors.acquire())
          )

          const firstOffset = Vector3.subtract(collision.point, firstBody.volume.center)
          const secondOffset = secondBody ? Vector3.subtract(collision.point, secondBody.volume.center) : null
          const firstMass = firstBody.inverseMass
          const secondMass = secondBody?.inverseMass ?? 0
          const firstInertia = firstBody.volume.inverseInertia
          const secondInertia = secondBody?.volume.inverseInertia ?? new Matrix3()
          const tangent = Vector3.calculateCrossProduct(
            normal,
            Math.abs(normal.x) < 0.7
              ? Vector3.createRight(this.vectors.acquire())
              : Vector3.createUp(this.vectors.acquire())
          ).normalize()
          const bitangent = Vector3.calculateCrossProduct(normal, tangent).normalize()
          const calculateEffectiveMass = (direction: Vector3) => {
            let value = firstMass + secondMass

            if (firstMass > 0) {
              const cross = Vector3.calculateCrossProduct(firstOffset, direction, this.vectors.acquire())

              value += Vector3.calculateDotProduct(cross, firstInertia.transform(cross, this.vectors.acquire()))
            }

            if (secondMass > 0 && secondOffset) {
              const cross = Vector3.calculateCrossProduct(secondOffset, direction, this.vectors.acquire())

              value += Vector3.calculateDotProduct(cross, secondInertia.transform(cross, this.vectors.acquire()))
            }

            return value > 0 ? 1 / value : 0
          }
          const tangentDenominator = 1 / calculateEffectiveMass(tangent)
          const bitangentDenominator = 1 / calculateEffectiveMass(bitangent)

          let coupling = 0

          if (firstMass > 0) {
            coupling += Vector3.calculateDotProduct(
              Vector3.calculateCrossProduct(firstOffset, tangent, this.vectors.acquire()),
              firstInertia.transform(
                Vector3.calculateCrossProduct(firstOffset, bitangent, this.vectors.acquire()),
                this.vectors.acquire()
              )
            )
          }

          if (secondMass > 0 && secondOffset) {
            coupling += Vector3.calculateDotProduct(
              Vector3.calculateCrossProduct(secondOffset, tangent, this.vectors.acquire()),
              secondInertia.transform(
                Vector3.calculateCrossProduct(secondOffset, bitangent, this.vectors.acquire()),
                this.vectors.acquire()
              )
            )
          }

          const determinant = tangentDenominator * bitangentDenominator - coupling * coupling
          const tangentMass =
            Number.isFinite(determinant) && determinant > 1e-12 ? bitangentDenominator / determinant : 0
          const bitangentMass =
            Number.isFinite(determinant) && determinant > 1e-12 ? tangentDenominator / determinant : 0
          const tangentCoupling = Number.isFinite(determinant) && determinant > 1e-12 ? -coupling / determinant : 0
          const calculateRelativeVelocity = () => {
            const velocity =
              secondBody && secondOffset
                ? Vector3.add(
                    secondBody.linearVelocity,
                    Vector3.calculateCrossProduct(secondBody.angularVelocity, secondOffset, this.vectors.acquire()),
                    this.vectors.acquire()
                  )
                : this.vectors.acquire()

            return velocity
              .subtract(firstBody.linearVelocity)
              .subtract(Vector3.calculateCrossProduct(firstBody.angularVelocity, firstOffset, this.vectors.acquire()))
          }
          const firstContactVelocity = Vector3.add(
            firstBody.linearVelocity,
            Vector3.calculateCrossProduct(firstBody.angularVelocity, firstOffset, this.vectors.acquire()),
            this.vectors.acquire()
          )
          const secondContactVelocity =
            secondBody && secondOffset
              ? Vector3.add(
                  secondBody.linearVelocity,
                  Vector3.calculateCrossProduct(secondBody.angularVelocity, secondOffset, this.vectors.acquire()),
                  this.vectors.acquire()
                )
              : this.vectors.acquire()

          if (
            firstBody.isSleeping &&
            secondBody?.motionType === 'kinematic' &&
            secondContactVelocity.magnitude > kinematicWakeVelocityThreshold
          ) {
            firstBody.wake()
          }

          if (
            secondBody?.isSleeping &&
            firstBody.motionType === 'kinematic' &&
            firstContactVelocity.magnitude > kinematicWakeVelocityThreshold
          ) {
            secondBody.wake()
          }

          const impactSpeed = Vector3.calculateDotProduct(calculateRelativeVelocity(), normal)
          const isRestingContact = this.isRestingSupportManifold(manifold, normal)
          const restitution =
            isRestingContact || impactSpeed > -0.5
              ? 0
              : Math.max(firstBody.restitution, secondBody?.restitution ?? firstBody.restitution)
          const supportKey = this.createSupportKey(manifold, collision.point, normal)
          const existingSupport = this.supportContactCache.get(supportKey)
          const supportFrames =
            (existingSupport?.persistenceFrames ?? 0) + (this.activeSupportContactKeys.has(supportKey) ? 0 : 1)

          this.supportContactCache.set(supportKey, { ...impulse, persistenceFrames: supportFrames })
          this.activeSupportContactKeys.add(supportKey)
          this.activeContactKeys.add(key)
          this.contactImpulseCache.set(key, impulse)

          const dynamicFriction = Math.sqrt(
            Math.max(0, firstBody.friction) * Math.max(0, secondBody?.friction ?? firstBody.friction)
          )

          this.preparedContacts.set(collision, {
            firstBody,
            secondBody,
            firstMass,
            secondMass,
            firstOffset,
            secondOffset,
            firstInertia,
            secondInertia,
            normal,
            tangent,
            bitangent,
            normalMass: calculateEffectiveMass(normal),
            tangentMass,
            bitangentMass,
            tangentCoupling,
            target: -restitution * Math.min(impactSpeed, 0),
            dynamicFriction,
            staticFriction: dynamicFriction * staticFrictionMultiplier,
            impulse,
            calculateRelativeVelocity,
            hasWarmStarted: false,
            isWakeOnImpactEnabled: impactSpeed < -0.2
          })
        })
      }
    }
  }

  solveVelocities(manifolds: readonly CollisionManifold[], deltaTime: number, isWarmStartEnabled = false): void {
    if (!Number.isFinite(deltaTime) || deltaTime <= 0) {
      throw new Error('Solver delta time must be positive and finite')
    }

    this.prepareContacts(manifolds, isWarmStartEnabled)

    for (const manifold of manifolds) {
      for (const collision of manifold.collisions) {
        this.vectors.runInScope(() => {
          const constraint = this.preparedContacts.get(collision)!
          const { firstBody, secondBody, normal, tangent, bitangent, impulse } = constraint
          const apply = (value: Vector3) => {
            this.applyImpulse(
              firstBody,
              constraint.firstMass,
              constraint.firstInertia,
              constraint.firstOffset,
              value,
              'subtract'
            )
            this.applyImpulse(
              secondBody,
              constraint.secondMass,
              constraint.secondInertia,
              constraint.secondOffset,
              value,
              'add'
            )
          }

          if (!constraint.hasWarmStarted) {
            apply(Vector3.scale(normal, impulse.normalImpulse, this.vectors.acquire()).add(impulse.tangentImpulse))

            constraint.hasWarmStarted = true
          }

          const velocity = constraint.calculateRelativeVelocity()
          const increment = (constraint.target - Vector3.calculateDotProduct(velocity, normal)) * constraint.normalMass
          const nextNormalImpulse = Math.max(0, impulse.normalImpulse + increment)
          const appliedNormalImpulse = nextNormalImpulse - impulse.normalImpulse

          impulse.normalImpulse = nextNormalImpulse

          if (constraint.isWakeOnImpactEnabled && Math.abs(appliedNormalImpulse) > wakeImpulseThreshold) {
            firstBody.wake()
            secondBody?.wake()
          }

          apply(Vector3.scale(normal, appliedNormalImpulse, this.vectors.acquire()))

          const slidingVelocity = constraint.calculateRelativeVelocity()
          const tangentSpeed = Vector3.calculateDotProduct(slidingVelocity, tangent),
            bitangentSpeed = Vector3.calculateDotProduct(slidingVelocity, bitangent)
          const nextTangent = impulse.tangentImpulse
            .copyTo(this.vectors.acquire())
            .add(
              Vector3.scale(
                tangent,
                -tangentSpeed * constraint.tangentMass - bitangentSpeed * constraint.tangentCoupling,
                this.vectors.acquire()
              )
            )
            .add(
              Vector3.scale(
                bitangent,
                -bitangentSpeed * constraint.bitangentMass - tangentSpeed * constraint.tangentCoupling,
                this.vectors.acquire()
              )
            )
          const staticLimit = constraint.staticFriction * impulse.normalImpulse

          if (nextTangent.magnitude > staticLimit) {
            const dynamicLimit = constraint.dynamicFriction * impulse.normalImpulse

            nextTangent.normalize().scale(dynamicLimit)
          }

          apply(Vector3.subtract(nextTangent, impulse.tangentImpulse, this.vectors.acquire()))
          impulse.tangentImpulse.set(nextTangent)
        })
      }
    }
  }

  solvePositions(
    manifolds: readonly CollisionManifold[],
    _supportedBodies = new Set<Body>(),
    changedBodies?: Set<Body>
  ): boolean {
    let didCorrectPositions = false

    for (const manifold of manifolds) {
      const [firstBody, secondBody] = manifold.bodies
      const firstMass = firstBody.inverseMass
      const secondMass = secondBody?.inverseMass ?? 0

      if (firstMass + secondMass === 0) {
        continue
      }

      for (const collision of manifold.collisions) {
        this.vectors.runInScope(() => {
          this.rotations.runInScope(() => {
            const depth = Math.max(0, collision.penetrationDepth - penetrationTolerance)

            if (depth < 1e-6) {
              return
            }

            const normal = collision.normal.copyTo(this.vectors.acquire()).normalize()
            const firstOffset = Vector3.subtract(collision.point, firstBody.volume.center, this.vectors.acquire())
            const secondOffset = secondBody
              ? Vector3.subtract(collision.point, secondBody.volume.center, this.vectors.acquire())
              : this.vectors.acquire()
            const firstCross = Vector3.calculateCrossProduct(firstOffset, normal, this.vectors.acquire()),
              secondCross = Vector3.calculateCrossProduct(secondOffset, normal, this.vectors.acquire())
            const firstAngular =
              firstMass > 0
                ? firstBody.volume.inverseInertia.transform(firstCross, this.vectors.acquire())
                : this.vectors.acquire()
            const secondAngular =
              secondMass > 0 && secondBody
                ? secondBody.volume.inverseInertia.transform(secondCross, this.vectors.acquire())
                : this.vectors.acquire()
            const denominator =
              firstMass +
              secondMass +
              Vector3.calculateDotProduct(firstCross, firstAngular) +
              Vector3.calculateDotProduct(secondCross, secondAngular)

            if (denominator <= 0) {
              return
            }

            const magnitude = Math.min(0.05, depth * positionCorrectionFactor) / denominator
            const correct = (body: Body, mass: number, angular: Vector3, sign: number) => {
              if (mass === 0) {
                return
              }

              changedBodies?.add(body)

              if (depth > 0.03) {
                body.wake()
              }

              body.applyPositionCorrection(Vector3.scale(normal, sign * magnitude * mass, this.vectors.acquire()))

              const rotation = angular.copyTo(this.vectors.acquire()).scale(sign * magnitude)

              if (rotation.magnitude > 1e-7) {
                body.applyRotationCorrection(
                  Quaternion.setFromAxisAngle(
                    rotation.copyTo(this.vectors.acquire()).normalize(),
                    Math.min(0.1, rotation.magnitude),
                    this.rotations.acquire()
                  )
                )
              }
            }

            correct(firstBody, firstMass, firstAngular, -1)

            if (secondBody) {
              correct(secondBody, secondMass, secondAngular, 1)
            }

            didCorrectPositions = true
          })
        })
      }
    }

    return didCorrectPositions
  }
}
