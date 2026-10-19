import { expect } from 'chai'
import { BoundingBox, Entity, Transform } from '@luz/core'
import type { RigidPose } from '@luz/core'
import { Quaternion, Vector3 } from '@luz/math'
import type { BroadphaseCache } from '@luz/physics'
import {
  Body,
  Broadphase,
  Cuboid,
  Cylinder,
  Ellipsoid,
  PhysicsWorld,
  Plane,
  Polygon,
  Sphere,
  calculateColliderBoundingBox
} from '@luz/physics'
import { Scene } from '@luz/scene'

interface PhysicsBuffers {
  previousCenters: Map<Body, Vector3>
  broadphaseCache: BroadphaseCache
  staticCache: BroadphaseCache | null
}

const getPhysicsBuffers = (world: PhysicsWorld): PhysicsBuffers => world as unknown as PhysicsBuffers

const getPoseBuffer = (scene: Scene, entity: Entity) =>
  (scene as unknown as { previousPhysicsPoses: Map<Entity, RigidPose> }).previousPhysicsPoses.get(entity)

const createBody = (position = [0, 0, 0]) => {
  const body = new Body()
  const entity = new Entity()

  body.volume = new Cuboid()
  entity.components.body = body

  entity.translation.set(position)
  body.applyTransform(entity)

  return { body, entity }
}

