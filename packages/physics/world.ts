import type { Biped } from './components/biped'
import type { Body } from './components/body'
import { Vector3 } from '@luz/math'
import type { Collider } from './collider'
import { canCollide } from './collider'
import type { Ray } from './colliders/ray'
import type { Volume } from './volume'
import type { QueryFilter, RaycastOptions, RayHit, SweepHit } from './queries'
import { raycastCollider, sweepVolume } from './queries'
import type { CollisionManifold } from './collision'
import type { BroadphaseCache } from './broadphase/broadphase'
import { Broadphase } from './broadphase/broadphase'
import { Narrowphase } from './narrowphase/narrowphase'
import { CollisionSolver } from './solvers/collision-solver'
import type { CollisionStatistics } from './collision-statistics'

const isBiped = (body: Body): body is Biped => body.type === 'biped'

interface CachedPair {
  firstPose: string
  secondPose?: string
  manifolds: CollisionManifold[]
}

export class PhysicsWorld {
  private readonly scratchDirection = new Vector3()

  readonly solver = new CollisionSolver()

  private readonly manifolds: CollisionManifold[] = []

  get collisionManifolds(): readonly CollisionManifold[] {
    return this.manifolds
  }

  velocityIterations = 8
  positionIterations = 8
  collisionStatistics: CollisionStatistics | null = null

  private readonly colliders: Collider[] = []
  private readonly bodies: Body[] = []
  private readonly previousCenters = new Map<Body, Vector3>()
  private readonly broadphaseCache = Broadphase.createCache([], [])

  private deltaTime = 1 / 60

  private readonly contactCache = new Map<Body, Map<Body | Collider, CachedPair>>()

  private isPrepared = false

  setObjects(bodies: readonly Body[], colliders: readonly Collider[]): void {
    const hasChangedBodies =
      bodies.length !== this.bodies.length || bodies.some((body, index) => body !== this.bodies[index])
    const hasChangedColliders =
      colliders.length !== this.colliders.length ||
      colliders.some((collider, index) => collider !== this.colliders[index])

    if (hasChangedBodies || hasChangedColliders) {
      this.contactCache.clear()
    }

    if (hasChangedBodies) {
      const bodyMembership = new Set(bodies)

      for (const body of this.previousCenters.keys()) {
        if (!bodyMembership.has(body)) {
          this.previousCenters.delete(body)
        }
      }

      let entryCount = 0

      for (const entry of this.broadphaseCache.bodies) {
        if (bodyMembership.has(entry.item)) {
          this.broadphaseCache.bodies[entryCount++] = entry
        }
      }

      this.broadphaseCache.bodies.length = entryCount
      this.bodies.length = bodies.length

      bodies.forEach((body, index) => {
        this.bodies[index] = body
      })
    }

    if (hasChangedColliders) {
      this.staticCache = null
      this.broadphaseCache.finiteColliders.length = 0
      this.broadphaseCache.infiniteColliders.length = 0
      this.colliders.length = colliders.length

      colliders.forEach((collider, index) => {
        this.colliders[index] = collider
      })
    }
  }

  raycastAll(ray: Ray, options: RaycastOptions = {}): RayHit[] {
    ray.validate()

    const maximumDistance = options.maximumDistance ?? Infinity

    if (Number.isNaN(maximumDistance) || maximumDistance < 0) {
      throw new Error('Invalid ray maximum distance')
    }

    return [...this.colliders, ...this.bodies.map((body) => body.volume)]
      .filter((collider) => ((options.collisionMask ?? 0xffffffff) & collider.collisionGroup) !== 0)
      .map((collider) => raycastCollider(ray, collider, maximumDistance))
      .filter((hit): hit is RayHit => hit !== null)
      .sort((firstHit, secondHit) => firstHit.distance - secondHit.distance)
  }

  raycast(ray: Ray, options: RaycastOptions = {}): RayHit | null {
    return this.raycastAll(ray, options)[0] ?? null
  }

