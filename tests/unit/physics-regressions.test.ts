import { expect } from 'chai'
import { Entity } from '@luz/core'
import { Biped, Body } from '@luz/physics'
import { Scene } from '@luz/scene'
import { Vector3, Quaternion } from '@luz/math'
import type { Volume, CollisionManifold } from '@luz/physics'
import {
  Sphere,
  Cuboid,
  Cylinder,
  Ellipsoid,
  Plane,
  Polygon,
  Ray,
  PhysicsWorld,
  CollisionDispatcher,
  CollisionSolver,
  calculateColliderBoundingBox,
  Narrowphase,
  collidePlaneWithEllipsoid,
  collideSphereWithCylinder,
  collideCylinderWithCylinder,
  collideSphereWithCuboid,
  collideEllipsoidWithCuboid,
  collideSphereWithEllipsoid,
  collidePolygonWithCylinder,
  collidePlaneWithCylinder,
  collidePolygonWithSphere,
  intersectRayWithRay,
  normalizeCollisions,
  raycastCollider,
  sweepVolume
} from '@luz/physics'
import { findClosestSegmentPoints } from '@luz/physics/collisions/algorithms/closest-segment-points'

const createVector = (values: number[]) => new Vector3(values)

const assertNear = (actual: Vector3, expected: Vector3, tolerance = 1e-5) =>
  expect(Vector3.subtract(actual, expected).magnitude).to.be.lessThan(tolerance)

const createBodyAt = (volume: Volume, position = [0, 0, 0], mass = 1, body = new Body({ mass })) => {
  const entity = new Entity()

  entity.translation.set(position)

  entity.components.body = body
  body.volume = volume

  body.applyTransform(entity)
  volume.calculateInverseInertia(mass, entity)

  body.restitution = 0
  body.friction = 0

  return { body, entity }
}

const createFloorContact = (body: Body): CollisionManifold => ({
  id: 'floor',

  bodies: [body, null],
  collisions: [{ normal: Vector3.createDown(), point: Vector3.createZero(), penetrationDepth: 0 }]
})

const createSquare = () =>
  new Polygon({
    vertices: [
      [-1, 0, -1],
      [-1, 0, 1],
      [1, 0, 1],
      [1, 0, -1]
    ].map(createVector)
  })

