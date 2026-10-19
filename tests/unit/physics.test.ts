import assert from 'node:assert/strict'
import {
  Plane,
  Sphere,
  collidePlaneWithSphere,
  collidePlaneWithCylinder,
  Cuboid,
  collidePlaneWithCuboid,
  Polygon,
  collideSphereWithCuboid,
  collideCuboidWithCuboid,
  collidePolygonWithCuboid,
  collidePolygonWithSphere,
  collideSphereWithSphere,
  intersectRayWithPlane,
  Ray,
  intersectRayWithSphere,
  intersectRayWithCuboid,
  normalizeCollisions,
  Narrowphase,
  CollisionSolver,
  Cylinder,
  CollisionDispatcher,
  collideCylinderWithCuboid
} from '@luz/physics'
import { Entity } from '@luz/core'
import { Body } from '@luz/physics'
import { Scene } from '@luz/scene'
import { Quaternion, Vector3 } from '@luz/math'
import { expect } from 'chai'

describe('Physics: Collisions', () => {
  let solver: CollisionSolver

  beforeEach(() => {
    solver = new CollisionSolver()
  })
  describe('normalizeCollisions', () => {
    it('should deduplicate and cap manifold contacts deterministically', () => {
      const collisions = normalizeCollisions([
        { id: 'a', point: new Vector3([0, 0, 0]), normal: Vector3.createUp(), penetrationDepth: 0.1 },
        { id: 'b', point: new Vector3([0, 0, 0.0004]), normal: Vector3.createUp(), penetrationDepth: 0.10001 },
        { id: 'c', point: new Vector3([1, 0, 0]), normal: Vector3.createUp(), penetrationDepth: 0.4 },
        { id: 'd', point: new Vector3([-1, 0, 0]), normal: Vector3.createUp(), penetrationDepth: 0.3 },
        { id: 'e', point: new Vector3([0, 0, 1]), normal: Vector3.createUp(), penetrationDepth: 0.2 },
        { id: 'f', point: new Vector3([0, 0, -1]), normal: Vector3.createUp(), penetrationDepth: 0.05 }
      ])

      expect(collisions).to.have.lengthOf(4)
      expect(collisions.map(({ penetrationDepth: distance }) => distance)).to.deep.equal([0.4, 0.3, 0.2, 0.1])
      expect(collisions[0].point.xyz).to.deep.equal(new Vector3([1, 0, 0]).xyz)
      expect(collisions[3].point.xyz).to.deep.equal(new Vector3([0, 0, 0]).xyz)
      expect(collisions.map(({ id }) => id)).to.deep.equal([
        '1:0:0:0:1:0:0.4',
        '-1:0:0:0:1:0:0.3',
        '0:0:1:0:1:0:0.2',
        '0:0:0:0:1:0:0.1'
      ])
    })
    it('should preserve contact metadata while normalizing collisions', () => {
      const collisions = normalizeCollisions([
        {
          point: new Vector3([0, 0, 0]),
          normal: Vector3.createUp(),
          penetrationDepth: 0.1,
          featureId: 'plane:cuboid:vertex:0',
          isRestingContact: true,
          contactType: 'patch'
        }
      ])

      expect(collisions).to.have.lengthOf(1)
      expect(collisions[0].featureId).to.equal('plane:cuboid:vertex:0')
      expect(collisions[0].isRestingContact).to.equal(true)
      expect(collisions[0].contactType).to.equal('patch')
    })
    it('should hoist shared contact metadata onto collision manifolds', () => {
      const body = new Body({ mass: 1 })

      body.volume = new Cuboid({
        origin: new Vector3([0, 1, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const plane = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      const [manifold] = Narrowphase.calculateCollisionManifolds({
        bodyPairs: [],
        finiteBodyColliderPairs: [],
        infiniteBodyColliderPairs: [[body, plane]]
      })

      expect(manifold).to.not.equal(undefined)
      expect(manifold.isRestingContact).to.equal(true)
      expect(manifold.contactType).to.equal('patch')
      expect(manifold.featureId).to.equal(undefined)
      expect(manifold.featurePairId).to.equal('cuboid:face:-y|plane:face')
      expect(manifold.collisions).to.have.lengthOf(4)
    })
    it('should hoist a shared feature id onto point collision manifolds', () => {
      const body = new Body({ mass: 1 })

      body.volume = new Sphere({
        origin: new Vector3([0, 1, 0]),
        radius: 1
      })

      const plane = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      const [manifold] = Narrowphase.calculateCollisionManifolds({
        bodyPairs: [],
        finiteBodyColliderPairs: [],
        infiniteBodyColliderPairs: [[body, plane]]
      })

      expect(manifold).to.not.equal(undefined)
      expect(manifold.isRestingContact).to.equal(true)
      expect(manifold.contactType).to.equal('point')
      expect(manifold.featureId).to.equal('plane:sphere')
      expect(manifold.featurePairId).to.equal('plane:sphere|plane:face')
      expect(manifold.collisions).to.have.lengthOf(1)
    })
    it('should hoist cuboid pair face metadata onto collision manifolds', () => {
      const lowerBody = new Body({ mass: 1 })

      lowerBody.volume = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })

      lowerBody.volume.center.set([0, 0.5, 0])

      const upperBody = new Body({ mass: 1 })

      upperBody.volume = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })

      upperBody.volume.center.set([0, 1.45, 0])

      const [manifold] = Narrowphase.calculateCollisionManifolds({
        bodyPairs: [[lowerBody, upperBody]],
        finiteBodyColliderPairs: [],
        infiniteBodyColliderPairs: []
      })

      expect(manifold).to.not.equal(undefined)
      expect(manifold.isRestingContact).to.equal(true)
      expect(manifold.contactType).to.equal('patch')
      expect(manifold.featureId).to.equal(undefined)
      expect(manifold.featurePairId).to.equal('cuboid:a:face:+y|cuboid:b:face:-y')
      expect(manifold.collisions).to.have.lengthOf(4)
    })
    it('should hoist rotated cuboid pair face metadata in local face coordinates', () => {
      const lowerEntity = new Entity()
      const lowerBody = new Body({ mass: 1 })

      lowerBody.volume = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })
      lowerEntity.translation.y = 0.5

      lowerBody.volume.applyTransform(lowerEntity)

      const upperEntity = new Entity()
      const upperBody = new Body({ mass: 1 })

      upperBody.volume = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })
      upperEntity.translation.y = 1.45

      upperEntity.rotation.set(Quaternion.setFromAxisAngle(Vector3.createForward(), Math.PI / 2))
      upperBody.volume.applyTransform(upperEntity)

      const [manifold] = Narrowphase.calculateCollisionManifolds({
        bodyPairs: [[lowerBody, upperBody]],
        finiteBodyColliderPairs: [],
        infiniteBodyColliderPairs: []
      })

      expect(manifold).to.not.equal(undefined)
      expect(manifold.isRestingContact).to.equal(true)
      expect(manifold.contactType).to.equal('patch')
      expect(manifold.featureId).to.equal(undefined)
      expect(manifold.featurePairId).to.equal('cuboid:a:face:+y|cuboid:b:face:-x')
    })
    it('should keep cuboid pair face metadata stable when body pair order changes', () => {
      const lowerBody = new Body({ mass: 1 })

      lowerBody.volume = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })

      lowerBody.volume.center.set([0, 0.5, 0])

      const upperBody = new Body({ mass: 1 })

      upperBody.volume = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })

      upperBody.volume.center.set([0, 1.45, 0])

      const [forwardManifold] = Narrowphase.calculateCollisionManifolds({
        bodyPairs: [[lowerBody, upperBody]],
        finiteBodyColliderPairs: [],
        infiniteBodyColliderPairs: []
      })

      const [reversed] = Narrowphase.calculateCollisionManifolds({
        bodyPairs: [[upperBody, lowerBody]],
        finiteBodyColliderPairs: [],
        infiniteBodyColliderPairs: []
      })

      expect(forwardManifold.featurePairId).to.equal('cuboid:a:face:+y|cuboid:b:face:-y')
      expect(reversed.featurePairId).to.equal(forwardManifold.featurePairId)
    })
    it('should hoist polygon cuboid support feature pair metadata onto collision manifolds', () => {
      const body = new Body({ mass: 1 })

      body.volume = new Cuboid({
        origin: new Vector3([0, 1, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const polygon = new Polygon({
        vertices: [new Vector3([-2, 0, -2]), new Vector3([2, 0, -2]), new Vector3([0, 0, 2])]
      })

      const [manifold] = Narrowphase.calculateCollisionManifolds({
        bodyPairs: [],
        finiteBodyColliderPairs: [[body, polygon]],
        infiniteBodyColliderPairs: []
      })

      expect(manifold).to.not.equal(undefined)
      expect(manifold.isRestingContact).to.equal(true)
      expect(manifold.contactType).to.equal('patch')
      expect(manifold.featureId).to.equal(undefined)
      expect(manifold.featurePairId).to.equal('cuboid:face:-y|polygon:face')
    })
    it('should hoist cylinder cap feature pair metadata onto collision manifolds', () => {
      const body = new Body({ mass: 1 })

      body.volume = new Cylinder({
        origin: Vector3.createZero(),
        radius: 0.5,
        height: 1.2
      })

      const entity = new Entity()

      entity.translation.y = 0.6

      body.volume.applyTransform(entity)

      const plane = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      const [manifold] = Narrowphase.calculateCollisionManifolds({
        bodyPairs: [],
        finiteBodyColliderPairs: [],
        infiniteBodyColliderPairs: [[body, plane]]
      })

      expect(manifold).to.not.equal(undefined)
      expect(manifold.isRestingContact).to.equal(true)
      expect(manifold.contactType).to.equal('patch')
      expect(manifold.featureId).to.equal(undefined)
      expect(manifold.featurePairId).to.equal('cylinder:cap:-axis|plane:face')
    })
    it('should hoist cylinder side-line feature pair metadata onto collision manifolds', () => {
      const body = new Body({ mass: 1 })

      body.volume = new Cylinder({
        origin: Vector3.createZero(),
        radius: 0.5,
        height: 1.2
      })

      const entity = new Entity()

      entity.translation.y = 0.5

      entity.rotation.set(Quaternion.setFromAxisAngle(Vector3.createForward(), Math.PI / 2))
      body.volume.applyTransform(entity)

      const plane = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      const [manifold] = Narrowphase.calculateCollisionManifolds({
        bodyPairs: [],
        finiteBodyColliderPairs: [],
        infiniteBodyColliderPairs: [[body, plane]]
      })

      expect(manifold).to.not.equal(undefined)
      expect(manifold.isRestingContact).to.equal(true)
      expect(manifold.contactType).to.equal('line')
      expect(manifold.featureId).to.equal(undefined)
      expect(manifold.featurePairId).to.equal('cylinder:side-line|plane:face')
      expect(manifold.collisions).to.have.lengthOf(2)
    })
    it('should assign stable manifold and contact ids across repeated narrowphase runs', () => {
      const body = new Body({ mass: 1 })

      body.volume = new Sphere({
        origin: new Vector3([0, 0, 0]),
        radius: 1
      })

      const collider = new Polygon({
        vertices: [new Vector3([-2, -1, -2]), new Vector3([2, -1, -2]), new Vector3([0, -1, 2])]
      })

      const firstPass = Narrowphase.calculateCollisionManifolds({
        bodyPairs: [],
        finiteBodyColliderPairs: [[body, collider]],
        infiniteBodyColliderPairs: []
      })

      const secondPass = Narrowphase.calculateCollisionManifolds({
        bodyPairs: [],
        finiteBodyColliderPairs: [[body, collider]],
        infiniteBodyColliderPairs: []
      })

      expect(firstPass).to.have.lengthOf(1)
      expect(secondPass).to.have.lengthOf(1)
      expect(firstPass[0].id).to.equal(secondPass[0].id)
      expect(firstPass[0].collisions.map(({ id }) => id)).to.deep.equal(secondPass[0].collisions.map(({ id }) => id))
    })
    it('should preserve contact ids through scene updates for persistent support contacts', () => {
      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 1 })

      body.volume = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })
      entity.translation.y = 1
      entity.components['body'] = body
      scene.entities['box'] = entity
      scene.colliders['ground'] = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      for (let index = 0; index < 120; index++) {
        scene.update(1 / 60)
      }

      const firstIds = scene.collisionManifolds.flatMap(({ collisions }) => collisions.map(({ id }) => id))

      scene.update(1 / 60)

      const secondIds = scene.collisionManifolds.flatMap(({ collisions }) => collisions.map(({ id }) => id))

      expect(firstIds.length).to.be.greaterThan(0)
      expect(secondIds).to.deep.equal(firstIds)
    })
  })
  describe('scene collision detection', () => {
    it('should detect finite colliders without a broadphase cache', () => {
      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 1 })

      body.volume = new Sphere({
        origin: new Vector3([0, 0, 0]),
        radius: 1
      })
      entity.components['body'] = body
      scene.entities['ball'] = entity
      scene.colliders['floor'] = new Polygon({
        vertices: [new Vector3([-2, -1, -2]), new Vector3([2, -1, -2]), new Vector3([0, -1, 2])]
      })

      body.applyTransform(entity)

      ;(scene.physics as any).colliders = Object.values(scene.colliders)

      ;(scene.physics as any).detectCollisions([body])
      expect(scene.collisionManifolds).to.have.lengthOf(1)
      expect(scene.collisionManifolds[0].bodies[0]).to.equal(body)
      expect(scene.collisionManifolds[0].bodies[1]).to.equal(null)
    })
    it('should keep a falling cuboid above a ground plane', function () {
      this.timeout(10000)

      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 1 })

      body.volume = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })
      entity.translation.y = 3
      entity.components['body'] = body
      scene.entities['box'] = entity
      scene.colliders['ground'] = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      for (let index = 0; index < 2400; index++) {
        scene.update(1 / 60)
      }

      expect(entity.translation.y).to.be.greaterThanOrEqual(body.volume.center.y - 1e-6)
      expect(entity.translation.y).to.be.greaterThanOrEqual((body.volume as Cuboid).extents.y - 1e-3)
      expect(body.volume.center.y).to.be.greaterThanOrEqual((body.volume as Cuboid).extents.y - 1e-3)
    })
    it('should keep a rotated cuboid above a polygon floor split into two triangles', function () {
      this.timeout(10000)

      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 100 })

      body.volume = new Cuboid({
        origin: new Vector3([0.1299, 0.00887, 0.00031]),
        extents: new Vector3([1.14198, 1.28806, 1.07139])
      })

      entity.translation.set([-1.7756927013397217, 1.7921515703201294, -0.1794224977493286])
      entity.rotation.set([0.0, -0.1736481636762619, 0.0, 0.9848077297210693])

      entity.components['body'] = body
      scene.entities['chair'] = entity
      scene.colliders['floor0'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, 10]), new Vector3([10, 0, -10])]
      })
      scene.colliders['floor1'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, -10]), new Vector3([-10, 0, -10])]
      })

      for (let index = 0; index < 12000; index++) {
        scene.update(1 / 60)
      }

      expect(body.volume.center.y).to.be.greaterThanOrEqual(0.6)
      expect(entity.translation.y).to.be.greaterThanOrEqual(0.55)
    })
    it('should put a resting sphere to sleep and wake it when motion is applied', function () {
      this.timeout(10000)

      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 1 })

      body.volume = new Sphere({
        origin: Vector3.createZero(),
        radius: 0.5
      })
      entity.translation.y = 2
      entity.components['body'] = body
      scene.entities['box'] = entity
      scene.colliders['ground'] = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      for (let index = 0; index < 600; index++) {
        scene.update(1 / 60)
      }

      const restingHeight = entity.translation.y

      expect(body.isSleeping).to.equal(true)
      expect(body.linearVelocity.magnitude).to.equal(0)
      expect(body.angularVelocity.magnitude).to.equal(0)

      for (let index = 0; index < 120; index++) {
        scene.update(1 / 60)
      }

      expect(entity.translation.y).to.be.closeTo(restingHeight, 1e-6)

      body.linearVelocity.y = 2

      scene.update(1 / 60)
      expect(body.isSleeping).to.equal(false)
      expect(entity.translation.y).to.be.greaterThan(restingHeight)
    })
    it('should wake a sleeping sphere when another body collides with it', function () {
      this.timeout(10000)

      const scene = new Scene()
      const sleeperEntity = new Entity()
      const sleeper = new Body({ mass: 1 })

      sleeper.volume = new Sphere({
        origin: Vector3.createZero(),
        radius: 0.5
      })

      sleeperEntity.translation.set([0, 2, 0])

      sleeperEntity.components['body'] = sleeper
      scene.entities['sleeper'] = sleeperEntity
      scene.colliders['ground'] = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      for (let index = 0; index < 240; index++) {
        scene.update(1 / 60)
      }

      expect(sleeper.isSleeping).to.equal(true)

      const strikerEntity = new Entity()
      const striker = new Body({ mass: 1 })

      striker.volume = new Sphere({
        origin: Vector3.createZero(),
        radius: 0.5
      })

      strikerEntity.translation.set([-3, 0.5, 0])

      striker.linearVelocity.x = 5
      strikerEntity.components['body'] = striker
      scene.entities['striker'] = strikerEntity

      for (let index = 0; index < 120; index++) {
        scene.update(1 / 60)
      }

      expect(sleeper.isSleeping).to.equal(false)
      expect(sleeperEntity.translation.x).to.be.greaterThan(0.25)
    })
    it('should suppress resting restitution without adding penetration velocity', () => {
      const entity = new Entity()
      const body = new Body({ mass: 1 })

      body.restitution = 1
      body.volume = new Sphere({
        origin: Vector3.createZero(),
        radius: 1
      })

      entity.translation.set([0, 1, 0])
      body.applyTransform(entity)
      body.volume.calculateInverseInertia(body.mass, entity)
      body.linearVelocity.set([0, -1, 0])
      solver.beginVelocityFrame()
      solver.solveVelocities(
        [
          {
            id: 'metadata-resting-patch',
            bodies: [body, null],
            isRestingContact: true,
            contactType: 'patch',
            collisions: [
              {
                id: 'contact-a',
                point: Vector3.createZero(),
                normal: Vector3.createDown(),
                penetrationDepth: 0.061,
                isRestingContact: true,
                contactType: 'patch'
              },
              {
                id: 'contact-b',
                point: Vector3.createZero(),
                normal: Vector3.createDown(),
                penetrationDepth: 0.061,
                isRestingContact: true,
                contactType: 'patch'
              }
            ]
          }
        ],
        60
      )
      solver.endVelocityFrame()
      expect(body.linearVelocity.y).to.be.closeTo(0, 1e-6)
    })
    it('should preserve static support persistence through feature pair ids', () => {
      const entity = new Entity()
      const body = new Body({ mass: 1 })

      body.volume = new Sphere({
        origin: Vector3.createZero(),
        radius: 1
      })

      entity.translation.set([0, 1, 0])
      body.applyTransform(entity)
      body.volume.calculateInverseInertia(body.mass, entity)

      const createManifold = (frame: number) => ({
        id: 'drifting-static-patch',
        bodies: [body, null] as [Body, null],
        isRestingContact: true,
        contactType: 'patch' as const,
        featurePairId: 'sphere:surface|plane:face',
        collisions: [
          {
            id: `contact-a-${frame}`,
            point: new Vector3([frame * 0.02, 0, 0]),
            normal: Vector3.createDown(),
            penetrationDepth: 0,
            isRestingContact: true,
            contactType: 'patch' as const
          },
          {
            id: `contact-b-${frame}`,
            point: new Vector3([frame * 0.02 + 0.5, 0, 0]),
            normal: Vector3.createDown(),
            penetrationDepth: 0,
            isRestingContact: true,
            contactType: 'patch' as const
          }
        ]
      })

      for (let frame = 0; frame < 3; frame++) {
        const manifold = createManifold(frame)

        solver.beginVelocityFrame()
        solver.solveVelocities([manifold], 60)
        solver.endVelocityFrame()
        solver.solvePositions([manifold])
        solver.finishStep([manifold], [body], 1 / 60)
      }

      expect(body.sleepFrames).to.be.greaterThan(0)
    })
    it('should preserve static support persistence across equivalent collider manifolds', () => {
      const entity = new Entity()
      const body = new Body({ mass: 1 })

      body.volume = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })

      entity.translation.set([0, 0.5, 0])
      body.applyTransform(entity)
      body.volume.calculateInverseInertia(body.mass, entity)

      const createManifold = (frame: number) => ({
        id: `split-floor-patch-${frame % 2}`,
        bodies: [body, null] as [Body, null],
        isRestingContact: true,
        contactType: 'patch' as const,
        featurePairId: 'cuboid:face:-y|polygon:face',
        collisions: [
          {
            id: `contact-a-${frame}`,
            point: new Vector3([0, 0, frame * 0.01]),
            normal: Vector3.createDown(),
            penetrationDepth: 0,
            isRestingContact: true,
            contactType: 'patch' as const
          },
          {
            id: `contact-b-${frame}`,
            point: new Vector3([0.5, 0, frame * 0.01]),
            normal: Vector3.createDown(),
            penetrationDepth: 0,
            isRestingContact: true,
            contactType: 'patch' as const
          }
        ]
      })

      for (let frame = 0; frame < 3; frame++) {
        const manifold = createManifold(frame)

        solver.beginVelocityFrame()
        solver.solveVelocities([manifold], 60)
        solver.endVelocityFrame()
        solver.solvePositions([manifold])
        solver.finishStep([manifold], [body], 1 / 60)
      }

      expect(body.sleepFrames).to.be.greaterThan(0)
    })
    it('should preserve dynamic stack support persistence through feature pair ids', () => {
      const lowerEntity = new Entity()
      const lowerBody = new Body({ mass: 1 })

      lowerBody.volume = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })

      lowerEntity.translation.set([0, 0.5, 0])
      lowerBody.applyTransform(lowerEntity)
      lowerBody.volume.calculateInverseInertia(lowerBody.mass, lowerEntity)

      const upperEntity = new Entity()
      const upperBody = new Body({ mass: 1 })

      upperBody.volume = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })

      upperEntity.translation.set([0, 1.5, 0])
      upperBody.applyTransform(upperEntity)
      upperBody.volume.calculateInverseInertia(upperBody.mass, upperEntity)
      lowerBody.sleep()

      const createManifold = (frame: number) => ({
        id: 'drifting-cuboid-stack-patch',
        bodies: [lowerBody, upperBody] as [Body, Body],
        isRestingContact: true,
        contactType: 'patch' as const,
        featurePairId: 'cuboid:a:face:+y|cuboid:b:face:-y',
        collisions: [
          {
            id: `contact-a-${frame}`,
            point: new Vector3([frame * 0.02, 1, 0]),
            normal: Vector3.createUp(),
            penetrationDepth: 0,
            isRestingContact: true,
            contactType: 'patch' as const
          },
          {
            id: `contact-b-${frame}`,
            point: new Vector3([frame * 0.02 + 0.5, 1, 0]),
            normal: Vector3.createUp(),
            penetrationDepth: 0,
            isRestingContact: true,
            contactType: 'patch' as const
          }
        ]
      })

      for (let frame = 0; frame < 3; frame++) {
        const manifold = createManifold(frame)

        solver.beginVelocityFrame()
        solver.solveVelocities([manifold], 60)
        solver.endVelocityFrame()
        solver.solvePositions([manifold], new Set([lowerBody]))
        solver.finishStep([manifold], [lowerBody, upperBody], 1 / 60, new Set([lowerBody]))
      }

      expect(upperBody.sleepFrames).to.be.greaterThan(0)
    })
    it('should let the rotated chair cuboid settle to rest on the polygon floor', function () {
      this.timeout(10000)

      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 100 })

      body.volume = new Cuboid({
        origin: new Vector3([0.1299, 0.00887, 0.00031]),
        extents: new Vector3([1.14198, 1.28806, 1.07139])
      })

      entity.translation.set([-1.7756927013397217, 1.7921515703201294, -0.1794224977493286])
      entity.rotation.set([0.0, -0.1736481636762619, 0.0, 0.9848077297210693])

      entity.components['body'] = body
      scene.entities['chair'] = entity
      scene.colliders['floor0'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, 10]), new Vector3([10, 0, -10])]
      })
      scene.colliders['floor1'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, -10]), new Vector3([-10, 0, -10])]
      })

      for (let index = 0; index < 2400; index++) {
        scene.update(1 / 60)
      }

      expect(body.linearVelocity.magnitude).to.equal(0)
      expect(body.angularVelocity.magnitude).to.equal(0)
      expect(body.volume.center.y).to.be.greaterThanOrEqual(1.28)
      expect(body.volume.center.y).to.be.lessThanOrEqual(1.33)
    })
    it('should keep settled chair support manifolds bounded on the split polygon floor', function () {
      this.timeout(10000)

      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 100 })

      body.volume = new Cuboid({
        origin: new Vector3([0.1299, 0.00887, 0.00031]),
        extents: new Vector3([1.14198, 1.28806, 1.07139])
      })

      entity.translation.set([-1.7756927013397217, 1.7921515703201294, -0.1794224977493286])
      entity.rotation.set([0.0, -0.1736481636762619, 0.0, 0.9848077297210693])

      entity.components['body'] = body
      scene.entities['chair'] = entity
      scene.colliders['floor0'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, 10]), new Vector3([10, 0, -10])]
      })
      scene.colliders['floor1'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, -10]), new Vector3([-10, 0, -10])]
      })

      for (let index = 0; index < 2400; index++) {
        scene.update(1 / 60)
      }

      for (let index = 0; index < 120; index++) {
        scene.update(1 / 60)

        const manifolds = scene.collisionManifolds.filter(({ bodies }) => bodies[0] === body && bodies[1] === null)

        expect(manifolds.length).to.be.greaterThan(0)
        manifolds.forEach((manifold) => {
          expect(manifold.collisions.length).to.be.within(1, 4)
          manifold.collisions.forEach((collision) => {
            expect(collision.normal.y).to.be.lessThan(-0.99)
            expect(Math.abs(collision.point.y)).to.be.lessThan(1e-3)
          })
        })
      }
    })
    it('should let the rotated chair cuboid fall asleep on the polygon floor', function () {
      this.timeout(10000)

      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 100 })

      body.volume = new Cuboid({
        origin: new Vector3([0.1299, 0.00887, 0.00031]),
        extents: new Vector3([1.14198, 1.28806, 1.07139])
      })

      entity.translation.set([-1.7756927013397217, 1.7921515703201294, -0.1794224977493286])
      entity.rotation.set([0.0, -0.1736481636762619, 0.0, 0.9848077297210693])

      entity.components['body'] = body
      scene.entities['chair'] = entity
      scene.colliders['floor0'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, 10]), new Vector3([10, 0, -10])]
      })
      scene.colliders['floor1'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, -10]), new Vector3([-10, 0, -10])]
      })

      for (let index = 0; index < 3600; index++) {
        scene.update(1 / 60)
      }

      expect(body.isSleeping).to.equal(true)
      expect(body.linearVelocity.magnitude).to.equal(0)
      expect(body.angularVelocity.magnitude).to.equal(0)
      expect(body.volume.center.y).to.be.greaterThanOrEqual(1.28)
      expect(body.volume.center.y).to.be.lessThanOrEqual(1.33)
    })
    it('should let a dynamic box stack settle on another box above the ground', function () {
      this.timeout(20000)

      const scene = new Scene()

      const lowerEntity = new Entity()
      const lowerBody = new Body({ mass: 1 })

      lowerBody.volume = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })

      lowerEntity.translation.set([0, 0.5, 0])

      lowerEntity.components['body'] = lowerBody
      scene.entities['lower'] = lowerEntity

      const upperEntity = new Entity()
      const upperBody = new Body({ mass: 1 })

      upperBody.volume = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })

      upperEntity.translation.set([0, 1.52, 0])

      upperEntity.components['body'] = upperBody
      scene.entities['upper'] = upperEntity
      scene.colliders['ground'] = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      for (let index = 0; index < 3600; index++) {
        scene.update(1 / 60)
      }

      expect(lowerBody.isSleeping).to.equal(true)
      expect(upperBody.isSleeping).to.equal(true)
      expect(lowerBody.volume.center.y).to.be.closeTo(0.5, 0.02)
      expect(upperBody.volume.center.y).to.be.closeTo(1.5, 0.03)
      expect(upperBody.volume.center.y).to.be.greaterThan(lowerBody.volume.center.y + 0.95)
    })
    it('should wake a stacked box when its supporting box moves away', function () {
      this.timeout(10000)

      const scene = new Scene()

      const createBox = (name: string, y: number) => {
        const entity = new Entity()
        const body = new Body({ mass: 1 })

        body.volume = new Cuboid({
          origin: Vector3.createZero(),
          extents: new Vector3([0.5, 0.5, 0.5])
        })

        entity.translation.set([0, y, 0])

        entity.components['body'] = body
        scene.entities[name] = entity

        return { entity, body }
      }

      const lowerBox = createBox('lower', 0.5)
      const upperBox = createBox('upper', 1.52)

      scene.colliders['ground'] = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      for (let index = 0; index < 600; index++) {
        scene.update(1 / 60)
      }

      expect(lowerBox.body.isSleeping).to.equal(true)
      expect(upperBox.body.isSleeping).to.equal(true)
      lowerBox.body.wake()
      scene.update(1 / 60)
      expect(upperBox.body.isSleeping).to.equal(true)

      lowerBox.body.linearVelocity.x = 8

      lowerBox.body.wake()
      scene.update(1 / 60)
      expect(upperBox.body.isSleeping).to.equal(false)

      for (let index = 0; index < 120; index++) {
        scene.update(1 / 60)
      }

      expect(lowerBox.entity.translation.x).to.be.greaterThan(5)
      expect(upperBox.entity.translation.y).to.be.closeTo(0.5, 0.03)
    })
    it('should keep a grounded axis-aligned box from picking up large angular drift on impact', function () {
      this.timeout(10000)

      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 1 })

      body.volume = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([1, 1, 1])
      })

      entity.translation.set([-6.701627731323242, 1.7623368501663208, -0.1981678009033203])

      entity.components['body'] = body
      scene.entities['box'] = entity
      scene.colliders['ground'] = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      for (let index = 0; index < 45; index++) {
        scene.update(1 / 60)
      }

      expect(body.angularVelocity.magnitude).to.be.lessThan(0.2)
      expect((body.volume as Cuboid).axes[1].y).to.be.greaterThan(0.999)
      expect(body.volume.center.y).to.be.closeTo(1, 0.03)
    })
    it('should keep a widely spaced three-box drop from bouncing apart before settling', function () {
      this.timeout(10000)

      const scene = new Scene()

      const makeBox = (name: string, y: number) => {
        const entity = new Entity()
        const body = new Body({ mass: 1 })

        body.volume = new Cuboid({
          origin: Vector3.createZero(),
          extents: new Vector3([1, 1, 1])
        })

        entity.translation.set([-6.701627731323242, y, -0.1981678009033203])

        entity.components['body'] = body
        scene.entities[name] = entity

        return body
      }

      const lowerBody = makeBox('lower', 1.7623368501663208)
      const middleBody = makeBox('middle', 5.538577556610107)
      const upperBody = makeBox('upper', 9.527298927307129)

      scene.colliders['floor0'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, 10]), new Vector3([10, 0, -10])]
      })
      scene.colliders['floor1'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, -10]), new Vector3([-10, 0, -10])]
      })

      let minimumLowerGap = Infinity
      let minimumUpperGap = Infinity

      for (let index = 0; index < 1440; index++) {
        scene.update(1 / 60)

        minimumLowerGap = Math.min(minimumLowerGap, middleBody.volume.center.y - lowerBody.volume.center.y)
        minimumUpperGap = Math.min(minimumUpperGap, upperBody.volume.center.y - middleBody.volume.center.y)
      }

      expect(lowerBody.isSleeping).to.equal(true)
      expect(middleBody.isSleeping).to.equal(true)
      expect(upperBody.isSleeping).to.equal(true)
      expect(minimumLowerGap).to.be.greaterThan(1.2)
      expect(minimumUpperGap).to.be.greaterThan(1.2)
      expect(lowerBody.volume.center.y).to.be.closeTo(1, 0.08)
      expect(middleBody.volume.center.y).to.be.closeTo(3, 0.12)
      expect(upperBody.volume.center.y).to.be.closeTo(5, 0.18)
    })
    it('should keep the duplicated rotated chair stacked above the settled chair', function () {
      this.timeout(20000)

      const scene = new Scene()

      const lowerEntity = new Entity()
      const lowerBody = new Body({ mass: 100 })

      lowerBody.volume = new Cuboid({
        origin: new Vector3([0.1299, 0.00887, 0.00031]),
        extents: new Vector3([1.14198, 1.28806, 1.07139])
      })

      lowerEntity.translation.set([-1.7756927013397217, 1.7921515703201294, -0.1794224977493286])
      lowerEntity.rotation.set([0.0, -0.1736481636762619, 0.0, 0.9848077297210693])

      lowerEntity.components['body'] = lowerBody
      scene.entities['lower'] = lowerEntity

      const upperEntity = new Entity()
      const upperBody = new Body({ mass: 100 })

      upperBody.volume = new Cuboid({
        origin: new Vector3([0.1299, 0.00887, 0.00031]),
        extents: new Vector3([1.14198, 1.28806, 1.07139])
      })

      upperEntity.translation.set([-1.7756927013397217, 4.388271808624268, -0.1794224977493286])
      upperEntity.rotation.set([0.0, -0.17364811897277832, 0.0, 0.9848077893257141])

      upperEntity.components['body'] = upperBody
      scene.entities['upper'] = upperEntity
      scene.colliders['floor0'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, 10]), new Vector3([10, 0, -10])]
      })
      scene.colliders['floor1'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, -10]), new Vector3([-10, 0, -10])]
      })

      for (let index = 0; index < 3600; index++) {
        scene.update(1 / 60)
      }

      expect(lowerBody.isSleeping).to.equal(true)
      expect(upperBody.isSleeping).to.equal(true)
      expect(lowerBody.volume.center.y).to.be.within(1.28, 1.33)
      expect(upperBody.volume.center.y).to.be.within(3.83, 3.88)
      expect(upperBody.volume.center.y).to.be.greaterThan(lowerBody.volume.center.y + 2.5)
    })
    it('should let a resting cylinder on the polygon floor fall asleep', function () {
      this.timeout(10000)

      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 200 })

      body.volume = new Cylinder({
        radius: 1.20813,
        height: 1.21804,
        origin: new Vector3([-0.01248, 0.00085, -0.00244])
      })

      entity.translation.set([1.59882390499115, 1.3112326860427856, 0.5875328183174133])

      entity.components['body'] = body
      scene.entities['table'] = entity
      scene.colliders['floor0'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, 10]), new Vector3([10, 0, -10])]
      })
      scene.colliders['floor1'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, -10]), new Vector3([-10, 0, -10])]
      })

      for (let index = 0; index < 1800; index++) {
        scene.update(1 / 60)
      }

      expect(body.isSleeping).to.equal(true)
      expect(body.linearVelocity.magnitude).to.equal(0)
      expect(body.angularVelocity.magnitude).to.equal(0)
      expect(body.volume.center.y).to.be.greaterThanOrEqual(0.59)
      expect(body.volume.center.y).to.be.lessThanOrEqual(0.62)
    })
    it('should keep a cylinder above a finite triangulated passive floor', function () {
      this.timeout(10000)

      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 1 })

      body.volume = new Cylinder({ radius: 0.06, height: 0.24 })

      entity.translation.set([0, 0.8, 0])

      entity.components['body'] = body
      scene.entities['cylinder'] = entity
      scene.colliders['floor0'] = new Polygon({
        vertices: [new Vector3([-1.5, 0, 1.5]), new Vector3([1.5, 0, 1.5]), new Vector3([1.5, 0, -1.5])]
      })
      scene.colliders['floor1'] = new Polygon({
        vertices: [new Vector3([-1.5, 0, 1.5]), new Vector3([1.5, 0, -1.5]), new Vector3([-1.5, 0, -1.5])]
      })

      for (let index = 0; index < 600; index++) {
        scene.update(1 / 60)
      }

      expect(body.volume.center.y).to.be.closeTo(
        (body.volume as Cylinder).calculateEffectiveRadius(Vector3.createUp()),
        0.002
      )
      expect(body.linearVelocity.magnitude).to.equal(0)
    })
    it('should keep a dynamic cylinder supported by a passive cuboid', function () {
      this.timeout(10000)

      const scene = new Scene()
      const floorEntity = new Entity()
      const floorBody = new Body({ mass: 0, motionType: 'static' })

      floorBody.volume = new Cuboid({ extents: new Vector3([2, 0.5, 2]) })
      floorEntity.components['body'] = floorBody
      scene.entities['floor'] = floorEntity

      const cylinderEntity = new Entity()
      const cylinderBody = new Body({ mass: 1 })

      cylinderBody.volume = new Cylinder({ radius: 0.5, height: 1.2, axisIndex: 1 })

      cylinderEntity.translation.set([0, 3, 0])

      cylinderEntity.components['body'] = cylinderBody
      scene.entities['cylinder'] = cylinderEntity

      for (let index = 0; index < 1800; index++) {
        scene.update(1 / 60)
      }

      expect(cylinderBody.volume.center.y).to.be.greaterThanOrEqual(1.08)
      expect(cylinderBody.volume.center.y).to.be.lessThanOrEqual(1.12)
      expect(Math.abs(cylinderBody.linearVelocity.y)).to.be.lessThan(0.1)
    })
    it('should let a resting cylinder on a plane fall asleep without gaining height', function () {
      this.timeout(10000)

      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 1 })

      body.volume = new Cylinder({
        radius: 0.16033,
        height: 0.26418,
        origin: new Vector3([-0.00061, 0.00527, -0.00418])
      })

      entity.translation.set([3.991121292114258, 2.558067560195923, 0.846178412437439])

      entity.components['body'] = body
      scene.entities['cup'] = entity
      scene.colliders['ground'] = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      let maximumHeightAfterSettling = -Infinity

      for (let index = 0; index < 600; index++) {
        scene.update(1 / 60)

        if (index > 180) {
          maximumHeightAfterSettling = Math.max(maximumHeightAfterSettling, body.volume.center.y)
        }
      }

      expect(body.isSleeping).to.equal(true)
      expect(body.linearVelocity.magnitude).to.equal(0)
      expect(maximumHeightAfterSettling).to.be.lessThan(0.2)
      expect(body.volume.center.y).to.be.closeTo(
        (body.volume as Cylinder).calculateEffectiveRadius(Vector3.createUp()),
        0.002
      )
    })
    it('should let a sideways cylinder move downhill on a slope', function () {
      this.timeout(10000)

      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 10 })

      body.friction = 0.6
      body.restitution = 0
      body.volume = new Cylinder({
        radius: 0.5,
        height: 1.2,
        origin: Vector3.createZero()
      })

      entity.translation.set([0, 2.6, 0])
      entity.rotation.set(Quaternion.setFromAxisAngle(Vector3.createForward(), Math.PI / 2))

      entity.components['body'] = body
      scene.entities['cylinder'] = entity
      scene.colliders['slope0'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, 10]), new Vector3([10, 4, -10])]
      })
      scene.colliders['slope1'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 4, -10]), new Vector3([-10, 4, -10])]
      })

      for (let index = 0; index < 240; index++) {
        scene.update(1 / 60)
      }

      expect(entity.translation.z).to.be.greaterThan(1.5)
      expect(body.volume.center.z).to.be.greaterThan(1.5)
    })
    it('should let a sideways cylinder pick up spin from flat-ground rolling friction', function () {
      this.timeout(10000)

      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 10 })

      body.friction = 0.8
      body.restitution = 0
      body.volume = new Cylinder({
        radius: 0.5,
        height: 1.2,
        origin: Vector3.createZero()
      })

      entity.translation.set([0, 1.2, 0])
      entity.rotation.set(Quaternion.setFromAxisAngle(Vector3.createForward(), Math.PI / 2))

      entity.components['body'] = body
      scene.entities['cylinder'] = entity
      scene.colliders['ground'] = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      body.linearVelocity.set([0, 0, 3])

      for (let index = 0; index < 240; index++) {
        scene.update(1 / 60)
      }

      expect(entity.translation.z).to.be.greaterThan(1)
      expect(Math.abs(body.angularVelocity.x)).to.be.greaterThan(0.5)
    })
    it('should keep a rotating cylinder collider aligned with the entity rotation during the same update', () => {
      const entity = new Entity()
      const body = new Body({ mass: 2 })

      body.volume = new Cylinder({
        radius: 0.5,
        height: 1.2,
        origin: Vector3.createZero()
      })
      entity.components['body'] = body

      entity.update(0)
      body.applyTransform(entity)
      body.torque.set([0, 0, 8])
      body.update(entity, 1 / 60)

      const expectedAxis = entity.rotation.transformVector3(Vector3.createUp(), new Vector3()).normalize()

      expect((body.volume as Cuboid).axes[2].x).to.be.closeTo(expectedAxis.x, 1e-6)
      expect((body.volume as Cuboid).axes[2].y).to.be.closeTo(expectedAxis.y, 1e-6)
      expect((body.volume as Cuboid).axes[2].z).to.be.closeTo(expectedAxis.z, 1e-6)
    })
  })
  describe('intersectRayWithPlane', () => {
    it('should detect collision when ray intersects plane', () => {
      const ray = new Ray({
        origin: new Vector3([0, 1, 0]),
        direction: Vector3.createDown()
      })

      const plane = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      const collision = intersectRayWithPlane(ray, plane)

      assert.ok(collision)
      expect(collision.distance).to.equal(1)
      expect(collision.point.xyz).to.deep.equal(Vector3.createZero().xyz)
      expect(collision.normal.xyz).to.deep.equal(Vector3.createUp().xyz)
    })
    it('should not detect collision when ray is parallel to plane', () => {
      const ray = new Ray({
        origin: new Vector3([0, 1, 0]),
        direction: Vector3.createForward()
      })

      const plane = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      const collision = intersectRayWithPlane(ray, plane)

      expect(collision).to.equal(null)
    })
  })
  describe('intersectRayWithSphere', () => {
    it('should detect collision when ray intersects sphere', () => {
      const ray = new Ray({
        origin: new Vector3([0, 0, 0]),
        direction: Vector3.createUp()
      })

      const sphere = new Sphere({
        origin: new Vector3([0, 2, 0]),
        radius: 1
      })

      const collision = intersectRayWithSphere(ray, sphere)

      assert.ok(collision)
      expect(collision.distance).to.equal(1)
      expect(collision.normal.xyz).to.deep.equal(Vector3.createDown().xyz)
      expect(collision.point.xyz).to.deep.equal(new Vector3([0, 1, 0]).xyz)
    })
    it('should not detect collision when ray is parallel to sphere', () => {
      const ray = new Ray({
        origin: new Vector3([0, 0, 0]),
        direction: Vector3.createForward()
      })

      const sphere = new Sphere({
        origin: new Vector3([2, 0, 0]),
        radius: 1
      })

      const collision = intersectRayWithSphere(ray, sphere)

      expect(collision).to.equal(null)
    })
  })
  describe('intersectRayWithCuboid', () => {
    it('should detect collision when ray intersects cuboid', () => {
      const ray = new Ray({
        origin: new Vector3([0, 0, 0]),
        direction: Vector3.createUp()
      })

      const cuboid = new Cuboid({
        origin: new Vector3([0, 2, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const collision = intersectRayWithCuboid(ray, cuboid)

      assert.ok(collision)
      expect(collision.distance).to.equal(1)
      expect(Vector3.subtract(collision.normal, Vector3.createDown()).magnitude).to.be.lessThan(1e-6)
      expect(collision.point.xyz).to.deep.equal(new Vector3([0, 1, 0]).xyz)
    })
    it('should not detect collision when ray is parallel to cuboid', () => {
      const ray = new Ray({
        origin: new Vector3([0, 0, 0]),
        direction: Vector3.createForward()
      })

      const cuboid = new Cuboid({
        origin: new Vector3([2, 0, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const collision = intersectRayWithCuboid(ray, cuboid)

      expect(collision).to.equal(null)
    })
  })
  describe('collidePlaneWithSphere', () => {
    it('should detect collision when sphere is on plane', () => {
      const plane = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      const sphere = new Sphere({
        origin: new Vector3([0, 1, 0]),
        radius: 1
      })

      const collisions = collidePlaneWithSphere(plane, sphere)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(1)
      expect(collisions[0].penetrationDepth).to.equal(0)
      expect(collisions[0].normal.xyz).to.deep.equal(Vector3.createUp().xyz)
      expect(collisions[0].point.xyz).to.deep.equal(Vector3.createZero().xyz)
    })
    it('should not detect collision when sphere is above plane', () => {
      const plane = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      const sphere = new Sphere({
        origin: new Vector3([0, 3, 0]),
        radius: 1
      })

      const collisions = collidePlaneWithSphere(plane, sphere)

      expect(collisions).to.equal(null)
    })
    it('should detect collision when sphere is below plane', () => {
      const plane = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      const sphere = new Sphere({
        origin: new Vector3([0, -1, 0]),
        radius: 1
      })

      const collisions = collidePlaneWithSphere(plane, sphere)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(1)
      expect(collisions[0].penetrationDepth).to.equal(2)
      expect(collisions[0].normal.xyz).to.deep.equal(Vector3.createUp().xyz)
      expect(collisions[0].point.xyz).to.deep.equal(new Vector3([0, 0, 0]).xyz)
    })
  })
  describe('collidePlaneWithCuboid', () => {
    it('should detect collision when cuboid is on plane', () => {
      const plane = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      const cuboid = new Cuboid({
        origin: new Vector3([0, 1, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const collisions = collidePlaneWithCuboid(plane, cuboid)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(4)
      collisions.forEach((collision) => {
        expect(collision.penetrationDepth).to.equal(0)
        expect(collision.normal.xyz).to.deep.equal(Vector3.createUp().xyz)
        expect(collision.isRestingContact).to.equal(true)
        expect(collision.contactType).to.equal('patch')
        expect(collision.featureId).to.match(/^cuboid:vertex:[+-]x:[+-]y:[+-]z$/)
      })

      const contacts = collisions.map(({ point: contact }) => contact)

      expect(contacts[0].xyz).to.deep.equal(new Vector3([1, 0, 1]).xyz)
      expect(contacts[1].xyz).to.deep.equal(new Vector3([1, 0, -1]).xyz)
      expect(contacts[2].xyz).to.deep.equal(new Vector3([-1, 0, 1]).xyz)
      expect(contacts[3].xyz).to.deep.equal(new Vector3([-1, 0, -1]).xyz)
    })
    it('should not detect collision when cuboid is above plane', () => {
      const plane = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      const cuboid = new Cuboid({
        origin: new Vector3([0, 3, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const collisions = collidePlaneWithCuboid(plane, cuboid)

      expect(collisions).to.equal(null)
    })
    it('should detect collision when cuboid is below plane', () => {
      const plane = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      const cuboid = new Cuboid({
        origin: new Vector3([0, -1, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const collisions = collidePlaneWithCuboid(plane, cuboid)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(8)
      collisions.forEach((collision) => {
        expect(collision.normal.xyz).to.deep.equal(Vector3.createUp().xyz)
      })

      const topCollisions = collisions.filter(({ penetrationDepth: distance }) => {
        return distance === 0
      })

      expect(topCollisions).to.have.lengthOf(4)

      const topContacts = topCollisions.map(({ point: contact }) => contact)

      expect(topContacts[0].xyz).to.deep.equal(new Vector3([1, 0, 1]).xyz)
      expect(topContacts[1].xyz).to.deep.equal(new Vector3([1, 0, -1]).xyz)
      expect(topContacts[2].xyz).to.deep.equal(new Vector3([-1, 0, 1]).xyz)
      expect(topContacts[3].xyz).to.deep.equal(new Vector3([-1, 0, -1]).xyz)

      const bottomCollisions = collisions.filter(({ penetrationDepth: distance }) => {
        return distance === 2
      })

      expect(bottomCollisions).to.have.lengthOf(4)

      const bottomContacts = bottomCollisions.map(({ point: contact }) => contact)

      expect(bottomContacts[0].xyz).to.deep.equal(new Vector3([1, 0, 1]).xyz)
      expect(bottomContacts[1].xyz).to.deep.equal(new Vector3([1, 0, -1]).xyz)
      expect(bottomContacts[2].xyz).to.deep.equal(new Vector3([-1, 0, 1]).xyz)
      expect(bottomContacts[3].xyz).to.deep.equal(new Vector3([-1, 0, -1]).xyz)
    })
  })
  describe('collidePlaneWithCylinder', () => {
    it('should detect collision at the cylinder support point on plane', () => {
      const plane = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      const cylinder = new Cylinder({
        radius: 0.5,
        height: 1.2,
        origin: Vector3.createZero()
      })

      const entity = new Entity()

      entity.rotation.set(Quaternion.setFromAxisAngle(Vector3.createForward(), Math.PI / 4))
      cylinder.applyTransform(entity)
      entity.translation.set([0, cylinder.calculateEffectiveRadius(Vector3.createDown()), 0])
      cylinder.applyTransform(entity)

      const collisions = collidePlaneWithCylinder(plane, cylinder)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(1)
      expect(collisions![0].penetrationDepth).to.be.closeTo(0, 1e-6)
      expect(collisions![0].point.y).to.be.closeTo(0, 1e-6)
      expect(collisions![0].normal.xyz).to.deep.equal(Vector3.createUp().xyz)
      expect(collisions![0].point.z).to.be.closeTo(0, 1e-6)
    })
    it('should generate a line manifold for a sideways cylinder resting on a plane', () => {
      const plane = new Plane({
        normal: Vector3.createUp(),
        distance: 0
      })

      const cylinder = new Cylinder({
        radius: 0.5,
        height: 1.2,
        origin: Vector3.createZero()
      })

      const entity = new Entity()

      entity.translation.set([0, 0.5, 0])
      entity.rotation.set(Quaternion.setFromAxisAngle(Vector3.createForward(), Math.PI / 2))
      cylinder.applyTransform(entity)

      const collisions = collidePlaneWithCylinder(plane, cylinder)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(2)
      collisions!.forEach((collision) => {
        expect(collision.penetrationDepth).to.be.closeTo(0, 1e-6)
        expect(collision.point.y).to.be.closeTo(0, 1e-6)
        expect(collision.isRestingContact).to.equal(true)
        expect(collision.contactType).to.equal('line')
      })
      expect(collisions!.map(({ featureId }) => featureId)).to.deep.equal([
        'cylinder:side-line:+axis',
        'cylinder:side-line:-axis'
      ])
      expect(collisions![0].point.x).to.be.closeTo(-0.6, 1e-5)
      expect(collisions![1].point.x).to.be.closeTo(0.6, 1e-5)
    })
  })
  describe('collideCylinderWithCuboid', () => {
    const createTransformedCylinder = (translation: Vector3, rotation = Quaternion.createIdentity()) => {
      const cylinder = new Cylinder({ radius: 0.5, height: 1.2, axisIndex: 1 })
      const entity = new Entity()

      entity.translation.set(translation)
      entity.rotation.set(rotation)
      cylinder.applyTransform(entity)

      return cylinder
    }

    it('creates a cap manifold when an upright cylinder rests on a cuboid face', () => {
      const cuboid = new Cuboid({ extents: new Vector3([2, 0.5, 2]) })
      const cylinder = createTransformedCylinder(new Vector3([0, 1.1, 0]))

      const collisions = collideCylinderWithCuboid(cylinder, cuboid)

      expect(collisions).to.have.lengthOf(1)
      collisions!.forEach((collision) => {
        expect(Vector3.add(collision.normal, Vector3.createUp()).magnitude).to.be.lessThan(1e-6)
        expect(collision.point.y).to.be.closeTo(0.5, 1e-6)
        expect(collision.penetrationDepth).to.be.closeTo(0, 1e-6)
        expect(collision.isRestingContact).to.equal(true)
        expect(collision.contactType).to.equal('patch')
        expect(collision.featureId).to.equal('cylinder:cap:-axis:center')
      })
    })
    it('creates a side-line manifold against a cuboid wall', () => {
      const cuboid = new Cuboid({ extents: new Vector3([1, 1, 1]) })
      const cylinder = createTransformedCylinder(new Vector3([1.4, 0, 0]))

      const collisions = collideCylinderWithCuboid(cylinder, cuboid)

      expect(collisions).to.have.lengthOf(2)
      collisions!.forEach((collision) => {
        expect(Vector3.add(collision.normal, Vector3.createRight()).magnitude).to.be.lessThan(1e-6)
        expect(collision.point.x).to.be.closeTo(1, 1e-6)
        expect(collision.penetrationDepth).to.be.closeTo(0.1, 1e-6)
        expect(collision.contactType).to.equal('line')
      })
    })
    it('rejects separated face and corner configurations', () => {
      const cuboid = new Cuboid({ extents: new Vector3([1, 1, 1]) })
      const above = createTransformedCylinder(new Vector3([0, 1.7, 0]))
      const beyondCorner = createTransformedCylinder(new Vector3([1.4, 0, 1.4]))

      expect(collideCylinderWithCuboid(above, cuboid)).to.equal(null)
      expect(collideCylinderWithCuboid(beyondCorner, cuboid)).to.equal(null)
    })
    it('detects a curved-surface collision at a cuboid corner', () => {
      const cuboid = new Cuboid({ extents: new Vector3([1, 1, 1]) })
      const cylinder = createTransformedCylinder(new Vector3([1.3, 0, 1.3]))

      const collisions = collideCylinderWithCuboid(cylinder, cuboid)

      expect(collisions).to.have.lengthOf(1)
      expect(collisions![0].penetrationDepth).to.be.closeTo(0.5 - Math.sqrt(0.18), 1e-5)
      expect(collisions![0].normal.x).to.be.closeTo(-Math.SQRT1_2, 1e-5)
      expect(collisions![0].normal.z).to.be.closeTo(-Math.SQRT1_2, 1e-5)
    })
    it('supports rotated cuboids and dispatcher argument reversal', () => {
      const cuboid = new Cuboid({ extents: new Vector3([1, 1, 1]) })
      const cuboidEntity = new Entity()

      cuboidEntity.rotation.set(Quaternion.setFromAxisAngle(Vector3.createUp(), Math.PI / 4))
      cuboid.applyTransform(cuboidEntity)

      const outward = cuboid.axes[0].clone()
      const cylinder = createTransformedCylinder(Vector3.scale(outward, 1.4, new Vector3()))
      const dispatcher = new CollisionDispatcher()

      expect(collideCylinderWithCuboid(cylinder, cuboid)).to.not.equal(null)
      expect(dispatcher.dispatch(cylinder, cuboid)).to.not.equal(null)
      expect(dispatcher.dispatch(cuboid, cylinder)).to.not.equal(null)
    })
  })
  describe('collideCuboidWithCuboid', () => {
    it('should generate a bounded face manifold for stacked cuboids', () => {
      const lowerCuboid = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })

      const upperCuboid = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })

      lowerCuboid.center.set([0, 0.5, 0])
      upperCuboid.center.set([0, 1.45, 0])

      const collisions = collideCuboidWithCuboid(lowerCuboid, upperCuboid)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(4)
      collisions!.forEach((collision) => {
        expect(collision.normal.xyz).to.deep.equal(Vector3.createUp().xyz)
        expect(collision.penetrationDepth).to.be.closeTo(0.05, 1e-6)
        expect(collision.point.y).to.be.closeTo(0.975, 1e-6)
        expect(collision.isRestingContact).to.equal(true)
        expect(collision.contactType).to.equal('patch')
        expect(collision.featureId).to.match(/^cuboid:a:face:\+y:patch:[+-]x:[+-]z$/)
      })
      expect(collisions!.map(({ point: contact }) => contact.xyz)).to.deep.include.members([
        new Vector3([-0.5, 0.975, -0.5]).xyz,
        new Vector3([0.5, 0.975, -0.5]).xyz,
        new Vector3([0.5, 0.975, 0.5]).xyz,
        new Vector3([-0.5, 0.975, 0.5]).xyz
      ])
    })
    it('should keep cuboid face feature ids stable across repeated contact generation', () => {
      const lowerCuboid = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })

      const upperCuboid = new Cuboid({
        origin: Vector3.createZero(),
        extents: new Vector3([0.5, 0.5, 0.5])
      })

      lowerCuboid.center.set([0, 0.5, 0])
      upperCuboid.center.set([0, 1.45, 0])

      const firstCollisions = collideCuboidWithCuboid(lowerCuboid, upperCuboid)
      const secondCollisions = collideCuboidWithCuboid(lowerCuboid, upperCuboid)

      expect(firstCollisions).to.not.equal(null)
      expect(secondCollisions).to.not.equal(null)
      expect(firstCollisions!.map(({ featureId }) => featureId).sort()).to.deep.equal(
        secondCollisions!.map(({ featureId }) => featureId).sort()
      )
    })
  })
  describe('collidePolygonWithSphere', () => {
    it('should detect collision when sphere is on polygon', () => {
      const polygon = new Polygon({
        vertices: [new Vector3([-1, 0, -1]), new Vector3([0, 0, 1]), new Vector3([1, 0, -1])]
      })

      const sphere = new Sphere({
        origin: new Vector3([0, 1, 0]),
        radius: 1
      })

      const collisions = collidePolygonWithSphere(polygon, sphere)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(1)
      expect(collisions[0].point.xyz).to.deep.equal(Vector3.createZero().xyz)
      expect(collisions[0].normal.xyz).to.deep.equal(Vector3.createUp().xyz)
      expect(collisions[0].penetrationDepth).to.equal(0)
    })
    it('should detect collision when spheres are centered around polygon vertices', () => {
      const polygon = new Polygon({
        vertices: [new Vector3([-1, 0, -1]), new Vector3([0, 0, 1]), new Vector3([1, 0, -1])]
      })

      polygon.vertices.forEach((vertex) => {
        const sphere = new Sphere({
          origin: vertex,
          radius: 1
        })

        const collisions = collidePolygonWithSphere(polygon, sphere)

        assert.ok(collisions)
        expect(collisions).to.have.lengthOf(1)
        expect(collisions[0].point.xyz).to.deep.equal(vertex.xyz)
        expect(collisions[0].normal.xyz).to.deep.equal(Vector3.createUp().xyz)
        expect(collisions[0].penetrationDepth).to.equal(1)
      })
    })
    it('should not detect collision when sphere is above polygon', () => {
      const polygon = new Polygon({
        vertices: [new Vector3([-1, 0, -1]), new Vector3([0, 0, 1]), new Vector3([1, 0, -1])]
      })

      const sphere = new Sphere({
        origin: new Vector3([0, 3, 0]),
        radius: 1
      })

      const collisions = collidePolygonWithSphere(polygon, sphere)

      expect(collisions).to.equal(null)
    })
    it('should detect collision when sphere is below polygon', () => {
      const polygon = new Polygon({
        vertices: [new Vector3([-1, 0, -1]), new Vector3([0, 0, 1]), new Vector3([1, 0, -1])]
      })

      const sphere = new Sphere({
        origin: new Vector3([0, -1, 0]),
        radius: 1
      })

      const collisions = collidePolygonWithSphere(polygon, sphere)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(1)
      expect(collisions[0].point.xyz).to.deep.equal(new Vector3([0, 0, 0]).xyz)
      expect(collisions[0].normal.xyz).to.deep.equal(Vector3.createDown().xyz)
      expect(collisions[0].penetrationDepth).to.equal(0)
    })
    it('should keep a near-resting sphere in contact with polygon within slop', () => {
      const polygon = new Polygon({
        vertices: [new Vector3([-1, 0, -1]), new Vector3([0, 0, 1]), new Vector3([1, 0, -1])]
      })

      const sphere = new Sphere({
        origin: new Vector3([0, 1.004, 0]),
        radius: 1
      })

      const collisions = collidePolygonWithSphere(polygon, sphere)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(1)
      expect(collisions[0].penetrationDepth).to.equal(0)
      expect(collisions[0].point.xyz).to.deep.equal(Vector3.createZero().xyz)
    })
  })
  describe('collidePolygonWithCuboid', () => {
    it('should detect collision when cuboid is on polygon', () => {
      const polygon = new Polygon({
        vertices: [new Vector3([-1, 0, -1]), new Vector3([0, 0, 1]), new Vector3([1, 0, -1])]
      })

      const cuboid = new Cuboid({
        origin: new Vector3([0, 1, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const collisions = collidePolygonWithCuboid(polygon, cuboid)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(3)
      collisions.forEach((collision) => {
        expect(collision.penetrationDepth).to.equal(0)
        expect(collision.normal.xyz).to.deep.equal(Vector3.createUp().xyz)
      })

      const contacts = collisions.map(({ point: contact }) => contact)

      expect(contacts[0].xyz).to.deep.equal(new Vector3([-1, 0, -1]).xyz)
      expect(contacts[1].xyz).to.deep.equal(new Vector3([0, 0, 1]).xyz)
      expect(contacts[2].xyz).to.deep.equal(new Vector3([1, 0, -1]).xyz)
    })
    it('should not detect collision when cuboid is above polygon', () => {
      const polygon = new Polygon({
        vertices: [new Vector3([-1, 0, -1]), new Vector3([0, 0, 1]), new Vector3([1, 0, -1])]
      })

      const cuboid = new Cuboid({
        origin: new Vector3([0, 3, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const collisions = collidePolygonWithCuboid(polygon, cuboid)

      expect(collisions).to.equal(null)
    })
    it('should detect collision when cuboid is below polygon', () => {
      const polygon = new Polygon({
        vertices: [new Vector3([-1, 0, -1]), new Vector3([0, 0, 1]), new Vector3([1, 0, -1])]
      })

      const cuboid = new Cuboid({
        origin: new Vector3([0, -1, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const collisions = collidePolygonWithCuboid(polygon, cuboid)

      assert.ok(collisions)
      expect(collisions!.length).to.be.greaterThanOrEqual(3)
      collisions!.forEach((collision) => {
        expect(collision.penetrationDepth).to.be.greaterThanOrEqual(0)
        expect(collision.normal.xyz).to.deep.equal(Vector3.createDown().xyz)
      })

      const contacts = collisions!.map(({ point: contact }) => contact)

      expect(
        contacts.some((contact) => contact.xyz.every((value, index) => value === new Vector3([-1, 0, -1]).xyz[index]))
      ).to.equal(true)
      expect(
        contacts.some((contact) => contact.xyz.every((value, index) => value === new Vector3([0, 0, 1]).xyz[index]))
      ).to.equal(true)
      expect(
        contacts.some((contact) => contact.xyz.every((value, index) => value === new Vector3([1, 0, -1]).xyz[index]))
      ).to.equal(true)
    })
    it('should keep rotated cuboid support contacts bounded on a floor triangle', () => {
      const scene = new Scene()
      const entity = new Entity()
      const body = new Body({ mass: 100 })

      body.volume = new Cuboid({
        origin: new Vector3([0.1299, 0.00887, 0.00031]),
        extents: new Vector3([1.14198, 1.28806, 1.07139])
      })

      entity.translation.set([-1.7756927013397217, 1.7921515703201294, -0.1794224977493286])
      entity.rotation.set([0.0, -0.1736481636762619, 0.0, 0.9848077297210693])

      entity.components['body'] = body
      scene.entities['chair'] = entity
      scene.colliders['floor0'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, 10]), new Vector3([10, 0, -10])]
      })
      scene.colliders['floor1'] = new Polygon({
        vertices: [new Vector3([-10, 0, 10]), new Vector3([10, 0, -10]), new Vector3([-10, 0, -10])]
      })

      for (let index = 0; index < 2400; index++) {
        scene.update(1 / 60)
      }

      const collisions =
        collidePolygonWithCuboid(scene.colliders['floor0'] as Polygon, body.volume as Cuboid) ??
        collidePolygonWithCuboid(scene.colliders['floor1'] as Polygon, body.volume as Cuboid)

      assert.ok(collisions)
      expect(collisions!.length).to.be.within(1, 4)
      collisions!.forEach((collision) => {
        expect(collision.normal.y).to.equal(1)
        expect(Math.abs(collision.point.y)).to.be.lessThan(1e-3)
      })
    })
  })
  describe('collideSphereWithCuboid', () => {
    it('should detect collision when sphere is on cuboid', () => {
      const cuboid = new Cuboid({
        origin: new Vector3([0, 0, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const sphere = new Sphere({
        origin: new Vector3([0, 2, 0]),
        radius: 1
      })

      const collisions = collideSphereWithCuboid(sphere, cuboid)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(1)
      expect(collisions[0].point.xyz).to.deep.equal(new Vector3([0, 1, 0]).xyz)
      expect(Vector3.add(collisions[0].normal, Vector3.createUp()).magnitude).to.be.lessThan(1e-6)
      expect(collisions[0].penetrationDepth).to.equal(0)
    })
    it('should not detect collision when sphere is above cuboid', () => {
      const cuboid = new Cuboid({
        origin: new Vector3([0, 0, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const sphere = new Sphere({
        origin: new Vector3([0, 3, 0]),
        radius: 1
      })

      const collisions = collideSphereWithCuboid(sphere, cuboid)

      expect(collisions).to.equal(null)
    })
    it('should detect collision when sphere is below cuboid', () => {
      const cuboid = new Cuboid({
        origin: new Vector3([0, 0, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const sphere = new Sphere({
        origin: new Vector3([0, -2, 0]),
        radius: 1
      })

      const collisions = collideSphereWithCuboid(sphere, cuboid)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(1)
      expect(collisions[0].point.xyz).to.deep.equal(new Vector3([0, -1, 0]).xyz)
      expect(Vector3.add(collisions[0].normal, Vector3.createDown()).magnitude).to.be.lessThan(1e-6)
      expect(collisions[0].penetrationDepth).to.equal(0)
    })
    it('should detect collision when sphere is beside cuboid along x axis', () => {
      const cuboid = new Cuboid({
        origin: new Vector3([0, 0, 0]),
        extents: new Vector3([1, 2, 3])
      })

      const sphere = new Sphere({
        origin: new Vector3([2, 0.5, -0.75]),
        radius: 1
      })

      const collisions = collideSphereWithCuboid(sphere, cuboid)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(1)
      expect(collisions[0].point.xyz).to.deep.equal(new Vector3([1, 0.5, -0.75]).xyz)
      expect(Vector3.add(collisions[0].normal, Vector3.createRight()).magnitude).to.be.lessThan(1e-6)
      expect(collisions[0].penetrationDepth).to.equal(0)
    })
    it('should detect collision when sphere grazes a cuboid corner', () => {
      const cuboid = new Cuboid({
        origin: new Vector3([0, 0, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const radius = Math.sqrt(0.5)

      const sphere = new Sphere({
        origin: new Vector3([1.5, 1.5, 0]),
        radius
      })

      const collisions = collideSphereWithCuboid(sphere, cuboid)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(1)
      expect(collisions[0].point.xyz).to.deep.equal(new Vector3([1, 1, 0]).xyz)

      const expectedNormal = Vector3.normalize(new Vector3([1, 1, 0]))

      expect(Vector3.add(collisions[0].normal, expectedNormal).magnitude).to.be.lessThan(1e-6)
      expect(collisions[0].penetrationDepth).to.be.closeTo(0, 1e-6)
    })
    it('should resolve a falling sphere against a stationary cuboid without sinking', () => {
      const cuboid = new Cuboid({
        origin: new Vector3([0, 0, 0]),
        extents: new Vector3([10, 1, 10])
      })

      const sphere = new Sphere({
        origin: new Vector3([0, 10, 0]),
        radius: 1
      })

      const velocity = Vector3.createZero()
      const gravity = new Vector3([0, -9.81, 0])
      const delta = 1 / 60

      for (let index = 0; index < 240; index++) {
        Vector3.add(velocity, Vector3.scale(gravity, delta, new Vector3()), velocity)
        Vector3.add(sphere.center, Vector3.scale(velocity, delta, new Vector3()), sphere.center)

        const collisions = collideSphereWithCuboid(sphere, cuboid)

        if (collisions && collisions.length > 0) {
          const { normal, penetrationDepth } = collisions[0]

          Vector3.add(sphere.center, Vector3.scale(normal, -penetrationDepth, new Vector3()), sphere.center)

          const normalVelocity = Vector3.calculateDotProduct(velocity, normal)

          if (normalVelocity > 0) {
            Vector3.add(velocity, Vector3.scale(normal, -normalVelocity, new Vector3()), velocity)
          }
        }
      }

      expect(sphere.center.y).to.be.greaterThanOrEqual(cuboid.extents.y + sphere.radius - 1e-4)
    })
    it('should detect collision when sphere center is inside cuboid', () => {
      const cuboid = new Cuboid({
        origin: new Vector3([0, 0, 0]),
        extents: new Vector3([1, 1, 1])
      })

      const sphere = new Sphere({
        origin: new Vector3([0.2, -0.3, 0.4]),
        radius: 0.6
      })

      const collisions = collideSphereWithCuboid(sphere, cuboid)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(1)
      expect(collisions[0].point.xyz).to.deep.equal(new Vector3([0.2, -0.3, 1]).xyz)
      expect(Vector3.add(collisions[0].normal, Vector3.createForward()).magnitude).to.be.lessThan(1e-6)

      const clearance = cuboid.extents.z - Math.abs(sphere.center.z - cuboid.center.z)
      const expectedPenetration = sphere.radius + clearance

      expect(collisions[0].penetrationDepth).to.be.closeTo(expectedPenetration, 1e-6)
    })
  })
  describe('Scene simulation state', () => {
    it('can update a scene without advancing fixed-step physics', () => {
      const scene = new Scene()
      const entity = new Entity({ translation: new Vector3([0, 4, 0]) })
      const body = new Body({ mass: 1 })

      body.volume = new Cuboid({ origin: Vector3.createZero(), extents: Vector3.createOne() })
      entity.components['Body'] = body
      scene.entities['box'] = entity

      scene.update(1, false)
      expect(entity.translation.y).to.equal(4)
      expect(body.linearVelocity.xyz).to.deep.equal(Vector3.createZero().xyz)
    })
    it('restores captured body transforms and clears transient motion', () => {
      const scene = new Scene()
      const entity = new Entity({
        translation: new Vector3([1, 4, 2]),
        rotation: Quaternion.setFromEulerAngles(0.1, 0.2, 0.3)
      })
      const body = new Body({ mass: 2 })

      body.volume = new Cuboid({ origin: Vector3.createZero(), extents: Vector3.createOne() })
      entity.components['Body'] = body
      scene.entities['box'] = entity

      scene.captureSimulationState()
      scene.update(1 / 30)
      entity.translation.set(new Vector3([9, 8, 7]))
      entity.rotation.set(Quaternion.createIdentity())
      body.force.set(new Vector3([1, 2, 3]))
      body.torque.set(new Vector3([3, 2, 1]))
      body.linearVelocity.set(new Vector3([4, 5, 6]))
      body.angularVelocity.set(new Vector3([6, 5, 4]))
      body.angularCorrection.set(new Vector3([0.1, 0.2, 0.3]))
      body.sleep()
      scene.resetSimulation()
      expect(entity.translation.xyz).to.deep.equal(new Vector3([1, 4, 2]).xyz)
      expect(Array.from(entity.rotation)).to.deep.equal(Array.from(Quaternion.setFromEulerAngles(0.1, 0.2, 0.3)))
      expect(body.force.xyz).to.deep.equal(Vector3.createZero().xyz)
      expect(body.torque.xyz).to.deep.equal(Vector3.createZero().xyz)
      expect(body.linearVelocity.xyz).to.deep.equal(Vector3.createZero().xyz)
      expect(body.angularVelocity.xyz).to.deep.equal(Vector3.createZero().xyz)
      expect(body.angularCorrection.xyz).to.deep.equal(Vector3.createZero().xyz)
      expect(body.isSleeping).to.equal(false)
      expect(body.sleepFrames).to.equal(0)
      expect(scene.collisionManifolds).to.have.lengthOf(0)
      expect(scene.collisionStatistics).to.equal(null)
      expect(body.volume.center.xyz).to.deep.equal(entity.translation.xyz)
    })
  })
  describe('collideSphereWithSphere', () => {
    it('should detect collision when spheres are touching', () => {
      const s1 = new Sphere({
        origin: new Vector3([0, 0, 0]),
        radius: 1
      })

      const s2 = new Sphere({
        origin: new Vector3([2, 0, 0]),
        radius: 1
      })

      const collisions = collideSphereWithSphere(s1, s2)

      assert.ok(collisions)
      expect(collisions).to.have.lengthOf(1)
      expect(collisions[0].point.xyz).to.deep.equal(new Vector3([1, 0, 0]).xyz)
      expect(collisions[0].normal.xyz).to.deep.equal(Vector3.createRight().xyz)
      expect(collisions[0].penetrationDepth).to.equal(0)
    })
    it('should not detect collision when spheres are not touching', () => {
      const s1 = new Sphere({
        origin: new Vector3([0, 0, 0]),
        radius: 1
      })

      const s2 = new Sphere({
        origin: new Vector3([3, 0, 0]),
        radius: 1
      })

      const collisions = collideSphereWithSphere(s1, s2)

      expect(collisions).to.equal(null)
    })
  })
})