  overlap(volume: Volume, options: QueryFilter = {}): Collider[] {
    return [...this.colliders, ...this.bodies.map((body) => body.volume)].filter(
      (collider) =>
        collider !== volume &&
        ((options.collisionMask ?? 0xffffffff) & collider.collisionGroup) !== 0 &&
        !!Narrowphase.collisionDispatcher.detectCollisions(volume, collider)?.length
    )
  }

  sweep(volume: Volume, displacement: Vector3, options: QueryFilter = {}): SweepHit | null {
    const hits = [...this.colliders, ...this.bodies.map((body) => body.volume)]
      .filter(
        (collider) => collider !== volume && ((options.collisionMask ?? 0xffffffff) & collider.collisionGroup) !== 0
      )
      .map((collider) => sweepVolume(volume, displacement, collider))
      .filter((hit): hit is SweepHit => hit !== null)

    return hits.sort((firstHit, secondHit) => firstHit.fraction - secondHit.fraction)[0] ?? null
  }

  private solveContinuous(bodies: Body[]): void {
    const targets = [
      ...this.colliders,
      ...bodies.filter((body) => !body.isDynamic && body.motionType !== 'kinematic').map((body) => body.volume)
    ]

    for (const body of bodies) {
      const previousCenter = this.previousCenters.get(body)

      if (!body.isContinuousCollisionEnabled || !body.isDynamic || !previousCenter) {
        continue
      }

      const displacement = Vector3.subtract(body.volume.center, previousCenter)

      if (displacement.magnitude < 1e-5) {
        continue
      }

      // Rewind translation only; rotational sweeps are intentionally outside this CCD mode.
      body.applyPositionCorrection(Vector3.scale(displacement, -1))

      let earliestHit: SweepHit | null = null

      for (const collider of targets) {
        if (!canCollide(body.volume, collider)) {
          continue
        }

        const hit = sweepVolume(body.volume, displacement, collider)

        if (hit && hit.fraction <= 1e-6) {
          // Initial contacts constrain only motion into the surface. Sliding or
          // separating from a touching shape must not freeze a continuous body.
          const contacts = Narrowphase.collisionDispatcher.detectCollisions(body.volume, collider)
          const incomingContact = contacts?.find(
            (contact) => Vector3.calculateDotProduct(contact.normal, displacement) > 1e-6
          )

          if (!incomingContact) {
            continue
          }

          hit.normal = incomingContact.normal.clone().scale(-1)
        }

        if (hit && (!earliestHit || hit.fraction < earliestHit.fraction)) {
          earliestHit = hit
        }
      }

      body.applyPositionCorrection(Vector3.scale(displacement, earliestHit?.fraction ?? 1))

      if (earliestHit) {
        const incomingSpeed = Vector3.calculateDotProduct(body.linearVelocity, earliestHit.normal)

        if (incomingSpeed < 0) {
          body.linearVelocity.subtract(Vector3.scale(earliestHit.normal, incomingSpeed * (1 + body.restitution)))
        }
      }
    }
  }
  private sleepingBodyPairs: Array<[Body, Body]> = []
  private environment = ''
  private previousBodies: Body[] = []
  private staticCache: BroadphaseCache | null = null

  readonly statistics = { narrowphasePasses: 0, narrowphasePairs: 0, velocityConstraints: 0, stepMilliseconds: 0 }

  private previousColliders: object[] = []
  private previousPoses = new Map<Body, string>()

  private serializeBodyPose(body: Body): string {
    return JSON.stringify([
      body.volume.center.xyz,
      (body.volume as Volume & { axes?: Vector3[] }).axes?.map((axis) => axis.xyz)
    ])
  }

  private movedKinematicBodies = new Set<Body>()

