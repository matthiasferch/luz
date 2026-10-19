import { expect } from 'chai'
import { Transform } from '@luz/core'
import { Quaternion, Vector3 } from '@luz/math'
import {
  Cuboid,
  Cylinder,
  Ellipsoid,
  Polygon,
  collideCylinderWithCuboid,
  collideCylinderWithCylinder,
  collidePolygonWithCuboid
} from '@luz/physics'
import { Pool } from '@luz/serialization'

const createFloor = (extent = 3): Polygon =>
  new Polygon({
    vertices: [
      [-extent, 0, -extent],
      [-extent, 0, extent],
      [extent, 0, extent],
      [extent, 0, -extent]
    ].map((point) => new Vector3(point))
  })

describe('Collision support pooling', () => {
  const acquireObject = Pool.prototype.acquire
  const releaseObject = Pool.prototype.release
  const acquiredObjects = new Set<unknown>()
  const borrowedObjects = new Set<unknown>()

  beforeEach(() => {
    acquiredObjects.clear()
    borrowedObjects.clear()

    Pool.prototype.acquire = function () {
      const object = acquireObject.call(this)

      expect(borrowedObjects.has(object)).to.equal(false)
      acquiredObjects.add(object)
      borrowedObjects.add(object)

      return object
    }
    Pool.prototype.release = function (object) {
      expect(borrowedObjects.delete(object)).to.equal(true)
      releaseObject.call(this, object)
    }
  })
  afterEach(() => {
    Pool.prototype.acquire = acquireObject
    Pool.prototype.release = releaseObject
  })

  for (const createShape of [() => new Cuboid(), () => new Cylinder(), () => new Ellipsoid()]) {
    const shapeType = createShape().type

    it(`reuses ${shapeType} support scratch while keeping results and inputs independent`, () => {
      const shape = createShape()
      const direction = new Vector3([2, -3, 4])
      const directionSnapshot = direction.clone()

      shape.applyTransform(
        new Transform({
          translation: new Vector3([2, 3, 4]),
          rotation: Quaternion.setFromEulerAngles(0.2, -0.5, 0.3)
        })
      )

      const centerSnapshot = shape.center.clone()
      const axisSnapshots = shape.axes.map((axis) => axis.clone())
      const point = shape.calculateSupportPoint(direction)
      const pointSnapshot = point.clone()
      const objectCount = acquiredObjects.size

      expect(objectCount).to.be.greaterThan(0)
      expect(acquiredObjects.has(point)).to.equal(false)
      expect(borrowedObjects.size).to.equal(0)

      for (let iteration = 0; iteration < 10; iteration++) {
        const nextPoint = shape.calculateSupportPoint(direction)

        expect(nextPoint).not.to.equal(point)
        expect(nextPoint).to.deep.equal(pointSnapshot)
        expect(acquiredObjects.size).to.equal(objectCount)
        expect(borrowedObjects.size).to.equal(0)
        nextPoint.reset()
        expect(point).to.deep.equal(pointSnapshot)
      }

      expect(direction).to.deep.equal(directionSnapshot)
      expect(shape.center).to.deep.equal(centerSnapshot)
      expect(shape.axes).to.deep.equal(axisSnapshots)
    })
  }

  it('preserves axial, radial and zero-direction support for every cylinder axis', () => {
    for (let axisIndex = 0; axisIndex < 3; axisIndex++) {
      const cylinder = new Cylinder({ origin: new Vector3([2, 3, 4]), radius: 2, height: 6, axisIndex })
      const axialDirection = cylinder.axes[2]
      const radialDirection = cylinder.axes[0]
      const expectedAxialPoint = Vector3.add(cylinder.center, Vector3.scale(axialDirection, 3))
      const expectedRadialPoint = Vector3.add(expectedAxialPoint, Vector3.scale(radialDirection, 2))
      const zeroPoint = cylinder.calculateSupportPoint(Vector3.createZero())

      expect(cylinder.calculateSupportPoint(axialDirection)).to.deep.equal(expectedAxialPoint)
      expect(cylinder.calculateSupportPoint(radialDirection)).to.deep.equal(expectedRadialPoint)
      expect(cylinder.calculateEffectiveRadius(axialDirection)).to.equal(3)
      expect(cylinder.calculateEffectiveRadius(radialDirection)).to.equal(2)
      expect(cylinder.calculateEffectiveRadius(Vector3.createZero())).to.equal(0)
      expect(zeroPoint).to.deep.equal(cylinder.center)
      expect(zeroPoint).not.to.equal(cylinder.center)
      expect(acquiredObjects.has(zeroPoint)).to.equal(false)
      expect(borrowedObjects.size).to.equal(0)
    }
  })
  it('keeps default cuboid vertices owned and fills reusable caller destinations', () => {
    const cuboid = new Cuboid({ origin: new Vector3([2, 3, 4]), extents: new Vector3([1, 2, 3]) })
    const vertices = cuboid.calculateVertices()
    const snapshot = vertices.map((vertex) => vertex.clone())
    const destination = [new Vector3([99, 99, 99])]
    const firstDestination = destination[0]

    expect(vertices.map((vertex) => vertex.xyz)).to.deep.equal([
      [3, 5, 7],
      [3, 5, 1],
      [3, 1, 7],
      [3, 1, 1],
      [1, 5, 7],
      [1, 5, 1],
      [1, 1, 7],
      [1, 1, 1]
    ])
    expect(cuboid.calculateVertices(destination)).to.equal(destination)
    expect(destination[0]).to.equal(firstDestination)
    expect(destination).to.deep.equal(snapshot)

    const destinationVertices = destination.slice()

    cuboid.applyTransform(new Transform({ rotation: Quaternion.setFromEulerAngles(0.4, 0.2, -0.3) }))
    expect(cuboid.calculateVertices(destination)).to.equal(destination)
    expect(destination).to.deep.equal(cuboid.calculateVertices())
    expect(vertices).to.deep.equal(snapshot)
    destination.forEach((vertex, index) => {
      expect(vertex).to.equal(destinationVertices[index])
      expect(acquiredObjects.has(vertex)).to.equal(false)
    })
    vertices.forEach((vertex) => expect(acquiredObjects.has(vertex)).to.equal(false))
    expect(borrowedObjects.size).to.equal(0)
  })
  it('releases support scratch if vector arithmetic throws', () => {
    const scaleVector = Vector3.scale
    const shapes = [new Cuboid(), new Cylinder(), new Ellipsoid()]

    try {
      Vector3.scale = () => {
        expect(borrowedObjects.size).to.be.greaterThan(0)

        throw new Error('support arithmetic failed')
      }

      for (const shape of shapes) {
        expect(() => shape.calculateSupportPoint(Vector3.createRight())).to.throw('support arithmetic failed')
        expect(borrowedObjects.size).to.equal(0)
      }
    } finally {
      Vector3.scale = scaleVector
    }

    shapes.forEach((shape) => expect(shape.calculateSupportPoint(Vector3.createRight()).x).to.equal(1))
    expect(borrowedObjects.size).to.equal(0)
  })
  it('preserves outer support scratch during a nested calculation on the same pool', () => {
    const cuboid = new Cuboid()
    const nestedCuboid = new Cuboid({ origin: new Vector3([7, 8, 9]) })
    const direction = new Vector3([2, -3, 4])
    const expectedPoint = cuboid.calculateSupportPoint(direction)

    let hasNestedCall = false

    Object.defineProperty(cuboid.axes[0], 'x', {
      get() {
        if (!hasNestedCall) {
          hasNestedCall = true

          const outerObjects = new Set(borrowedObjects)

          expect(outerObjects.size).to.be.greaterThan(0)
          expect(nestedCuboid.calculateSupportPoint(direction).xyz).to.deep.equal([8, 7, 10])
          expect(borrowedObjects).to.deep.equal(outerObjects)
        }

        return this[0]
      }
    })
    expect(cuboid.calculateSupportPoint(direction)).to.deep.equal(expectedPoint)
    expect(hasNestedCall).to.equal(true)
    expect(borrowedObjects.size).to.equal(0)
  })

  for (const [label, position, contactType] of [
    ['cap', [0, 1.6, 0], 'patch'],
    ['side', [1.4, 0, 0], 'line'],
    ['corner', [1.3, 0, 1.3], undefined]
  ] as const) {
    it(`retains cylinder ${label} contacts after scratch reuse`, () => {
      const cuboid = new Cuboid()
      const cylinder = new Cylinder({ radius: 0.5, height: 1.2, origin: new Vector3([...position]) })
      const collisions = collideCylinderWithCuboid(cylinder, cuboid)!
      const snapshot = collisions.map((collision) => ({
        ...collision,
        point: collision.point.clone(),
        normal: collision.normal.clone()
      }))
      const objectCount = acquiredObjects.size

      expect(collisions).to.have.lengthOf(label === 'side' ? 2 : 1)
      expect(collisions[0].contactType).to.equal(contactType)
      expect(objectCount).to.be.greaterThan(0)

      for (const collision of collisions) {
        expect(acquiredObjects.has(collision.point)).to.equal(false)
        expect(acquiredObjects.has(collision.normal)).to.equal(false)
      }

      for (let iteration = 0; iteration < 10; iteration++) {
        expect(collideCylinderWithCuboid(cylinder, cuboid)).to.deep.equal(snapshot)
        expect(acquiredObjects.size).to.equal(objectCount)
        expect(borrowedObjects.size).to.equal(0)
      }

      cylinder.center.set([20, 20, 20])
      expect(collideCylinderWithCuboid(cylinder, cuboid)).to.equal(null)
      expect(collisions).to.deep.equal(snapshot)
      expect(borrowedObjects.size).to.equal(0)
    })
  }

  for (const [label, position, contactType] of [
    ['full cap', [0.2, 0.99, 0], 'patch'],
    ['clipped cap', [2.2, 0.99, 0], 'patch'],
    ['side impact', [2.4, 0, 0], undefined]
  ] as const) {
    it(`keeps cylinder ${label} results independent of reused scratch and each other`, () => {
      const reference = new Cylinder({ radius: 2, height: 1 })
      const incident = new Cylinder({ radius: 0.5, height: 1, origin: new Vector3([...position]) })
      const referenceSnapshot = { center: reference.center.clone(), axes: reference.axes.map((axis) => axis.clone()) }
      const incidentSnapshot = { center: incident.center.clone(), axes: incident.axes.map((axis) => axis.clone()) }
      const collisions = collideCylinderWithCylinder(incident, reference)!
      const snapshot = collisions.map((collision) => ({
        ...collision,
        point: collision.point.clone(),
        normal: collision.normal.clone()
      }))
      const objectCount = acquiredObjects.size

      expect(collisions.length).to.be.greaterThan(0)
      expect(collisions[0].contactType).to.equal(contactType)
      expect(objectCount).to.be.greaterThan(0)

      if (label === 'clipped cap') {
        expect(collisions.some(({ featureId }) => featureId?.includes('clip:'))).to.equal(true)
      }

      for (const collision of collisions) {
        expect(acquiredObjects.has(collision.point)).to.equal(false)
        expect(acquiredObjects.has(collision.normal)).to.equal(false)
      }

      for (let iteration = 0; iteration < 10; iteration++) {
        const repeatedCollisions = collideCylinderWithCylinder(incident, reference)!

        expect(repeatedCollisions).to.deep.equal(snapshot)
        expect(acquiredObjects.size).to.equal(objectCount)
        expect(borrowedObjects.size).to.equal(0)
        repeatedCollisions.forEach(({ point: contact, normal }) => {
          contact.reset()
          normal.reset()
        })
        expect(collisions).to.deep.equal(snapshot)
      }

      expect(reference.center).to.deep.equal(referenceSnapshot.center)
      expect(reference.axes).to.deep.equal(referenceSnapshot.axes)
      expect(incident.center).to.deep.equal(incidentSnapshot.center)
      expect(incident.axes).to.deep.equal(incidentSnapshot.axes)
      incident.center.set([20, 20, 20])
      expect(collideCylinderWithCylinder(incident, reference)).to.equal(null)
      expect(collisions).to.deep.equal(snapshot)
      expect(borrowedObjects.size).to.equal(0)

      if (collisions.length > 1) {
        collisions[0].normal.reset()
        collisions[0].point.reset()
        expect(collisions[1]).to.deep.equal(snapshot[1])
      }
    })
  }

  it('unwinds cylinder cap scratch after exceptions and protects it during nested collisions', () => {
    const reference = new Cylinder({ radius: 2, height: 1 })
    const incident = new Cylinder({ radius: 0.5, height: 1, origin: new Vector3([0.2, 0.99, 0]) })
    const nestedCylinder = new Cylinder({ radius: 0.5, height: 1, origin: new Vector3([-2.2, 0.99, 0]) })
    const expectedCollisions = collideCylinderWithCylinder(incident, reference)
    const expectedNestedCollisions = collideCylinderWithCylinder(nestedCylinder, reference)
    const calculateSupportPoint = incident.calculateSupportPoint

    expect(expectedCollisions).not.to.equal(null)
    expect(expectedNestedCollisions).not.to.equal(null)

    incident.calculateSupportPoint = () => {
      expect(borrowedObjects.size).to.be.greaterThan(0)

      throw new Error('cylinder support failed')
    }

    expect(() => collideCylinderWithCylinder(incident, reference)).to.throw('cylinder support failed')
    expect(borrowedObjects.size).to.equal(0)

    let hasNestedCall = false

    incident.calculateSupportPoint = (direction) => {
      const outerObjects = new Set(borrowedObjects)
      const outerSnapshots = [...outerObjects].map((object) => (object as Vector3).clone())

      expect(outerObjects.size).to.be.greaterThan(0)
      expect(collideCylinderWithCylinder(nestedCylinder, reference)).to.deep.equal(expectedNestedCollisions)
      expect(borrowedObjects).to.deep.equal(outerObjects)
      expect([...outerObjects]).to.deep.equal(outerSnapshots)

      hasNestedCall = true

      return calculateSupportPoint.call(incident, direction)
    }

    expect(collideCylinderWithCylinder(incident, reference)).to.deep.equal(expectedCollisions)
    expect(hasNestedCall).to.equal(true)
    expect(borrowedObjects.size).to.equal(0)
  })

  for (const [label, extent, height, contactType] of [
    ['support vertices', 3, 0.9, 'patch'],
    ['polygon vertices', 0.5, 1, 'patch'],
    ['edge intersections', 0.5, 0.5, 'line']
  ] as const) {
    it(`retains ${label} in polygon collisions after scratch reuse`, () => {
      const polygon = createFloor(extent)
      const cuboid = new Cuboid()

      cuboid.center.y = height

      if (contactType === 'line') {
        cuboid.applyTransform(
          new Transform({
            translation: new Vector3([1, height, 0]),
            rotation: Quaternion.setFromEulerAngles(0.4, 0.2, -0.3)
          })
        )
      }

      const collisions = collidePolygonWithCuboid(polygon, cuboid)!

      expect(collisions).not.to.equal(null)
      expect(collisions.length).to.be.greaterThan(0)
      expect(collisions[0].contactType).to.equal(contactType)

      const snapshot = collisions.map((collision) => ({
        ...collision,
        point: collision.point.clone(),
        normal: collision.normal.clone()
      }))
      const objectCount = acquiredObjects.size

      for (const collision of collisions) {
        expect(acquiredObjects.has(collision.point)).to.equal(false)
        expect(acquiredObjects.has(collision.normal)).to.equal(false)
      }

      for (let iteration = 0; iteration < 10; iteration++) {
        expect(collidePolygonWithCuboid(polygon, cuboid)).to.deep.equal(snapshot)
        expect(acquiredObjects.size).to.equal(objectCount)
        expect(borrowedObjects.size).to.equal(0)
      }

      cuboid.center.set([20, 20, 20])
      expect(collidePolygonWithCuboid(polygon, cuboid)).to.equal(null)
      expect(collisions).to.deep.equal(snapshot)
      expect(borrowedObjects.size).to.equal(0)
    })
  }

  for (const colliderType of ['cylinder', 'polygon']) {
    it(`unwinds ${colliderType} collision scratch on exceptions and preserves it through nested calls`, () => {
      const cuboid = new Cuboid({ origin: new Vector3([0, 1, 0]) })
      const nestedCuboid = new Cuboid({ origin: new Vector3([10, 0, 0]) })
      const cylinder = new Cylinder({ origin: new Vector3([0, 2.9, 0]) })
      const polygon = createFloor()
      const calculateCollision = (target: Cuboid) =>
        colliderType === 'cylinder'
          ? collideCylinderWithCuboid(cylinder, target)
          : collidePolygonWithCuboid(polygon, target)
      const expectedCollisions = calculateCollision(cuboid)

      expect(expectedCollisions).not.to.equal(null)

      cuboid.calculateVertices = () => {
        expect(borrowedObjects.size).to.be.greaterThan(0)

        throw new Error('vertex calculation failed')
      }

      expect(() => calculateCollision(cuboid)).to.throw('vertex calculation failed')
      expect(borrowedObjects.size).to.equal(0)

      let hasNestedCall = false

      cuboid.calculateVertices = (destination) => {
        const outerObjects = new Set(borrowedObjects)

        expect(outerObjects.size).to.be.greaterThan(0)
        expect(calculateCollision(nestedCuboid)).to.equal(null)
        expect(borrowedObjects).to.deep.equal(outerObjects)

        hasNestedCall = true

        return Cuboid.prototype.calculateVertices.call(cuboid, destination)
      }

      expect(calculateCollision(cuboid)).to.deep.equal(expectedCollisions)
      expect(hasNestedCall).to.equal(true)
      expect(borrowedObjects.size).to.equal(0)
    })
  }
})