describe('Physics: mathematical regressions', () => {
  it('retracts an excessive cached normal impulse without adding energy', () => {
    const { body } = createBodyAt(new Sphere(), [0, 1, 0])
    const solver = new CollisionSolver(),
      contact = createFloorContact(body)

    for (const speed of [-10, -0.1, 0]) {
      body.linearVelocity.y = speed

      solver.beginVelocityFrame()
      solver.solveVelocities([contact], 1 / 60, true)
      solver.endVelocityFrame()
      expect(Math.abs(body.linearVelocity.y)).to.be.lessThan(1e-5)
    }
  })

  for (const volume of [
    new Cuboid({ extents: createVector([1, 2, 3]) }),
    new Ellipsoid({ radius: createVector([1, 2, 3]) }),
    new Cylinder({ radius: 1, height: 4 })
  ]) {
    it('rotates the ' + volume.type + ' inertia tensor using independent principal axes', () => {
      const entity = new Entity()

      volume.calculateInverseInertia(2, entity)

      const diagonal = [volume.inverseInertia[0], volume.inverseInertia[4], volume.inverseInertia[8]]

      entity.rotation.set(Quaternion.setFromEulerAngles(0.4, 0.7, 0.3))
      entity.scale.set([2, 3, 4])
      volume.calculateInverseInertia(2, entity)

      const axes = Vector3.createAxes().map((axis) => entity.rotation.transformVector3(axis))

      for (const direction of Vector3.createAxes()) {
        const expected = axes.reduce(
          (sum, axis, index) =>
            sum.add(Vector3.scale(axis, Vector3.calculateDotProduct(axis, direction) * diagonal[index])),
          new Vector3()
        )

        assertNear(volume.inverseInertia.transform(direction), expected)
        expect(Vector3.calculateDotProduct(direction, expected)).to.be.greaterThan(0)
      }
    })
  }

  it('integrates world angular velocity around the center of mass', () => {
    const { body, entity } = createBodyAt(new Sphere({ origin: createVector([1, 0, 0]) }))

    entity.rotation.set(Quaternion.setFromAxisAngle(Vector3.createForward(), Math.PI / 2))
    body.applyTransform(entity)
    assertNear(body.volume.center, Vector3.createUp())

    const center = body.volume.center.clone()

    body.angularVelocity.set(Vector3.createRight())

    const expected = Quaternion.setFromAxisAngle(Vector3.createRight(), 0.1).multiply(entity.rotation, new Quaternion())

    body.update(entity, 0.1)

    for (let index = 0; index < 4; index++) {
      expect(entity.rotation[index]).to.be.closeTo(expected[index], 1e-6)
    }

    assertNear(body.volume.center, center)
    body.applyRotationCorrection(Quaternion.setFromAxisAngle(Vector3.createUp(), 0.1))
    assertNear(body.volume.center, center)
  })
  it('keeps rotated ellipsoid support points inside its AABB', () => {
    const volume = new Ellipsoid({ radius: createVector([3, 1, 1]) })
    const { entity } = createBodyAt(volume, [0, 1.8, 0])

    entity.rotation.set(Quaternion.setFromAxisAngle(Vector3.createForward(), Math.PI / 4))
    volume.applyTransform(entity)

    const boundingBox = calculateColliderBoundingBox(volume)

    expect(boundingBox.maximum.x).to.be.closeTo(Math.sqrt(5), 1e-5)
    expect(collidePlaneWithEllipsoid(new Plane(), volume)).not.to.equal(null)

    for (let index = 0; index < 32; index++) {
      const point = volume.calculateSupportPoint(
        createVector([Math.cos(index), Math.sin(index * 1.7), Math.sin(index)])
      )

      for (let axis = 0; axis < 3; axis++) {
        expect(point[axis]).to.be.within(boundingBox.minimum[axis] - 1e-5, boundingBox.maximum[axis] + 1e-5)
      }
    }
  })
  it('recomputes the constrained closest points when a segment endpoint clamps', () => {
    const [firstPoint, secondPoint] = findClosestSegmentPoints(
      createVector([0, 0, 0]),
      createVector([1, 0, 0]),
      createVector([2, 1, 0]),
      createVector([3, -1, 0])
    )

    assertNear(firstPoint, Vector3.createRight())
    assertNear(secondPoint, createVector([2.2, 0.6, 0]))

    const [thirdPoint, fourthPoint] = findClosestSegmentPoints(
      Vector3.createZero(),
      Vector3.createZero(),
      Vector3.createRight(),
      createVector([2, 0, 0])
    )

    assertNear(thirdPoint, Vector3.createZero())
    assertNear(fourthPoint, Vector3.createRight())
  })
  it('does not add kinetic energy when cached friction reverses direction', () => {
    const { body } = createBodyAt(new Sphere(), [0, 1, 0])

    body.friction = 0.8

    const solver = new CollisionSolver(),
      contact = createFloorContact(body)

    for (const direction of [1, -1, 0.1, -0.1]) {
      body.linearVelocity.set([direction, -1, 0.3])
      body.angularVelocity.reset()

      const initialEnergy = 0.5 * body.linearVelocity.squaredMagnitude

      solver.beginVelocityFrame()

      for (let iteration = 0; iteration < 12; iteration++) {
        solver.solveVelocities([contact], 1 / 60, iteration === 0)
      }

      solver.endVelocityFrame()

      const finalEnergy = 0.5 * body.linearVelocity.squaredMagnitude + 0.2 * body.angularVelocity.squaredMagnitude

      expect(finalEnergy).to.be.at.most(initialEnergy + 1e-5)
    }
  })
  it('uses static friction before falling back to dynamic friction', () => {
    const { body } = createBodyAt(new Sphere(), [0, 1, 0])

    body.friction = 0.5

    body.linearVelocity.set([2, -1, 0])

    const solver = new CollisionSolver(),
      contact = createFloorContact(body)

    solver.beginVelocityFrame()
    solver.solveVelocities([contact], 1 / 60)
    solver.endVelocityFrame()

    const contactOffset = Vector3.subtract(contact.collisions[0].point, body.volume.center)
    const contactVelocity = Vector3.add(
      body.linearVelocity,
      Vector3.calculateCrossProduct(body.angularVelocity, contactOffset)
    )

    expect(Math.abs(contactVelocity.x)).to.be.lessThan(1e-5)
    body.linearVelocity.set([4, -1, 0])
    body.angularVelocity.reset()
    solver.resetCachedContacts()
    solver.beginVelocityFrame()
    solver.solveVelocities([contact], 1 / 60)
    solver.endVelocityFrame()

    const slidingVelocity = Vector3.add(
      body.linearVelocity,
      Vector3.calculateCrossProduct(body.angularVelocity, contactOffset)
    )

    expect(Math.abs(slidingVelocity.x)).to.be.greaterThan(1)
  })
  it('keeps positional correction out of velocities and conserves collision momentum', () => {
    const firstActor = createBodyAt(new Sphere(), [-0.9, 0, 0]),
      secondActor = createBodyAt(new Sphere(), [0.9, 0, 0])

    firstActor.body.linearVelocity.x = 1
    secondActor.body.linearVelocity.x = -1
    firstActor.body.restitution = secondActor.body.restitution = 1

    const manifolds = Narrowphase.calculateCollisionManifolds({
      bodyPairs: [[firstActor.body, secondActor.body]],
      finiteBodyColliderPairs: [],
      infiniteBodyColliderPairs: []
    })
    const solver = new CollisionSolver()

    solver.beginVelocityFrame()
    solver.solveVelocities(manifolds, 1 / 60)
    assertNear(Vector3.add(firstActor.body.linearVelocity, secondActor.body.linearVelocity), Vector3.createZero())
    expect(firstActor.body.linearVelocity.x).to.be.closeTo(-1, 1e-5)

    const velocity = firstActor.body.linearVelocity.clone()

    solver.solvePositions(manifolds)
    assertNear(firstActor.body.linearVelocity, velocity)
  })
})
describe('Physics: geometry regressions', () => {
  it('handles cap separation, coaxial overlap, containment and world-space depth', () => {
    const cylinder = new Cylinder({ radius: 1, height: 2 })

    assertNear(cylinder.axes[2], Vector3.createUp())
    expect(
      collideSphereWithCylinder(new Sphere({ origin: createVector([0, 1.75, 0]), radius: 0.25 }), cylinder)
    ).to.equal(null)
    expect(
      collideCylinderWithCylinder(
        new Cylinder({ radius: 0.25, height: 4 }),
        new Cylinder({ radius: 0.25, height: 4, origin: createVector([0, 3, 0]) })
      )
    ).not.to.equal(null)

    const box = new Cuboid({ extents: createVector([3, 3, 3]) })

    expect(collideSphereWithCuboid(new Sphere({ radius: 0.25 }), box)![0].penetrationDepth).to.be.closeTo(3.25, 1e-5)
    expect(
      collideEllipsoidWithCuboid(new Ellipsoid({ radius: createVector([0.5, 0.5, 0.5]) }), box)![0].penetrationDepth
    ).to.be.greaterThan(3.49)
    expect(
      collideSphereWithEllipsoid(new Sphere({ radius: 0.25 }), new Ellipsoid({ radius: createVector([3, 3, 3]) }))
    ).not.to.equal(null)
    expect(
      collideEllipsoidWithCuboid(
        new Ellipsoid({ radius: createVector([2, 2, 2]) }),
        new Cuboid({ origin: createVector([2.5, 0, 0]) })
      )![0].penetrationDepth
    ).to.be.closeTo(0.5, 1e-4)
  })
  it('detects exact tilted rim support and triangles entirely within a cap', () => {
    const volume = new Cylinder({ radius: 1, height: 2 })
    const { entity } = createBodyAt(volume, [0, 1.25, 0])

    entity.rotation.set(Quaternion.setFromAxisAngle(createVector([1, 0, 1]).normalize(), 0.4))
    volume.applyTransform(entity)

    const depth = -volume.calculateSupportPoint(Vector3.createDown()).y

    expect(depth).to.be.greaterThan(0.06)
    expect(
      Math.max(...collidePlaneWithCylinder(new Plane(), volume)!.map((contact) => contact.penetrationDepth))
    ).to.be.closeTo(depth, 1e-5)

    const triangle = new Polygon({
      vertices: [
        [-0.1, 0, -0.1],
        [0, 0, 0.1],
        [0.1, 0, -0.1]
      ].map(createVector)
    })

    expect(collidePolygonWithCylinder(triangle, new Cylinder({ origin: createVector([0, 0.9, 0]) }))).not.to.equal(null)
  })
  it('covers polygon interiors beyond the first triangle and gives edge normals', () => {
    expect(
      collidePolygonWithSphere(createSquare(), new Sphere({ radius: 0.2, origin: createVector([0.7, 0.1, -0.7]) }))
    ).not.to.equal(null)

    const contact = collidePolygonWithSphere(
      createSquare(),
      new Sphere({ radius: 0.3, origin: createVector([1.2, 0.1, 0]) })
    )![0]

    expect(contact.normal.x).to.be.greaterThan(0.8)
  })

  const factories = [() => new Sphere(), () => new Cuboid(), () => new Ellipsoid(), () => new Cylinder()]
  const dispatcher = new CollisionDispatcher()

  for (let firstIndex = 0; firstIndex < factories.length; firstIndex++) {
    for (let secondIndex = firstIndex; secondIndex < factories.length; secondIndex++) {
      it('supports both orders and translation invariance for pair ' + firstIndex + '/' + secondIndex, () => {
        const firstVolume = factories[firstIndex](),
          secondVolume = factories[secondIndex]()
        const firstPose = createBodyAt(firstVolume),
          secondPose = createBodyAt(secondVolume, [1.5, 0.1, 0.1])

        expect(dispatcher.isPairSupported(firstVolume.type, secondVolume.type)).to.equal(true)

        const forwardContacts = dispatcher.detectCollisions(firstVolume, secondVolume)!
        const reverseContacts = dispatcher.detectCollisions(secondVolume, firstVolume)!

        expect(forwardContacts?.length).to.be.greaterThan(0)
        expect(reverseContacts?.length).to.be.greaterThan(0)
        expect(Vector3.calculateDotProduct(forwardContacts[0].normal, reverseContacts[0].normal)).to.be.lessThan(-0.97)

        const before = Math.max(...forwardContacts.map((contact) => contact.penetrationDepth))

        firstPose.entity.translation.add(createVector([2, 3, -1]))
        secondPose.entity.translation.add(createVector([2, 3, -1]))
        firstVolume.applyTransform(firstPose.entity)
        secondVolume.applyTransform(secondPose.entity)
        expect(
          Math.max(
            ...dispatcher.detectCollisions(firstVolume, secondVolume)!.map((contact) => contact.penetrationDepth)
          )
        ).to.be.closeTo(before, 0.002)
      })
    }
  }

  it('does not alias nearby distinct contacts', () => {
    const contacts = normalizeCollisions(
      [0, 0.002].map((x) => ({ point: createVector([x, 0, 0]), normal: Vector3.createUp(), penetrationDepth: 0.01 }))
    )

    expect(contacts.length).to.equal(2)
    expect(new Set(contacts.map((contact) => contact.id)).size).to.equal(2)
  })
  it('reports seeded box edge penetration from an independent SAT oracle', () => {
    let seed = 12345,
      edgeCases = 0

    const generateRandom = () => (seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296

    for (let index = 0; index < 80; index++) {
      const firstVolume = new Cuboid({ extents: createVector([1, 0.3, 0.4]) }),
        secondVolume = new Cuboid({ extents: createVector([1, 0.3, 0.4]) })
      const firstBody = createBodyAt(firstVolume)
      const secondBody = createBodyAt(secondVolume)

      firstBody.entity.rotation.set(
        Quaternion.setFromEulerAngles(generateRandom() * 3, generateRandom() * 3, generateRandom() * 3)
      )
      secondBody.entity.rotation.set(
        Quaternion.setFromEulerAngles(generateRandom() * 3, generateRandom() * 3, generateRandom() * 3)
      )
      secondBody.entity.translation.set([generateRandom() - 0.5, generateRandom() - 0.5, generateRandom() - 0.5])
      firstVolume.applyTransform(firstBody.entity)
      secondVolume.applyTransform(secondBody.entity)

      const contact = dispatcher.detectCollisions(firstVolume, secondVolume)?.[0]

      if (!contact?.featureId?.includes(':edge:')) {
        continue
      }

      edgeCases++

      const axes = [
        ...firstVolume.axes,
        ...secondVolume.axes,
        ...firstVolume.axes.flatMap((x) => secondVolume.axes.map((y) => Vector3.calculateCrossProduct(x, y)))
      ]
      const overlaps = axes
        .filter((axis) => axis.magnitude > 1e-5)
        .map((axis) => {
          const normalizedAxis = axis.clone().normalize()
          const calculateExtent = (box: Cuboid) =>
            box.axes.reduce(
              (sum, direction, index) =>
                sum + Math.abs(Vector3.calculateDotProduct(normalizedAxis, direction)) * box.extents[index],
              0
            )

          return (
            calculateExtent(firstVolume) +
            calculateExtent(secondVolume) -
            Math.abs(
              Vector3.calculateDotProduct(normalizedAxis, Vector3.subtract(secondVolume.center, firstVolume.center))
            )
          )
        })

      expect(contact.penetrationDepth).to.be.closeTo(Math.min(...overlaps), 0.0002)
    }

    expect(edgeCases).to.be.greaterThan(5)
  })
  it('keeps convex contacts invariant under a common rotation and handles grazing', () => {
    const firstVolume = new Ellipsoid({ radius: createVector([2, 1, 0.5]) }),
      secondVolume = new Cylinder({ radius: 0.7, height: 2 })
    const firstBody = createBodyAt(firstVolume)
    const secondBody = createBodyAt(secondVolume, [2.2, 0.2, 0.1])
    const before = dispatcher.detectCollisions(firstVolume, secondVolume)![0]
    const rotation = Quaternion.setFromEulerAngles(0.3, 0.6, -0.8)

    firstBody.entity.rotation.set(rotation)
    secondBody.entity.rotation.set(rotation)
    rotation.transformVector3(secondBody.entity.translation, secondBody.entity.translation)
    firstVolume.applyTransform(firstBody.entity)
    secondVolume.applyTransform(secondBody.entity)

    const after = dispatcher.detectCollisions(firstVolume, secondVolume)![0]

    expect(after.penetrationDepth).to.be.closeTo(before.penetrationDepth, 0.002)
    assertNear(after.normal, rotation.transformVector3(before.normal), 0.02)
    expect(
      dispatcher.detectCollisions(new Ellipsoid(), new Ellipsoid({ origin: createVector([2, 0, 0]) }))
    ).not.to.equal(null)
    expect(
      dispatcher.detectCollisions(new Ellipsoid(), new Ellipsoid({ origin: createVector([2.001, 0, 0]) }))
    ).to.equal(null)
  })
  it('rejects invalid shapes and validates deserialized geometry', async () => {
    expect(() => new Cylinder({ axisIndex: 1.5 })).to.throw()
    expect(() => new Sphere({ radius: -1 })).to.throw()
    expect(() => new Cuboid({ extents: createVector([0, 1, 1]) })).to.throw()
    expect(() => new Ray({ direction: Vector3.createZero() })).to.throw()
    expect(
      () => new Polygon({ vertices: [Vector3.createZero(), Vector3.createRight(), createVector([2, 0, 0])] })
    ).to.throw()

    const plane = new Plane({ normal: createVector([0, 2, 0]), distance: 4 })

    expect(plane.calculateSignedDistance(createVector([0, 2, 0]))).to.equal(0)

    let hasRejected = false

    try {
      await Sphere.deserialize({ type: 'sphere', radius: -2 })
    } catch {
      hasRejected = true
    }

    expect(hasRejected).to.equal(true)

    const cylinder = (await Cylinder.deserialize({ type: 'cylinder', axisIndex: 2 })) as Cylinder

    assertNear(cylinder.axes[2], Vector3.createForward())
  })
})
describe('Physics: world lifecycle and queries', () => {
  it('counts persistence per step, keeps worlds independent and reuses prepared contacts', () => {
    const solver = new CollisionSolver(),
      otherSolver = new CollisionSolver()
    const { body } = createBodyAt(new Sphere(), [0, 1, 0]),
      contact = createFloorContact(body)

    solver.beginVelocityFrame()

    for (let iteration = 0; iteration < 8; iteration++) {
      solver.solveVelocities([contact], 1 / 60, iteration === 0)
    }

    solver.endVelocityFrame()
    otherSolver.beginVelocityFrame()
    otherSolver.endVelocityFrame()
    expect(solver.contactPersistence).to.deep.equal([1])
    solver.beginVelocityFrame()
    solver.solveVelocities([contact], 1 / 60, true)
    solver.endVelocityFrame()
    expect(solver.contactPersistence).to.deep.equal([2])
  })
  it('constrains a biped against a mass-zero body and orients static volume response', () => {
    const actor = createBodyAt(new Sphere(), [0, 1.5, 0], 1, new Biped())
    const platform = createBodyAt(new Cuboid(), [0, 0, 0], 0, new Body({ mass: 0, motionType: 'static' }))
    const manifolds = Narrowphase.calculateCollisionManifolds({
      bodyPairs: [[actor.body, platform.body]],
      finiteBodyColliderPairs: [],
      infiniteBodyColliderPairs: []
    })

    actor.body.linearVelocity.y = -1

    const solver = new CollisionSolver()

    solver.beginVelocityFrame()
    solver.solveVelocities(manifolds, 1 / 60)
    solver.updateBipedGroundState(manifolds)
    expect(actor.body.linearVelocity.y).to.be.closeTo(0, 1e-5)
    expect((actor.body as Biped).isGrounded).to.equal(true)
    expect(solver.solvePositions(manifolds)).to.equal(true)
    expect(actor.entity.translation.y).to.be.greaterThan(1.5)

    const mover = createBodyAt(new Sphere())
    const staticContacts = Narrowphase.calculateCollisionManifolds({
      bodyPairs: [],
      infiniteBodyColliderPairs: [],
      finiteBodyColliderPairs: [[mover.body, new Sphere({ origin: createVector([1.5, 0, 0]) })]]
    })

    solver.solvePositions(staticContacts)
    expect(mover.entity.translation.x).to.be.lessThan(0)
  })
  it('wakes sleepers on removed support and changed gravity', () => {
    const scene = new Scene(),
      { body, entity } = createBodyAt(new Sphere(), [0, 1, 0])

    scene.entities.body = entity
    scene.colliders.floor = new Plane()

    for (let frame = 0; frame < 120; frame++) {
      scene.update(1 / 60)
    }

    expect(body.isSleeping).to.equal(true)
    delete scene.colliders.floor
    scene.update(1 / 60)
    expect(body.isSleeping).to.equal(false)
    expect(body.linearVelocity.y).to.be.lessThan(0)
    body.sleep()
    scene.gravity.set([9.81, 0, 0])
    scene.update(1 / 60)
    expect(body.isSleeping).to.equal(false)
    expect(body.linearVelocity.x).to.be.greaterThan(0)
  })
  it('uses gravity direction for sleeping and grounding', () => {
    const solver = new CollisionSolver(),
      { body } = createBodyAt(new Sphere(), [1, 0, 0])

    solver.up.set(Vector3.createRight())

    const contact = createFloorContact(body)

    contact.collisions[0].normal.set([-1, 0, 0])

    for (let frame = 0; frame < 20; frame++) {
      solver.finishStep([contact], [body], 1 / 60)
    }

    expect(body.isSleeping).to.equal(true)
  })
  it('filters collision pairs, raycasts and overlaps', () => {
    const scene = new Scene(),
      { entity, body } = createBodyAt(new Sphere(), [0, 1, 0])

    scene.entities.body = entity
    scene.colliders.floor = new Plane()
    body.volume.collisionMask = 0

    scene.update(1 / 60)
    expect(scene.collisionManifolds.length).to.equal(0)

    const world = new PhysicsWorld(),
      sphere = new Sphere({ origin: createVector([0, 3, 0]) })

    sphere.collisionGroup = 2

    world.setObjects([], [sphere, new Plane()])

    const ray = new Ray({ origin: createVector([0, 6, 0]), direction: Vector3.createDown() })

    expect(world.raycastAll(ray).map((hit) => hit.distance)).to.deep.equal([2, 6])
    expect(world.raycast(ray, { collisionMask: 1 })!.distance).to.equal(6)
    expect(world.raycast(ray, { maximumDistance: 1 })).to.equal(null)
    expect(world.overlap(new Sphere({ origin: createVector([0, 3, 0]) }), { collisionMask: 2 })).to.deep.equal([sphere])
  })
  it('returns outward cylinder/cap, polygon and inside-ellipsoid ray hits', () => {
    const cylinder = new Cylinder()
    const cap = raycastCollider(
      new Ray({ origin: createVector([0, 3, 0]), direction: Vector3.createDown() }),
      cylinder
    )!

    assertNear(cap.normal, Vector3.createUp())
    expect(cap.distance).to.equal(2)

    const side = raycastCollider(
      new Ray({ origin: createVector([3, 0, 0]), direction: createVector([-1, 0, 0]) }),
      cylinder
    )!

    assertNear(side.normal, Vector3.createRight())
    expect(side.distance).to.equal(2)
    expect(
      raycastCollider(
        new Ray({ origin: createVector([0.7, 2, -0.7]), direction: Vector3.createDown() }),
        createSquare()
      )!.distance
    ).to.equal(2)

    const exit = raycastCollider(
      new Ray({ direction: Vector3.createRight() }),
      new Ellipsoid({ radius: createVector([2, 1, 1]) })
    )!

    assertNear(exit.normal, Vector3.createRight())
    expect(exit.distance).to.equal(2)
    expect(
      intersectRayWithRay(
        new Ray({ direction: Vector3.createRight() }),
        new Ray({ origin: createVector([0.5, -1, 1]), direction: Vector3.createUp() })
      )
    ).to.equal(null)
    expect(
      intersectRayWithRay(
        new Ray({ direction: Vector3.createRight() }),
        new Ray({ origin: createVector([2, -1, 0]), direction: Vector3.createUp() })
      )
    ).not.to.equal(null)
  })
  it('moves kinematic bodies without gravity or collision inverse mass', () => {
    const scene = new Scene(),
      { body, entity } = createBodyAt(new Cuboid())

    body.motionType = 'kinematic'
    body.linearVelocity.x = 3
    scene.entities.platform = entity

    scene.update(1 / 60)
    expect(entity.translation.x).to.be.closeTo(0.05, 1e-6)
    expect(entity.translation.y).to.equal(0)
    expect(body.inverseMass).to.equal(0)
    expect(body.linearVelocity.x).to.equal(3)
  })
  it('wakes a sleeping passenger when its kinematic support starts moving', () => {
    const scene = new Scene()
    const passenger = createBodyAt(new Sphere({ radius: 0.5 }), [0, 0.75, 0])
    const platform = createBodyAt(new Cuboid({ extents: createVector([2, 0.25, 2]) }))

    passenger.body.friction = 0.8
    platform.body.friction = 0.8
    platform.body.motionType = 'kinematic'
    scene.entities.passenger = passenger.entity
    scene.entities.platform = platform.entity

    for (let frame = 0; frame < 120; frame++) {
      scene.update(1 / 60)
    }

    expect(passenger.body.isSleeping).to.equal(true)

    platform.body.linearVelocity.x = 1

    scene.update(1 / 60)
    expect(passenger.body.isSleeping).to.equal(false)
    expect(passenger.body.linearVelocity.x).to.be.greaterThan(0)
  })
  it('keeps passengers active on steadily moving kinematic supports', () => {
    const scene = new Scene()
    const passenger = createBodyAt(new Cuboid({ extents: createVector([0.5, 0.5, 0.5]) }), [0, 0.75, 0])
    const platform = createBodyAt(new Cuboid({ extents: createVector([2, 0.25, 2]) }))

    passenger.body.friction = 1
    platform.body.friction = 1
    platform.body.motionType = 'kinematic'
    platform.body.linearVelocity.x = 0.1
    scene.entities.passenger = passenger.entity
    scene.entities.platform = platform.entity

    for (let frame = 0; frame < 120; frame++) {
      scene.update(1 / 60)
    }

    expect(passenger.body.isSleeping).to.equal(false)
    expect(passenger.entity.translation.x).to.be.greaterThan(0.1)
  })
  it('does not invalidate unrelated sleepers while a kinematic body moves', () => {
    const scene = new Scene()
    const sleeper = createBodyAt(new Cuboid({ extents: createVector([0.5, 0.5, 0.5]) }), [10, 0.5, 0])
    const platform = createBodyAt(new Cuboid({ extents: createVector([2, 0.25, 2]) }), [0, 0.25, 0])

    sleeper.body.friction = 0.8
    platform.body.motionType = 'kinematic'
    platform.body.linearVelocity.x = 0.5
    scene.entities.sleeper = sleeper.entity
    scene.entities.platform = platform.entity
    scene.colliders.floor = new Plane()

    for (let frame = 0; frame < 120; frame++) {
      scene.update(1 / 60)
    }

    expect(sleeper.body.isSleeping).to.equal(true)
  })
  it('does not reset contact caches when a kinematic pose is clamped externally', () => {
    const scene = new Scene()
    const passenger = createBodyAt(new Cuboid({ extents: createVector([0.5, 0.5, 0.5]) }), [0, 0.75, 0])
    const platform = createBodyAt(new Cuboid({ extents: createVector([2, 0.25, 2]) }))

    passenger.body.friction = 1
    platform.body.friction = 1
    platform.body.motionType = 'kinematic'
    platform.body.linearVelocity.x = 0.5
    scene.entities.passenger = passenger.entity
    scene.entities.platform = platform.entity

    scene.update(1 / 60)
    expect(scene.physics.solver.cachedContactCount).to.be.greaterThan(0)

    let resetCount = 0

    const resetCachedContacts = scene.physics.solver.resetCachedContacts.bind(scene.physics.solver)

    scene.physics.solver.resetCachedContacts = () => {
      resetCount++

      resetCachedContacts()
    }
    platform.entity.translation.x = 1

    platform.body.applyTransform(platform.entity)
    scene.physics.prepare([passenger.body, platform.body], [], scene.gravity)
    expect(resetCount).to.equal(0)
    expect(scene.physics.solver.cachedContactCount).to.be.greaterThan(0)
  })
  it('transfers rotating-platform surface velocity at the contact point', () => {
    const passenger = createBodyAt(new Sphere({ radius: 0.5 }), [1, 0.75, 0])
    const platform = createBodyAt(new Cuboid({ extents: createVector([2, 0.25, 2]) }))

    passenger.body.friction = 1
    platform.body.friction = 1
    platform.body.motionType = 'kinematic'
    platform.body.angularVelocity.y = 1
    passenger.body.linearVelocity.y = -1

    const manifolds = Narrowphase.calculateCollisionManifolds({
      bodyPairs: [[passenger.body, platform.body]],
      finiteBodyColliderPairs: [],
      infiniteBodyColliderPairs: []
    })
    const solver = new CollisionSolver()

    solver.beginVelocityFrame()

    for (let iteration = 0; iteration < 8; iteration++) {
      solver.solveVelocities(manifolds, 1 / 60, iteration === 0)
    }

    solver.endVelocityFrame()
    expect(Math.abs(passenger.body.linearVelocity.z)).to.be.greaterThan(0.1)
  })
  it('sweeps fast objects against thin static geometry', () => {
    const volume = new Sphere({ radius: 0.1, origin: createVector([0, 1, 0]) })
    const floor = new Cuboid({ extents: createVector([2, 0.01, 2]) })
    const hit = sweepVolume(volume, createVector([0, -2, 0]), floor)!

    expect(hit.fraction).to.be.closeTo(0.445, 0.001)
    assertNear(hit.normal, Vector3.createUp(), 0.002)

    const scene = new Scene(),
      { body, entity } = createBodyAt(new Sphere({ radius: 0.1 }), [0, 1, 0])

    body.isContinuousCollisionEnabled = true
    body.linearVelocity.y = -120
    scene.entities.bullet = entity
    scene.colliders.floor = floor

    scene.update(1 / 60)
    expect(entity.translation.y).to.be.greaterThan(0.108)
    expect(Math.abs(body.linearVelocity.y)).to.be.lessThan(0.01)
  })
  it('lets continuous bodies slide and separate from initial contacts', () => {
    const scene = new Scene(),
      { body, entity } = createBodyAt(new Sphere(), [0, 1, 0])

    scene.gravity.reset()

    scene.colliders.floor = new Plane()
    scene.entities.body = entity
    body.isContinuousCollisionEnabled = true
    body.linearVelocity.x = 3

    scene.update(1 / 60)
    expect(entity.translation.x).to.be.greaterThan(0.049)

    body.linearVelocity.y = 3

    scene.update(1 / 60)
    expect(entity.translation.y).to.be.greaterThan(1.049)
  })
  it('invalidates a sleeping island when a dynamic support is removed', () => {
    const scene = new Scene()
    const lowerBody = createBodyAt(new Cuboid({ extents: createVector([0.5, 0.5, 0.5]) }), [0, 0.5, 0])
    const upperBody = createBodyAt(new Cuboid({ extents: createVector([0.5, 0.5, 0.5]) }), [0, 1.5, 0])

    scene.entities.lower = lowerBody.entity
    scene.entities.upper = upperBody.entity
    scene.colliders.floor = new Plane()

    scene.update(1 / 60)
    lowerBody.body.sleep()
    upperBody.body.sleep()
    delete scene.entities.lower
    scene.update(1 / 60)
    expect(upperBody.body.isSleeping).to.equal(false)
    expect(upperBody.body.linearVelocity.y).to.be.lessThan(0)
  })
  it('bounds catch-up, rejects invalid delta and exposes interpolation without mutating physics', () => {
    const scene = new Scene(),
      { body, entity } = createBodyAt(new Sphere())

    scene.gravity.reset()

    body.linearVelocity.x = 1
    scene.entities.body = entity

    scene.update(10)
    expect(entity.translation.x).to.be.lessThan(0.07)
    expect(scene.droppedSimulationTime).to.be.greaterThan(9.9)
    scene.update(1 / 120)

    const before = entity.translation.x,
      pose = scene.interpolatePose(entity)

    expect(pose.translation.x).to.be.lessThan(before)
    expect(entity.translation.x).to.equal(before)
    expect(() => scene.update(NaN)).to.throw()
    expect(() => scene.update(-1)).to.throw()
  })
})