  private isActive(body: Body): boolean {
    return body.isDynamic
      ? !body.isSleeping
      : body.motionType === 'kinematic' &&
          (body.linearVelocity.squaredMagnitude > 0 ||
            body.angularVelocity.squaredMagnitude > 0 ||
            this.movedKinematicBodies.has(body))
  }

  prepare(bodies: Body[], colliders: Collider[], gravity: Vector3): void {
    this.setObjects(bodies, colliders)

    this.isPrepared = true

    this.movedKinematicBodies.clear()

    for (const body of bodies) {
      if (
        body.motionType === 'kinematic' &&
        this.previousPoses.has(body) &&
        this.previousPoses.get(body) !== this.serializeBodyPose(body)
      ) {
        this.movedKinematicBodies.add(body)
      }
    }

    for (const body of bodies) {
      const previousCenter = this.previousCenters.get(body)

      if (previousCenter) {
        body.volume.center.copyTo(previousCenter)
      } else {
        this.previousCenters.set(body, body.volume.center.clone())
      }
    }

    // Kinematic poses change as part of ordinary simulation. Including them in
    // the environment signature invalidates every warm-started contact on the
    // following step and repeatedly wakes unrelated sleeping bodies.
    const staticBodies = bodies.filter((body) => !body.isDynamic && body.motionType !== 'kinematic')
    const objects = [...colliders, ...staticBodies]
    const signature = JSON.stringify([
      gravity.xyz,
      bodies.map((body) => [body.mass, body.motionType, body.volume.serialize()]),
      ...colliders.map((collider) => collider.serialize()),
      ...staticBodies.map((body) => [
        body.volume.center.xyz,
        body.convertToLocalPoint(Vector3.createRight(this.scratchDirection)).xyz,
        body.volume.serialize()
      ])
    ])
    const hasChangedPose = staticBodies.some(
      (body) => this.previousPoses.has(body) && this.previousPoses.get(body) !== this.serializeBodyPose(body)
    )
    const hasChanged =
      this.environment !== '' &&
      (hasChangedPose ||
        this.environment !== signature ||
        this.previousBodies.length !== bodies.length ||
        bodies.some((body, index) => body !== this.previousBodies[index]) ||
        objects.length !== this.previousColliders.length ||
        objects.some((object, index) => object !== this.previousColliders[index]))

    for (const body of bodies) {
      const pose = this.serializeBodyPose(body)

      if (
        body.isSleeping &&
        (hasChanged ||
          !this.previousPoses.has(body) ||
          (this.previousPoses.has(body) && this.previousPoses.get(body) !== pose))
      ) {
        body.wake()
      }
    }

    if (hasChanged) {
      this.solver.resetCachedContacts()
      this.contactCache.clear()
    }

    if (!this.staticCache || hasChanged) {
      this.staticCache = Broadphase.createCache([], colliders, this.staticCache ?? undefined)
    }

    this.previousBodies = bodies.slice()
    this.environment = signature
    this.previousColliders = objects

    this.pruneSleepingBodyPairs(bodies)
    this.wakeSleepingBodyIslands()

    if (gravity.magnitude > 0) {
      gravity.copyTo(this.solver.up).normalize().scale(-1)
    } else {
      Vector3.createUp(this.solver.up)
    }
  }

  reset(): void {
    this.solver.resetCachedContacts()

    this.manifolds.length = 0
    this.collisionStatistics = null
    this.sleepingBodyPairs = []
    this.environment = ''
    this.previousColliders = []

    this.previousPoses.clear()

    this.previousBodies = []

    this.previousCenters.clear()

    this.staticCache = null
    this.bodies.length = 0
    this.colliders.length = 0
    this.broadphaseCache.bodies.length = 0
    this.broadphaseCache.finiteColliders.length = 0
    this.broadphaseCache.infiniteColliders.length = 0

    this.movedKinematicBodies.clear()
    this.contactCache.clear()

    this.isPrepared = false
  }