describe('Physics buffers', () => {
  it('overwrites collider bound destinations across shape types without changing owned results', () => {
    const shapes = [
      new Cuboid({ extents: new Vector3([3, 2, 1]) }),
      new Sphere({ radius: 0.25 }),
      new Cylinder({ radius: 2, height: 5 }),
      new Ellipsoid({ radius: new Vector3([1, 4, 2]) })
    ]
    const destination = new BoundingBox()
    const minimum = destination.minimum
    const maximum = destination.maximum

    for (const shape of shapes) {
      shape.applyTransform(
        new Transform({
          translation: new Vector3([4, -2, 3]),
          rotation: Quaternion.setFromEulerAngles(0.4, 0.8, -0.2)
        })
      )

      const ownedBoundingBox = calculateColliderBoundingBox(shape)
      const snapshot = [ownedBoundingBox.minimum.xyz, ownedBoundingBox.maximum.xyz]

      expect(calculateColliderBoundingBox(shape, destination)).to.equal(destination)
      expect(destination.minimum).to.equal(minimum)
      expect(destination.maximum).to.equal(maximum)
      expect([minimum.xyz, maximum.xyz]).to.deep.equal(snapshot)
      calculateColliderBoundingBox(new Polygon(), destination)
      expect(minimum.xyz).to.deep.equal([0, 0, 0])
      expect(maximum.xyz).to.deep.equal([0, 0, 0])
      expect([ownedBoundingBox.minimum.xyz, ownedBoundingBox.maximum.xyz]).to.deep.equal(snapshot)
    }

    const polygon = new Polygon({
      vertices: [
        [-2, 0, -3],
        [2, 0, -3],
        [0, 0, 4]
      ].map((point) => new Vector3(point))
    })

    calculateColliderBoundingBox(polygon, destination)
    expect(minimum.xyz).to.deep.equal([-2, 0, -3])
    expect(maximum.xyz).to.deep.equal([2, 0, 4])
  })
  it('reuses broadphase storage through sorting, ties, shape replacement and removal', () => {
    const firstBody = createBody([3, 0, 0]).body
    const secondBody = createBody([0, 0, 0]).body
    const firstCollider = new Sphere({ origin: new Vector3([4, 0, 0]) })
    const secondCollider = new Sphere()
    const plane = new Plane()
    const cache = Broadphase.createCache([firstBody, secondBody], [firstCollider, secondCollider, plane])
    const bodyEntries = cache.bodies.slice()
    const colliderEntries = cache.finiteColliders.slice()
    const boundingBoxes = new Set([...bodyEntries, ...colliderEntries].map(({ boundingBox }) => boundingBox))
    const bodyArray = cache.bodies
    const finiteArray = cache.finiteColliders
    const infiniteArray = cache.infiniteColliders

    firstBody.volume.center.reset()
    firstCollider.center.reset()
    expect(Broadphase.createCache([firstBody, secondBody], [firstCollider, secondCollider, plane], cache)).to.equal(
      cache
    )
    expect(cache.bodies.map(({ item }) => item)).to.deep.equal([firstBody, secondBody])
    expect(cache.finiteColliders.map(({ item }) => item)).to.deep.equal([firstCollider, secondCollider])
    expect(cache.bodies).to.equal(bodyArray)
    expect(cache.finiteColliders).to.equal(finiteArray)
    expect(cache.infiniteColliders).to.equal(infiniteArray)

    for (const entry of [...cache.bodies, ...cache.finiteColliders]) {
      expect(boundingBoxes.has(entry.boundingBox)).to.equal(true)
    }

    expect(new Set(cache.bodies)).to.deep.equal(new Set(bodyEntries))
    expect(new Set(cache.finiteColliders)).to.deep.equal(new Set(colliderEntries))

    firstBody.volume = new Sphere({ origin: new Vector3([10, 0, 0]), radius: 0.5 })

    Broadphase.createCache([firstBody], [], cache)
    expect(cache.bodies).to.have.lengthOf(1)
    expect(cache.bodies[0].item).to.equal(firstBody)
    expect(cache.bodies[0].boundingBox.minimum.xyz).to.deep.equal([9.5, -0.5, -0.5])
    expect(cache.finiteColliders).to.have.lengthOf(0)
    expect(cache.infiniteColliders).to.have.lengthOf(0)

    const ownedCache = Broadphase.createCache([firstBody], [])

    Broadphase.createCache([], [], cache)
    expect(cache.bodies).to.have.lengthOf(0)
    expect(ownedCache.bodies).to.have.lengthOf(1)
    expect(ownedCache.bodies[0].boundingBox.minimum.xyz).to.deep.equal([9.5, -0.5, -0.5])
  })
  it('reuses interpolation history while retaining the previous substep and owned results', () => {
    const scene = new Scene()
    const { body, entity } = createBody()

    scene.gravity.reset()

    scene.entities.body = entity
    body.linearVelocity.x = 3

    scene.update(1 / 60)

    const poseBuffer = getPoseBuffer(scene, entity)!
    const firstTranslation = entity.translation.clone()
    const firstPose = scene.interpolatePose(entity)
    const firstSnapshot = [firstPose.translation.xyz, Array.from(firstPose.rotation)]

    scene.update(1 / 60)
    expect(getPoseBuffer(scene, entity)).to.equal(poseBuffer)
    expect(poseBuffer.translation).to.deep.equal(firstTranslation)
    scene.update(1 / 120)

    const interpolatedPose = scene.interpolatePose(entity)

    expect(interpolatedPose.translation.x).to.be.closeTo((firstTranslation.x + entity.translation.x) / 2, 1e-6)
    expect(interpolatedPose.translation).not.to.equal(poseBuffer.translation)
    expect(interpolatedPose.rotation).not.to.equal(poseBuffer.rotation)
    expect([firstPose.translation.xyz, Array.from(firstPose.rotation)]).to.deep.equal(firstSnapshot)
    scene.update(2 / 60)
    expect(getPoseBuffer(scene, entity)).to.equal(poseBuffer)
    expect(poseBuffer.translation.x).to.be.greaterThan(firstTranslation.x)
    expect(poseBuffer.translation.x).to.be.lessThan(entity.translation.x)
  })
  it('drops removed entity history even while paused and clears history on reset', () => {
    const scene = new Scene()
    const { body, entity } = createBody()

    scene.gravity.reset()

    scene.entities.body = entity
    body.linearVelocity.x = 1

    scene.captureSimulationState()
    scene.update(1 / 60)
    expect(getPoseBuffer(scene, entity)).not.to.equal(undefined)

    delete scene.entities.body

    scene.update(0, false)
    expect(getPoseBuffer(scene, entity)).to.equal(undefined)
    entity.translation.set([10, 2, 3])
    expect(scene.interpolatePose(entity).translation).to.deep.equal(entity.translation)

    scene.entities.body = entity

    scene.update(1 / 60)
    expect(getPoseBuffer(scene, entity)!.translation.xyz).to.deep.equal([10, 2, 3])
    scene.resetSimulation()
    expect(getPoseBuffer(scene, entity)).to.equal(undefined)
    expect(entity.translation.xyz).to.deep.equal([0, 0, 0])
  })
  it('reuses world snapshots and bounds and releases removed members from mutable input arrays', () => {
    const world = new PhysicsWorld()
    const firstBody = createBody().body
    const secondBody = createBody([4, 0, 0]).body
    const bodies = [firstBody, secondBody]
    const colliders = [new Cuboid({ origin: new Vector3([20, 0, 0]) })]
    const buffers = getPhysicsBuffers(world)

    world.prepare(bodies, colliders, Vector3.createZero())
    world.solve(bodies, colliders, 1 / 60)

    const previousCenter = buffers.previousCenters.get(firstBody)!
    const boundingBox = buffers.broadphaseCache.bodies[0].boundingBox
    const staticBoundingBox = buffers.staticCache!.finiteColliders[0].boundingBox

    firstBody.volume.center.y = 5
    colliders[0].extents.y = 2

    world.prepare(bodies, colliders, Vector3.createZero())
    world.solve(bodies, colliders, 1 / 60)
    expect(buffers.previousCenters.get(firstBody)).to.equal(previousCenter)
    expect(previousCenter.xyz).to.deep.equal([0, 5, 0])
    expect(buffers.broadphaseCache.bodies[0].boundingBox).to.equal(boundingBox)
    expect(boundingBox.minimum.xyz).to.deep.equal([-1, 4, -1])
    expect(buffers.staticCache!.finiteColliders[0].boundingBox).to.equal(staticBoundingBox)
    expect(staticBoundingBox.minimum.xyz).to.deep.equal([19, -2, -1])
    bodies.splice(0, 1)

    colliders.length = 0

    world.setObjects(bodies, colliders)
    expect(buffers.previousCenters.has(firstBody)).to.equal(false)
    expect(buffers.broadphaseCache.bodies.every(({ item }) => item === secondBody)).to.equal(true)
    expect(buffers.staticCache).to.equal(null)
    world.reset()
    expect(buffers.previousCenters.size).to.equal(0)
    expect(buffers.broadphaseCache.bodies).to.have.lengthOf(0)
    expect(buffers.broadphaseCache.finiteColliders).to.have.lengthOf(0)
    expect(buffers.broadphaseCache.infiniteColliders).to.have.lengthOf(0)
  })
  it('keeps cached static collider bounds available across repeated prepared steps', () => {
    const world = new PhysicsWorld()
    const body = createBody([0, 1.99, 0]).body
    const collider = new Cuboid({ extents: new Vector3([3, 1, 3]) })
    const buffers = getPhysicsBuffers(world)

    for (let step = 0; step < 5; step++) {
      world.prepare([body], [collider], Vector3.createDown())
      world.solve([body], [collider], 1 / 60)
      expect(buffers.staticCache!.finiteColliders).to.have.lengthOf(1)
      expect(buffers.staticCache!.finiteColliders[0].item).to.equal(collider)
      expect(world.collisionManifolds.length).to.be.greaterThan(0)
    }
  })
  it('refreshes standalone world bounds and discovers contacts after position corrections', () => {
    const world = new PhysicsWorld()
    const firstBody = createBody().body
    const secondBody = createBody([1.9, 0, 0]).body
    const thirdBody = createBody([6, 0, 0]).body
    const bodies = [firstBody, secondBody, thirdBody]
    const solvePositions = world.solver.solvePositions

    let correctionCount = 0

    world.solver.solvePositions = (_manifolds, _supportBodies, changedBodies) => {
      correctionCount++

      if (correctionCount !== 1) {
        return false
      }

      thirdBody.volume.center.x = 3.8

      changedBodies!.add(thirdBody)

      return true
    }

    try {
      world.solve(bodies, [], 1 / 60)
      expect(world.statistics.narrowphasePasses).to.equal(2)
      expect(world.collisionManifolds.some(({ bodies: pair }) => pair.includes(thirdBody))).to.equal(true)
      expect(getPhysicsBuffers(world).broadphaseCache.bodies[2].boundingBox.minimum.x).to.be.closeTo(2.8, 1e-6)
    } finally {
      world.solver.solvePositions = solvePositions
    }
  })
  it('retains the pre-integration center when continuous collision is enabled mid-step', () => {
    const world = new PhysicsWorld()
    const { body, entity } = createBody([0, 3, 0])
    const plane = new Plane()

    body.volume = new Sphere({ radius: 0.5 })

    body.applyTransform(entity)
    world.prepare([body], [plane], Vector3.createDown())

    entity.translation.y = -3

    body.applyTransform(entity)
    body.linearVelocity.set([0, -10, 0])

    body.isContinuousCollisionEnabled = true

    world.solve([body], [plane], 1 / 60)
    expect(body.volume.center.y).to.be.closeTo(0.5, 1e-5)
    expect(body.linearVelocity.y).to.be.at.least(0)

    const previousCenter = getPhysicsBuffers(world).previousCenters.get(body)!

    world.prepare([body], [plane], Vector3.createDown())
    expect(getPhysicsBuffers(world).previousCenters.get(body)).to.equal(previousCenter)
    expect(previousCenter.y).to.be.closeTo(0.5, 1e-5)
  })
  it('isolates histories and broadphase buffers during nested updates of different scenes', () => {
    const firstScene = new Scene()
    const secondScene = new Scene()
    const firstBody = createBody()
    const secondBody = createBody([10, 0, 0])

    firstScene.gravity.reset()
    secondScene.gravity.reset()

    firstScene.entities.body = firstBody.entity
    secondScene.entities.body = secondBody.entity
    firstBody.body.linearVelocity.x = 1
    secondBody.body.linearVelocity.x = -1

    const performFixedUpdate = firstBody.entity.performFixedUpdate

    firstBody.entity.performFixedUpdate = function (deltaTime) {
      secondScene.update(deltaTime)
      performFixedUpdate.call(this, deltaTime)
    }

    firstScene.update(1 / 60)

    const firstBuffers = getPhysicsBuffers(firstScene.physics)
    const secondBuffers = getPhysicsBuffers(secondScene.physics)

    expect(getPoseBuffer(firstScene, firstBody.entity)!.translation.x).to.equal(0)
    expect(getPoseBuffer(secondScene, secondBody.entity)!.translation.x).to.equal(10)
    expect(firstBuffers.previousCenters.get(firstBody.body)!.x).to.equal(0)
    expect(secondBuffers.previousCenters.get(secondBody.body)!.x).to.equal(10)
    expect(firstBuffers.broadphaseCache.bodies[0].boundingBox).not.to.equal(
      secondBuffers.broadphaseCache.bodies[0].boundingBox
    )
    expect(firstBuffers.broadphaseCache.bodies[0].boundingBox.maximum.x).to.be.lessThan(2)
    expect(secondBuffers.broadphaseCache.bodies[0].boundingBox.minimum.x).to.be.greaterThan(8)
  })
})
