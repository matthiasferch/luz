import { expect } from 'chai'
import { Vector3 } from '@luz/math'
import { Cuboid, Plane, Polygon, Sphere, sweepVolume } from '@luz/physics'
import { Pool } from '@luz/serialization'
import { calculateConvexDistance, collideConvexShapes } from '@luz/physics/collisions/algorithms/convex-queries'

describe('Convex query pooling', () => {
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
  it('keeps distance witnesses, simplex vertices and collision contacts independently owned', () => {
    const firstShape = new Cuboid()
    const secondShape = new Cuboid({ origin: new Vector3([3, 0.2, 0.1]) })
    const distance = calculateConvexDistance(firstShape, secondShape)

    expect(distance.distance).to.be.closeTo(1, 1e-5)

    secondShape.center.x = 1.5

    const collision = collideConvexShapes(firstShape, secondShape)![0]
    const results = [
      distance.normal,
      distance.firstPoint,
      distance.secondPoint,
      ...distance.simplex.flatMap(({ point, firstPoint, secondPoint }) => [point, firstPoint, secondPoint]),
      collision.point,
      collision.normal
    ]
    const snapshot = results.map((point) => point.clone())

    expect(collision.penetrationDepth).to.be.closeTo(0.5, 1e-5)

    for (let iteration = 0; iteration < 10; iteration++) {
      secondShape.center.x = 1 + iteration * 0.3

      calculateConvexDistance(firstShape, secondShape)
      collideConvexShapes(firstShape, secondShape)
      expect(borrowedObjects.size).to.equal(0)
      expect(results).to.deep.equal(snapshot)
    }

    for (const point of results) {
      expect(acquiredObjects.has(point)).to.equal(false)
    }

    expect(firstShape.center.xyz).to.deep.equal([0, 0, 0])
  })
  it('reuses simplex and expansion scratch across repeated penetration queries', () => {
    const firstShape = new Cuboid()
    const secondShape = new Cuboid({ origin: new Vector3([1.5, 0.2, 0.1]) })
    const collision = collideConvexShapes(firstShape, secondShape)
    const objectCount = acquiredObjects.size

    expect(objectCount).to.be.greaterThan(0)
    expect(objectCount).to.be.lessThan(64)

    for (let iteration = 0; iteration < 10; iteration++) {
      expect(collideConvexShapes(firstShape, secondShape)).to.deep.equal(collision)
      expect(acquiredObjects.size).to.equal(objectCount)
      expect(borrowedObjects.size).to.equal(0)
    }
  })
  it('releases scratch on separated shapes and keeps degenerate fallback contacts valid', () => {
    const firstShape = new Sphere()
    const secondShape = new Sphere({ origin: new Vector3([3, 0, 0]) })
    const distance = calculateConvexDistance(firstShape, secondShape)
    const center = new Vector3([2, 3, 4])
    const pointShape = { center, calculateSupportPoint: () => center.clone() }

    expect(distance.distance).to.equal(1)
    expect(distance.firstPoint.xyz).to.deep.equal([1, 0, 0])
    expect(distance.secondPoint.xyz).to.deep.equal([2, 0, 0])
    expect(distance.normal.xyz).to.deep.equal([1, 0, 0])
    expect(collideConvexShapes(firstShape, secondShape)).to.equal(null)

    const collision = collideConvexShapes(pointShape, pointShape)![0]

    expect(collision.penetrationDepth).to.equal(0)
    expect(collision.point.xyz).to.deep.equal(center.xyz)
    expect(collision.normal.xyz).to.deep.equal([1, 0, 0])
    expect(acquiredObjects.has(collision.point)).to.equal(false)
    expect(acquiredObjects.has(collision.normal)).to.equal(false)
    expect(borrowedObjects.size).to.equal(0)
  })
  it('unwinds distance, penetration and sweep scopes when a support calculation throws', () => {
    const firstShape = new Sphere()
    const secondShape = new Cuboid({ origin: new Vector3([3, 0, 0]) })

    secondShape.calculateSupportPoint = () => {
      throw new Error('support calculation failed')
    }

    for (const runQuery of [
      () => calculateConvexDistance(firstShape, secondShape),
      () => collideConvexShapes(firstShape, secondShape),
      () => sweepVolume(firstShape, new Vector3([4, 0, 0]), secondShape)
    ]) {
      expect(runQuery).to.throw('support calculation failed')
      expect(borrowedObjects.size).to.equal(0)
    }

    secondShape.calculateSupportPoint = Cuboid.prototype.calculateSupportPoint

    expect(calculateConvexDistance(firstShape, secondShape).distance).to.be.closeTo(1, 1e-5)
    expect(borrowedObjects.size).to.equal(0)
  })
  it('preserves outer search directions when a support callback runs another query', () => {
    const firstShape = new Cuboid()
    const secondShape = new Cuboid({ origin: new Vector3([1.5, 0.2, 0.1]) })
    const innerFirstShape = new Sphere()
    const innerSecondShape = new Sphere({ origin: new Vector3([3, 0, 0]) })
    const expectedCollision = collideConvexShapes(firstShape, secondShape)

    firstShape.calculateSupportPoint = (direction) => {
      const snapshot = direction.xyz
      const outerObjects = new Set(borrowedObjects)

      expect(calculateConvexDistance(innerFirstShape, innerSecondShape).distance).to.equal(1)
      expect(direction.xyz).to.deep.equal(snapshot)
      expect(borrowedObjects).to.deep.equal(outerObjects)

      return Cuboid.prototype.calculateSupportPoint.call(firstShape, direction)
    }

    expect(collideConvexShapes(firstShape, secondShape)).to.deep.equal(expectedCollision)
    expect(borrowedObjects.size).to.equal(0)
  })
  it('retains sweep normals across triangle searches and subsequent missed sweeps', () => {
    const volume = new Sphere({ origin: new Vector3([0, 3, 0]), radius: 0.5 })
    const displacement = new Vector3([0, -6, 0])
    const targets = [
      new Plane(),
      new Cuboid({ extents: new Vector3([5, 0.01, 5]) }),
      new Polygon({
        vertices: [
          [-5, 0, -5],
          [-5, 0, 5],
          [5, 0, 5],
          [5, 0, -5]
        ].map((point) => new Vector3(point))
      })
    ]
    const hits = targets.map((target) => sweepVolume(volume, displacement, target)!)
    const normals = hits.map(({ normal }) => normal.clone())

    hits.forEach((hit, index) => {
      expect(hit.collider).to.equal(targets[index])
      expect(hit.fraction).to.be.closeTo(index === 1 ? 0.415 : 2.5 / 6, 0.001)
      expect(Vector3.subtract(hit.normal, Vector3.createUp()).magnitude).to.be.lessThan(0.002)
      expect(acquiredObjects.has(hit.normal)).to.equal(false)
    })

    for (const direction of [Vector3.createUp(), Vector3.createRight(), Vector3.createZero()]) {
      for (const target of targets) {
        expect(sweepVolume(volume, direction, target)).to.equal(null)
        expect(borrowedObjects.size).to.equal(0)
      }
    }

    expect(hits.map(({ normal }) => normal)).to.deep.equal(normals)
    expect(volume.center.xyz).to.deep.equal([0, 3, 0])
    expect(displacement.xyz).to.deep.equal([0, -6, 0])
  })
})