  private detectCollisions(bodies: Body[], cache?: BroadphaseCache, changedBodies?: Set<Body>) {
    this.statistics.narrowphasePasses++

    const previousManifolds = changedBodies ? this.manifolds.slice() : []

    this.manifolds.length = 0

    const colliders = this.colliders
    const collisionCache =
      cache ?? Broadphase.createCache(bodies, this.staticCache ? [] : colliders, this.broadphaseCache)
    const sortedBodies = collisionCache.bodies
    const sortedFiniteColliders = this.staticCache?.finiteColliders ?? collisionCache.finiteColliders
    const infiniteColliders = this.staticCache?.infiniteColliders ?? collisionCache.infiniteColliders

    const bodyPairs = Broadphase.findCollisionCandidates(sortedBodies).filter(([b1, b2]) => {
      return (
        (b1.isDynamic || b2.isDynamic) &&
        (!changedBodies || changedBodies.has(b1) || changedBodies.has(b2)) &&
        canCollide(b1.volume, b2.volume)
      )
    })
    const dynamicBodies = sortedBodies.filter(
      ({ item }) => item.isDynamic && (!changedBodies || changedBodies.has(item))
    )
    const finiteBodyColliderPairs = Broadphase.findCollisionCandidatesAcrossSets(
      dynamicBodies,
      sortedFiniteColliders
    ).filter(([body, collider]) => canCollide(body.volume, collider))

    const infiniteBodyColliderPairs: Array<[Body, Collider]> = []

    for (const { item } of dynamicBodies) {
      for (const collider of infiniteColliders) {
        if (canCollide(item.volume, collider)) {
          infiniteBodyColliderPairs.push([item, collider])
        }
      }
    }

    const poses = new Map(bodies.map((body) => [body, this.serializeBodyPose(body)]))
    const collisionManifolds: CollisionManifold[] = []
    const detectPair = (firstBody: Body, otherBody: Body | Collider, secondBody?: Body) => {
      let contacts = this.contactCache.get(firstBody)

      if (!contacts) {
        this.contactCache.set(firstBody, (contacts = new Map()))
      }

      const firstPose = poses.get(firstBody)!
      const secondPose = secondBody ? poses.get(secondBody) : undefined
      const cachedPair = contacts.get(otherBody)

      // Dormant support geometry remains available for grounding and diagnostics.
      // A pose or environment change invalidates it before it can be reused.
      if (
        !this.isActive(firstBody) &&
        (!secondBody || !this.isActive(secondBody)) &&
        cachedPair &&
        cachedPair.firstPose === firstPose &&
        cachedPair.secondPose === secondPose
      ) {
        collisionManifolds.push(...cachedPair.manifolds)

        return
      }

      this.statistics.narrowphasePairs++

      const manifolds = Narrowphase.calculateCollisionManifolds({
        bodyPairs: secondBody ? [[firstBody, secondBody]] : [],
        finiteBodyColliderPairs: secondBody ? [] : [[firstBody, otherBody as Collider]],
        infiniteBodyColliderPairs: []
      })

      if (manifolds.length) {
        contacts.set(otherBody, { firstPose, secondPose, manifolds })
      } else {
        contacts.delete(otherBody)
      }

      collisionManifolds.push(...manifolds)
    }

    for (const [firstBody, secondBody] of bodyPairs) {
      detectPair(firstBody, secondBody, secondBody)
    }

    for (const [body, collider] of [...finiteBodyColliderPairs, ...infiniteBodyColliderPairs]) {
      detectPair(body, collider)
    }

    // Keep the original solving order, reusing geometry only for pairs whose
    // bodies did not move. Fresh broadphase queries still discover new contacts.
    const replacements = new Map(collisionManifolds.map((manifold) => [manifold.id, manifold]))

    for (const manifold of previousManifolds) {
      const [firstBody, secondBody] = manifold.bodies

      if (!changedBodies!.has(firstBody) && (!secondBody || !changedBodies!.has(secondBody))) {
        this.manifolds.push(manifold)
      } else {
        const replacement = replacements.get(manifold.id)

        if (replacement) {
          this.manifolds.push(replacement)
        }
      }

      replacements.delete(manifold.id)
    }

    this.manifolds.push(...replacements.values())

    for (const {
      bodies: [firstBody, secondBody]
    } of this.manifolds) {
      if (secondBody && this.movedKinematicBodies.has(secondBody) && firstBody.isSleeping) {
        firstBody.wake()
      }

      if (secondBody?.isSleeping && this.movedKinematicBodies.has(firstBody)) {
        secondBody.wake()
      }
    }

    this.collisionStatistics = {
      bodyCount: bodies.length,
      colliderCount: colliders.length,
      candidateBodyPairCount: bodyPairs.length,
      candidateBodyColliderPairCount: finiteBodyColliderPairs.length + infiniteBodyColliderPairs.length,
      manifoldCount: this.manifolds.length
    }
  }

