// Read-only diagnostic probes for the 2026-09-13 audit; not regression expectations.
// Run from luz: node tests/integration/physics-audit.cjs
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'CommonJS',
    moduleResolution: 'node',
    experimentalDecorators: true
  }
})

const P = require('@luz/physics')

const solver = new P.CollisionSolver()
const { Entity } = require('@luz/core')
const { Body, Biped } = require('@luz/physics')
const { Scene } = require('@luz/scene')
const { Vector3, Quaternion } = require('@luz/math')

const createVector = (values) => new Vector3(values)

const recordResult = (name, value) => console.log(JSON.stringify({ name, ...value }))

const applyPose = (shape, translation = [0, 0, 0], rotation = Quaternion.createIdentity()) => {
  const entity = new Entity({ translation: createVector(translation), rotation })

  entity.update(0)
  shape.applyTransform(entity)

  return entity
}

const createBodyAt = (volume, translation = [0, 0, 0], mass = 1, Type = Body) => {
  const body = new Type({ mass })

  body.volume = volume

  const entity = applyPose(volume, translation)

  entity.components.Body = body

  body.applyTransform(entity)
  volume.calculateInverseInertia(mass, entity)

  body.restitution = 0
  body.friction = 0

  return { body, entity }
}

const ellipsoid = new P.Ellipsoid({ radius: createVector([3, 1, 1]) })

applyPose(ellipsoid, [0, 1.8, 0], Quaternion.setFromAxisAngle(Vector3.createForward(), Math.PI / 4))
recordResult('ellipsoid support and bounds', {
  actualHalfWidth: P.calculateColliderBoundingBox(ellipsoid).maximum.x,
  expectedHalfWidth: Math.sqrt(5),
  penetratingPlaneDetected: !!P.collidePlaneWithEllipsoid(new P.Plane(), ellipsoid)
})

const cylinder = new P.Cylinder({ radius: 1, height: 2 })
const beforeAxis = cylinder.axes[2].xyz

applyPose(cylinder)
recordResult('cylinder constructor axis', { beforeAxis, afterAxis: cylinder.axes[2].xyz })
recordResult('sphere above cylinder cap', {
  expectedContact: false,
  actual: P.collideSphereWithCylinder(
    new P.Sphere({ origin: createVector([0, 1.75, 0]), radius: 0.25 }),
    cylinder
  )?.map((contact) => ({
    point: contact.point.xyz,
    penetration: contact.penetrationDepth
  }))
})

const c1 = new P.Cylinder({ radius: 0.25, height: 4 }),
  c2 = new P.Cylinder({ radius: 0.25, height: 4 })

applyPose(c1)
applyPose(c2, [0, 3, 0])
recordResult('overlapping coaxial cylinders', {
  expectedContact: true,
  actualContact: !!P.collideCylinderWithCylinder(c1, c2)
})

const box = new P.Cuboid({ extents: createVector([3, 3, 3]) })

recordResult('contained shapes', {
  sphereInBox: !!P.collideSphereWithCuboid(new P.Sphere({ radius: 0.25 }), box),
  ellipsoidInBox: !!P.collideEllipsoidWithCuboid(new P.Ellipsoid({ radius: createVector([0.5, 0.5, 0.5]) }), box),
  sphereInEllipsoid: !!P.collideSphereWithEllipsoid(
    new P.Sphere({ radius: 0.25 }),
    new P.Ellipsoid({ radius: createVector([3, 3, 3]) })
  )
})
recordResult('missing ellipsoid pair', {
  actualContact: !!new P.CollisionDispatcher().dispatch(new P.Ellipsoid(), new P.Ellipsoid())
})

const largeEllipsoid = new P.Ellipsoid({ radius: createVector([2, 2, 2]) })

recordResult('ellipsoid penetration units', {
  actual: P.collideEllipsoidWithCuboid(largeEllipsoid, new P.Cuboid({ origin: createVector([2.5, 0, 0]) }))?.[0]
    .penetrationDepth,
  expected: 0.5
})

const rotatedBox = new P.Cuboid({ extents: createVector([1, 2, 3]) })
const rotatedPose = applyPose(rotatedBox, [0, 0, 0], Quaternion.setFromAxisAngle(Vector3.createForward(), Math.PI / 4))

rotatedBox.calculateInverseInertia(1, rotatedPose)

const expectedInertiaX = rotatedPose.rotation.transformVector3(
  createVector([(Math.SQRT1_2 * 3) / 13, (-Math.SQRT1_2 * 3) / 10, 0])
)

