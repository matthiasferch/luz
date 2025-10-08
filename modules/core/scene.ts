import { BroadphaseCache, Collider, CollisionDispatcher, isFiniteCollider, Narrowphase, CollisionResolver, SolverOptions } from '@luz/physics'
import { BoundingBox, Broadphase, BroadphaseEntry } from '@luz/physics'
import { Serializable, Serialize } from '@luz/utilities'
import { vec3 } from '@luz/vectors'
import { Body, isBodyComponent } from './components/body'
import { Biped, isBipedComponent } from './components/biped'
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

export class Scene extends Serializable {
  @Serialize()
  readonly gravity: vec3

  // friction and restitution moved to Body

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

  private collisionResolver: CollisionResolver

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

    this.collisionResolver = new CollisionResolver()
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
    const bipeds = bodies.filter((body) => isBipedComponent(body)) as Biped[]

    bipeds.forEach((biped) => biped.onGround = false)

    // Velocity phase (positions fixed). Cache broadphase once across iterations.
    const velocityBroadphaseCache = Broadphase.buildCache(bodies, Object.values(this.colliders))
    for (let iteration = 0; iteration < velocityIterations; iteration++) {
      // Broadphase + narrowphase populate collisionManifolds
      this.detectCollisions(bodies, velocityBroadphaseCache)
      if (this.collisionManifolds.length === 0) break
      this.collisionResolver.updateBipedGroundState(this.collisionManifolds, groundMinNormalY)
      this.collisionResolver.solveVelocities(this.collisionManifolds, this.getSolverOptions())
    }

    // Position phase
    for (let iteration = 0; iteration < positionIterations; iteration++) {
      // Positions may change each iteration; recompute broadphase per iteration
      this.detectCollisions(bodies)
      if (this.collisionManifolds.length === 0) break
      this.collisionResolver.updateBipedGroundState(this.collisionManifolds, groundMinNormalY)
      const applied = this.collisionResolver.solvePositions(this.collisionManifolds, this.getSolverOptions())
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
    const sortedBodyEntries: Array<BroadphaseEntry<Body>> = cache?.bodies ?? bodies
      .map((body) => ({ item: body, bounds: new BoundingBox(body.volume) }))
      .sort((a, b) => a.bounds.minimum.x - b.bounds.minimum.x)

    const allColliders = Object.values(this.colliders)

    const finiteColliders = allColliders.filter((c) => isFiniteCollider(c))

    const sortedFiniteColliderEntries: Array<BroadphaseEntry<Collider>> = cache?.finiteColliders ?? finiteColliders
      .map((c) => ({ item: c, bounds: new BoundingBox(c) }))
      .sort((a, b) => a.bounds.minimum.x - b.bounds.minimum.x)

    const infiniteColliders: Collider[] = cache?.infiniteColliders ?? allColliders.filter((c) => !isFiniteCollider(c))

    // Broadphase candidate pairs
    const candidateBodyPairs: Array<[Body, Body]> = Broadphase.findCandidatePairs(sortedBodyEntries)
    const candidateFiniteBodyColliderPairs: Array<[Body, Collider]> = Broadphase.findCandidatePairsAcrossSets(sortedBodyEntries, sortedFiniteColliderEntries)

    // Always-candidate body pairs with infinite colliders (e.g., planes)
    const candidateInfiniteBodyColliderPairs: Array<[Body, Collider]> = []
    for (const bodyEntry of sortedBodyEntries) {
      for (const infinite of infiniteColliders) candidateInfiniteBodyColliderPairs.push([bodyEntry.item, infinite])
    }

    // Narrowphase
    const manifolds = Narrowphase.computeManifoldsForPairs(
      this.collisionDispatcher,
      candidateBodyPairs,
      candidateFiniteBodyColliderPairs,
      candidateInfiniteBodyColliderPairs
    )
    this.collisionManifolds.push(...manifolds)
    const totalManifoldCount = manifolds.length

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



  private getSolverOptions(): SolverOptions {
    return {
      frameRate: FRAME_RATE,
      contactRestVelocity,
      penetrationTolerance,
      baumgarteFactor,
      positionCorrectionFactor,
      positionCorrectionPerStep,
      positionCorrectionPerStepStatic,
      bipedDynamicCorrectionPerStep,
      groundMinNormalY,
    }
  }
}