  solve(bodies: Body[], colliders: Collider[], deltaTime: number): void {
    const started = performance.now()

    this.statistics.narrowphasePasses = 0
    this.statistics.narrowphasePairs = 0

    if (!this.isPrepared) {
      this.contactCache.clear()
    }

    this.isPrepared = false

    if (
      !Number.isInteger(this.velocityIterations) ||
      this.velocityIterations < 1 ||
      !Number.isInteger(this.positionIterations) ||
      this.positionIterations < 1
    ) {
      throw new Error('Solver iteration counts must be positive integers')
    }

    this.setObjects(bodies, colliders)
    this.solveContinuous(bodies)

    this.deltaTime = deltaTime

    const observedBodyPairs: Array<[Body, Body]> = []
    const bipeds = bodies.filter((body): body is Biped => {
      return isBiped(body)
    })

    bipeds.forEach((biped) => {
      if (!biped.isSleeping) {
        biped.isGrounded = false
      }
    })

    const collisions = this.colliders
    const broadphaseCache = Broadphase.createCache(bodies, this.staticCache ? [] : collisions, this.broadphaseCache)

    this.solver.beginVelocityFrame()

    const sleepingBefore = new Set(bodies.filter((body) => body.isSleeping))

    this.detectCollisions(bodies, broadphaseCache)

    this.statistics.velocityConstraints = 0

    for (let iteration = 0; iteration < this.velocityIterations; iteration++) {
      if (iteration === 0) {
        this.collectBodyPairs(this.manifolds, observedBodyPairs)
      }

      if (this.manifolds.length === 0) {
        break
      }

      this.solver.updateBipedGroundState(this.manifolds)

      // An impact may wake a body during the preceding iteration. Its cached
      // support contacts must then join the velocity solve in this same step.
      const velocityManifolds = this.manifolds.filter(
        ({ bodies: [firstBody, secondBody] }) => this.isActive(firstBody) || (secondBody && this.isActive(secondBody))
      )

      this.statistics.velocityConstraints = velocityManifolds.reduce(
        (sum, manifold) => sum + manifold.collisions.length,
        0
      )

      this.solver.solveVelocities(velocityManifolds, this.deltaTime, iteration === 0)
    }

    this.solver.endVelocityFrame()
    this.wakeSleepingBodyIslands()

    let changedBodies = new Set(bodies.filter((body) => sleepingBefore.has(body) && !body.isSleeping))

    for (let iteration = 0; iteration < this.positionIterations; iteration++) {
      if (changedBodies.size > 0) {
        this.detectCollisions(bodies, undefined, changedBodies)
      }

      if (this.manifolds.length === 0) {
        break
      }

      this.solver.updateBipedGroundState(this.manifolds)

      changedBodies = new Set()

      if (
        !this.solver.solvePositions(
          this.manifolds,
          this.solver.collectStaticSupportBodies(this.manifolds),
          changedBodies
        )
      ) {
        break
      }
    }

    // A body can wake during collision solving after gravity has already been
    // applied. Propagate that wake through its previously sleeping contact
    // island so supported bodies participate in the next fixed step.
    this.wakeSleepingBodyIslands()

    const retainedSleepingBodyPairs = this.sleepingBodyPairs.filter(([firstBody, secondBody]) => {
      return firstBody.isSleeping || secondBody.isSleeping
    })

    observedBodyPairs.forEach(([firstBody, secondBody]) => {
      if (firstBody.isSleeping || secondBody.isSleeping) {
        this.collectBodyPair(firstBody, secondBody, retainedSleepingBodyPairs)
      }
    })
    this.solver.finishStep(this.manifolds, bodies, deltaTime)
    observedBodyPairs.forEach(([firstBody, secondBody]) => {
      if (firstBody.isSleeping || secondBody.isSleeping) {
        this.collectBodyPair(firstBody, secondBody, retainedSleepingBodyPairs)
      }
    })

    this.sleepingBodyPairs = retainedSleepingBodyPairs
    this.statistics.stepMilliseconds = performance.now() - started

    this.previousPoses.clear()

    for (const body of bodies) {
      this.previousPoses.set(body, this.serializeBodyPose(body))
    }
  }