recordResult('world inverse inertia', {
  actual: rotatedBox.inverseInertia.transform(Vector3.createRight()).xyz,
  expected: expectedInertiaX.xyz
})

const spinning = createBodyAt(new P.Sphere())

spinning.entity.rotation.set(Quaternion.setFromAxisAngle(Vector3.createForward(), Math.PI / 2))
spinning.body.angularVelocity.set(Vector3.createRight())

const expectedRotation = Quaternion.setFromAxisAngle(Vector3.createRight(), 0.1).multiply(
  spinning.entity.rotation,
  new Quaternion()
)

spinning.body.update(spinning.entity, 0.1)
recordResult('world angular velocity integration', {
  actual: Array.from(spinning.entity.rotation),
  expected: Array.from(expectedRotation)
})

const offsetSphere = new P.Sphere({ origin: createVector([1, 0, 0]) })

applyPose(offsetSphere, [0, 0, 0], Quaternion.setFromAxisAngle(Vector3.createForward(), Math.PI / 2))
recordResult('rotated shape offset', { actual: offsetSphere.center.xyz, expected: [0, 1, 0] })

const groundContact = createBodyAt(new P.Sphere(), [0, 1, 0])
const manifold = {
  id: 'audit',
  bodies: [groundContact.body, null],
  collisions: [{ id: 'fixed', normal: Vector3.createDown(), point: Vector3.createZero(), penetrationDepth: 0 }]
}

solver.resetCachedContacts()

groundContact.body.linearVelocity.y = -10

solver.beginVelocityFrame()
solver.solveVelocities([manifold], 1 / 60, true)
solver.endVelocityFrame()

groundContact.body.linearVelocity.y = -0.1

solver.beginVelocityFrame()
solver.solveVelocities([manifold], 1 / 60, true)
solver.endVelocityFrame()
recordResult('warm start cannot retract impulse', {
  actualVelocityY: groundContact.body.linearVelocity.y,
  expectedVelocityY: 0
})
solver.resetCachedContacts()

const scene = new Scene(),
  sleeper = createBodyAt(new P.Sphere(), [0, 1, 0])

scene.entities.sleeper = sleeper.entity
scene.colliders.ground = new P.Plane()

sleeper.body.sleep()
delete scene.colliders.ground
scene.update(1 / 60)
recordResult('sleep after support removed', { y: sleeper.entity.translation.y, asleep: sleeper.body.isSleeping })

const scene2 = new Scene(),
  bullet = createBodyAt(new P.Sphere({ radius: 0.1 }), [0, 1, 0])

scene2.entities.bullet = bullet.entity
scene2.colliders.ground = new P.Plane()
bullet.body.linearVelocity.y = -120

scene2.update(1 / 60)
recordResult('discrete tunneling', { y: bullet.entity.translation.y, contacts: scene2.collisionManifolds.length })

const mover = createBodyAt(new P.Sphere())
const staticSphere = new P.Sphere({ origin: createVector([1.5, 0, 0]) })
const staticManifolds = P.Narrowphase.calculateCollisionManifolds({
  bodyPairs: [],
  finiteBodyColliderPairs: [[mover.body, staticSphere]],
  infiniteBodyColliderPairs: []
})

solver.solvePositions(staticManifolds)
recordResult('static sphere normal direction', { correctionX: mover.entity.translation.x, expectedSign: 'negative' })

const actor = createBodyAt(new P.Sphere(), [0, 1.5, 0], 1, Biped),
  platform = createBodyAt(new P.Cuboid(), [0, 0, 0], 0)

actor.body.linearVelocity.y = -1

const actorManifolds = P.Narrowphase.calculateCollisionManifolds({
  bodyPairs: [[actor.body, platform.body]],
  finiteBodyColliderPairs: [],
  infiniteBodyColliderPairs: []
})

solver.solveVelocities(actorManifolds, 1 / 60)

const actorCorrected = solver.solvePositions(actorManifolds)

recordResult('biped against mass-zero body', {
  contacts: actorManifolds.length,
  corrected: actorCorrected,
  velocityY: actor.body.linearVelocity.y
})

const square = new P.Polygon({
  vertices: [
    [-1, 0, -1],
    [-1, 0, 1],
    [1, 0, 1],
    [1, 0, -1]
  ].map(createVector)
})

