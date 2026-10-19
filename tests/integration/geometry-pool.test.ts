import { expect } from 'chai'
import { Vector3 } from '@luz/math'
import { Polygon, Sphere, collidePolygonWithSphere } from '@luz/physics'
import { Pool } from '@luz/serialization'
import { findClosestSegmentPoints } from '@luz/physics/collisions/algorithms/closest-segment-points'
import {
  findClosestPointOnPolygon,
  findClosestPointOnTriangle
} from '@luz/physics/collisions/algorithms/polygon-geometry'

const createPolygon = (vertexCount: number) =>
  new Polygon({
    vertices: Array.from({ length: vertexCount }, (_, index) => {
      const angle = (index * 2 * Math.PI) / vertexCount

      return new Vector3([Math.cos(angle) * 4, Math.sin(angle) * 4, 0])
    })
  })

describe('Closest-point pooling', () => {
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
  it('preserves returned points and collision contacts when scratch vectors are reused', () => {
    const polygon = createPolygon(8)
    const queryPoint = new Vector3([0.5, 0.5, 1])
    const segmentPoints = findClosestSegmentPoints(
      Vector3.createZero(),
      Vector3.createRight(),
      Vector3.createUp(),
      Vector3.createOne()
    )
    const trianglePoint = findClosestPointOnTriangle(queryPoint, ...polygon.triangles[0])
    const polygonPoint = findClosestPointOnPolygon(queryPoint, polygon)
    const collision = collidePolygonWithSphere(polygon, new Sphere({ origin: new Vector3([0.5, 0.5, 0.5]) }))![0]
    const results = [...segmentPoints, trianglePoint, polygonPoint, collision.point, collision.normal]
    const snapshot = results.map((point) => point.clone())

    for (let iteration = 0; iteration < 20; iteration++) {
      queryPoint.set([iteration * 0.2, iteration * -0.3, 2])
      findClosestSegmentPoints(queryPoint, Vector3.createRight(), Vector3.createUp(), Vector3.createOne())
      findClosestPointOnTriangle(queryPoint, ...polygon.triangles[0])
      findClosestPointOnPolygon(queryPoint, polygon)
      expect(borrowedObjects.size).to.equal(0)
      expect(results).to.deep.equal(snapshot)
    }

    expect(acquiredObjects.size).to.be.greaterThan(0)

    for (const point of results) {
      expect(acquiredObjects.has(point)).to.equal(false)
    }
  })
  it('keeps polygon scratch storage bounded as triangle counts increase', () => {
    const queryPoint = new Vector3([0.5, 0.5, 2])

    findClosestPointOnPolygon(queryPoint, createPolygon(32))

    const objectCount = acquiredObjects.size

    for (const vertexCount of [64, 128]) {
      const polygon = createPolygon(vertexCount)

      for (let iteration = 0; iteration < 10; iteration++) {
        const closestPoint = findClosestPointOnPolygon(queryPoint, polygon)

        expect(closestPoint.x).to.be.closeTo(0.5, 1e-5)
        expect(closestPoint.y).to.be.closeTo(0.5, 1e-5)
        expect(closestPoint.z).to.equal(0)
        expect(acquiredObjects.size).to.equal(objectCount)
        expect(borrowedObjects.size).to.equal(0)
      }
    }
  })
  it('releases segment scratch and nested polygon scratch when a calculation throws', () => {
    const polygon = createPolygon(8)
    const calculateDotProduct = Vector3.calculateDotProduct

    Vector3.calculateDotProduct = () => {
      throw new Error('projection failed')
    }

    try {
      expect(() =>
        findClosestSegmentPoints(Vector3.createZero(), Vector3.createRight(), Vector3.createUp(), Vector3.createOne())
      ).to.throw('projection failed')
      expect(borrowedObjects.size).to.equal(0)
      expect(() => findClosestPointOnPolygon(Vector3.createForward(), polygon)).to.throw('projection failed')
      expect(borrowedObjects.size).to.equal(0)
    } finally {
      Vector3.calculateDotProduct = calculateDotProduct
    }

    expect(findClosestPointOnPolygon(Vector3.createForward(), polygon).magnitude).to.be.lessThan(1e-5)
    findClosestSegmentPoints(Vector3.createZero(), Vector3.createRight(), Vector3.createUp(), Vector3.createOne())
    expect(borrowedObjects.size).to.equal(0)
  })
})