  private collectBodyPairs(collisionManifolds: CollisionManifold[], bodyPairs: Array<[Body, Body]>) {
    collisionManifolds.forEach(({ bodies: [firstBody, secondBody] }) => {
      const isDynamicPair = secondBody && firstBody.isDynamic && secondBody.isDynamic
      const isKinematicSupportPair =
        secondBody &&
        ((firstBody.isDynamic && secondBody.motionType === 'kinematic') ||
          (secondBody.isDynamic && firstBody.motionType === 'kinematic'))

      if (!secondBody || (!isDynamicPair && !isKinematicSupportPair)) {
        return
      }

      this.collectBodyPair(firstBody, secondBody, bodyPairs)
    })
  }

  private collectBodyPair(firstBody: Body, secondBody: Body, bodyPairs: Array<[Body, Body]>) {
    const isAlreadyCollected = bodyPairs.some(([existingFirstBody, existingSecondBody]) => {
      return (
        (existingFirstBody === firstBody && existingSecondBody === secondBody) ||
        (existingFirstBody === secondBody && existingSecondBody === firstBody)
      )
    })

    if (!isAlreadyCollected) {
      bodyPairs.push([firstBody, secondBody])
    }
  }

  private wakeSleepingBodyIslands() {
    const activeBodies = new Set<Body>()

    for (const body of this.movedKinematicBodies) {
      activeBodies.add(body)
    }

    this.sleepingBodyPairs.forEach(([firstBody, secondBody]) => {
      if (!firstBody.isSleeping && firstBody.shouldWake()) {
        activeBodies.add(firstBody)
      }

      if (!secondBody.isSleeping && secondBody.shouldWake()) {
        activeBodies.add(secondBody)
      }
    })

    let didWakeBody: boolean

    do {
      didWakeBody = false

      this.sleepingBodyPairs.forEach(([firstBody, secondBody]) => {
        if (activeBodies.has(firstBody) && secondBody.isSleeping) {
          secondBody.wake()
          activeBodies.add(secondBody)

          didWakeBody = true
        } else if (activeBodies.has(secondBody) && firstBody.isSleeping) {
          firstBody.wake()
          activeBodies.add(firstBody)

          didWakeBody = true
        }
      })
    } while (didWakeBody)
  }

  private pruneSleepingBodyPairs(bodies: Body[]) {
    const activeBodies = new Set(bodies)

    this.sleepingBodyPairs = this.sleepingBodyPairs.filter(([firstBody, secondBody]) => {
      return activeBodies.has(firstBody) && activeBodies.has(secondBody)
    })
  }
}