recordResult('four-vertex polygon coverage', {
  actualContact: !!P.collidePolygonWithSphere(
    square,
    new P.Sphere({ origin: createVector([0.7, 0.1, -0.7]), radius: 0.2 })
  )
})
recordResult('skew rays', {
  actualContact: !!P.intersectRayWithRay(
    new P.Ray({ direction: Vector3.createRight() }),
    new P.Ray({ origin: createVector([0.5, -1, 1]), direction: Vector3.createUp() })
  )
})
recordResult('intersecting rays beyond one unit', {
  actualContact: !!P.intersectRayWithRay(
    new P.Ray({ direction: Vector3.createRight() }),
    new P.Ray({ origin: createVector([2, -1, 0]), direction: Vector3.createUp() })
  )
})

const finiteTriangle = new P.Polygon({
  vertices: [
    [-0.1, 0, -0.1],
    [0, 0, 0.1],
    [0.1, 0, -0.1]
  ].map(createVector)
})

applyPose(cylinder, [0, 0.9, 0])
recordResult('triangle inside cylinder cap', {
  actualContact: !!P.collidePolygonWithCylinder(finiteTriangle, cylinder)
})
applyPose(cylinder, [0, 1.25, 0], Quaternion.setFromAxisAngle(createVector([1, 0, 1]).normalize(), 0.4))
recordResult('tilted cylinder plane support sampling', {
  lowestY: cylinder.calculateSupportPoint(Vector3.createDown()).y,
  actualContact: !!P.collidePlaneWithCylinder(new P.Plane(), cylinder)
})

const quadContacts = P.normalizeCollisions([
  { normal: Vector3.createUp(), point: createVector([0, 0, 0]), penetrationDepth: 0.01 },
  { normal: Vector3.createUp(), point: createVector([0.002, 0, 0]), penetrationDepth: 0.01 }
])

recordResult('distinct contacts alias cache key', {
  count: quadContacts.length,
  ids: quadContacts.map((contact) => contact.id)
})
solver.resetCachedContacts()
groundContact.body.linearVelocity.reset()
solver.beginVelocityFrame()

for (let iteration = 0; iteration < 8; iteration++) {
  solver.solveVelocities([manifold], 1 / 60, iteration === 0)
}

solver.endVelocityFrame()
recordResult('persistence counter after one fixed step', {
  cached: solver.contactPersistence
})
new Scene().update(1 / 60)
recordResult('unrelated empty world evicts contact history', {
  entries: solver.cachedContactCount
})

// Deterministic search for an edge contact on penetrating boxes reporting zero depth.
let seed = 12345

const generateRandom = () => (seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296

for (let index = 0; index < 1000; index++) {
  const firstCuboid = new P.Cuboid({ extents: createVector([1, 0.3, 0.4]) }),
    secondCuboid = new P.Cuboid({ extents: createVector([1, 0.3, 0.4]) })
  const rotationA = Quaternion.setFromEulerAngles(generateRandom() * 3, generateRandom() * 3, generateRandom() * 3)
  const rotationB = Quaternion.setFromEulerAngles(generateRandom() * 3, generateRandom() * 3, generateRandom() * 3)
  const translationB = [generateRandom() - 0.5, generateRandom() - 0.5, generateRandom() - 0.5]

  applyPose(firstCuboid, [0, 0, 0], rotationA)
  applyPose(secondCuboid, translationB, rotationB)

  const collision = P.collideCuboidWithCuboid(firstCuboid, secondCuboid)?.[0]

  if (!collision?.featureId?.includes(':edge:') || collision.penetrationDepth > 0.00001) {
    continue
  }

  const axes = [
    ...firstCuboid.axes,
    ...secondCuboid.axes,
    ...firstCuboid.axes.flatMap((x) => secondCuboid.axes.map((y) => Vector3.calculateCrossProduct(x, y)))
  ]
  const offset = Vector3.subtract(secondCuboid.center, firstCuboid.center)
  const overlaps = axes
    .filter((axis) => axis.length > 0.00001)
    .map((axis) => {
      const normalizedAxis = axis.clone().normalize()
      const support = (box) =>
        box.axes.reduce(
          (sum, direction, index) =>
            sum + Math.abs(Vector3.calculateDotProduct(normalizedAxis, direction)) * box.extents[index],
          0
        )

      return (
        support(firstCuboid) + support(secondCuboid) - Math.abs(Vector3.calculateDotProduct(normalizedAxis, offset))
      )
    })

  if (Math.min(...overlaps) < 0.1) {
    continue
  }

  recordResult('box edge penetration', {
    actualDepth: collision.penetrationDepth,
    minimumSatOverlap: Math.min(...overlaps),
    rotationA: Array.from(rotationA),
    rotationB: Array.from(rotationB),
    translationB
  })
  break
}

solver.resetCachedContacts()
