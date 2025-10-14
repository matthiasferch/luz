import { BroadphaseCache, Collider, isFiniteCollider, Narrowphase, CollisionSolver } from '@luz/physics'
import { BoundingBox, Broadphase } from '@luz/physics'
import { Serializable, Serialize } from '@luz/utilities'
import { vec3 } from '@luz/vectors'
import { Body, isBody } from './components/body'
import { Biped, isBiped } from './components/biped'
import { Entity } from './entity'
import { CollisionManifold } from '@luz/physics/collision'

const { exp } = Math

const STEP_COUNT: number = 4
const FRAME_RATE: number = 1 / 60

const velocityIterations: number = 8
const positionIterations: number = 8

export class Scene extends Serializable {
  @Serialize()
  readonly gravity: vec3

  @Serialize()
  readonly linearDamping: number = 0.02

  @Serialize()
  readonly angularDamping: number = 0.05

  @Serialize(Entity)
  readonly entities: Record<string, Entity> = {}

  @Serialize(Collider)
  readonly colliders: Record<string, Collider> = {}

  readonly collisionManifolds: CollisionManifold[] = []

  private elapsedTime: number = 0

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
  }

  static async deserialize(data: Partial<Scene>) {
    return (await super.deserialize(data)) as Scene
  }

  update(deltaTime: number) {
    const sceneEntities = Object.values(this.entities)

    this.elapsedTime += deltaTime

    let fixedSteps = 0

    sceneEntities.forEach((entity) => {
      Object.values(entity.components).forEach((component) => {
        if (isBody(component)) {
          component.applyTransform(entity)
        }
      })
    })

    while (this.elapsedTime >= FRAME_RATE && fixedSteps++ < STEP_COUNT) {
      const components = sceneEntities.reduce((components, entity) => {
        return [...components, ...Object.values(entity.components)]
      }, [])

      const bodies = components.filter((component) => {
        return isBody(component)
      })

      this.applyGravity(bodies)
      this.applyDamping(bodies, FRAME_RATE)

      sceneEntities.forEach((entity) => {
        entity.fixedUpdate(FRAME_RATE)
      })

      this.resolveCollisions(bodies)

      this.elapsedTime -= FRAME_RATE
    }

    sceneEntities.forEach((entity) => {
      entity.update(deltaTime)
    })
  }

  private detectCollisions(bodies: Body[], cache?: BroadphaseCache) {
    this.collisionManifolds.length = 0

    const sortedBodies = cache?.bodies ?? bodies
      .map((body) => ({ item: body, bounds: new BoundingBox(body.volume) }))
      .sort((e1, e2) => e1.bounds.minimum.x - e2.bounds.minimum.x)

    const colliders = Object.values(this.colliders)

    const finiteColliders = colliders.filter((collider) => {
      isFiniteCollider(collider)
    })

    const sortedFiniteColliders = cache?.finiteColliders ?? finiteColliders
      .map((collider) => ({ item: collider, bounds: new BoundingBox(collider) }))
      .sort((e1, e2) => e1.bounds.minimum.x - e2.bounds.minimum.x)

    const infiniteColliders = cache?.infiniteColliders ?? colliders.filter((collider) => {
      return !isFiniteCollider(collider)
    })

    const bodyPairs = Broadphase.findCollisionCandidates(sortedBodies)
    const finiteBodyColliderPairs = Broadphase.findCollisionCandidatesAcrossSets(sortedBodies, sortedFiniteColliders)

    const infiniteBodyColliderPairs: Array<[Body, Collider]> = []

    for (const { item } of sortedBodies) {
      for (const collider of infiniteColliders) {
        infiniteBodyColliderPairs.push([item, collider])
      }
    }

    const collisionManifolds = Narrowphase.calculateCollisionManifolds({
      bodyPairs,
      finiteBodyColliderPairs,
      infiniteBodyColliderPairs
    })

    this.collisionManifolds.push(...collisionManifolds)

    this.lastBroadphaseStats = {
      bodies: bodies.length,
      colliders: colliders.length,
      candidateBodyPairs: bodyPairs.length,
      candidateBodyColliderPairs: finiteBodyColliderPairs.length + infiniteBodyColliderPairs.length,
      manifolds: collisionManifolds.length
    }
  }

  private resolveCollisions(bodies: Body[]) {
    const bipeds = bodies.filter((body) => {
      return isBiped(body)
    })

    bipeds.forEach((biped) => {
      biped.onGround = false
    })

    const collisions = Object.values(this.colliders)
    const broadphaseCache = Broadphase.createCache(bodies, collisions)

    // velocity phase
    for (let iteration = 0; iteration < velocityIterations; iteration++) {
      this.detectCollisions(bodies, broadphaseCache)

      if (this.collisionManifolds.length === 0) {
        break
      }

      CollisionSolver.updateBipedGroundState(this.collisionManifolds)
      CollisionSolver.solveVelocities(this.collisionManifolds, FRAME_RATE)
    }

    // position phase
    for (let iteration = 0; iteration < positionIterations; iteration++) {
      this.detectCollisions(bodies)

      if (this.collisionManifolds.length === 0) {
        break
      }

      CollisionSolver.updateBipedGroundState(this.collisionManifolds)

      if (!CollisionSolver.solvePositions(this.collisionManifolds)) {
        break
      }
    }
  }

  private applyGravity(bodies: Body[]) {
    const force = new vec3()

    bodies.forEach((body) => {
      if (body.mass <= 0) {
        return
      }

      vec3.scale(this.gravity, body.mass, force)

      body.force.add(force)
    })
  }

  private applyDamping(bodies: Body[], deltaTime: number) {
    const hasLinearDamping = this.linearDamping > 0
    const hasAngularDamping = this.angularDamping > 0

    if (!hasLinearDamping && !hasAngularDamping) {
      return
    }

    const linearDampingFactor = hasLinearDamping ? exp(-this.linearDamping * deltaTime) : 1
    const angularDampingFactor = hasAngularDamping ? exp(-this.angularDamping * deltaTime) : 1

    bodies.forEach((body) => {
      if (body.mass <= 0) {
        return
      }

      if (hasLinearDamping) {
        body.linearVelocity.scale(linearDampingFactor)
      }

      if (hasAngularDamping) {
        body.angularVelocity.scale(angularDampingFactor)
      }
    })
  }
}
