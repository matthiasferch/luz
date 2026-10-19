import { expect } from 'chai'
import { Transform } from '@luz/core'
import { Quaternion, Vector3 } from '@luz/math'
import { Cuboid, collideCuboidWithCuboid } from '@luz/physics'
import { Pool } from '@luz/serialization'

const createCuboidPair = (): [Cuboid, Cuboid] => {
  const firstCuboid = new Cuboid()
  const secondCuboid = new Cuboid()

  secondCuboid.center.set([0, 1.5, 0])

  return [firstCuboid, secondCuboid]
}

describe('Cuboid collision vector pooling', () => {
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
  it('reuses scratch vectors while preserving previously returned contacts and normals', () => {
    const cuboids = createCuboidPair()
    const collisions = collideCuboidWithCuboid(...cuboids)!
    const snapshot = collisions.map((collision) => ({
      ...collision,
      point: collision.point.clone(),
      normal: collision.normal.clone()
    }))
    const vectorCount = acquiredObjects.size

    expect(collisions).to.have.lengthOf(4)
    expect(vectorCount).to.be.greaterThan(0)
    expect(borrowedObjects.size).to.equal(0)

    for (const collision of collisions) {
      expect(acquiredObjects.has(collision.point)).to.equal(false)
      expect(acquiredObjects.has(collision.normal)).to.equal(false)
      expect(collision.normal.xyz).to.deep.equal(Vector3.createUp().xyz)
      expect(collision.point.y).to.equal(0.75)
    }

    for (let iteration = 0; iteration < 20; iteration++) {
      cuboids[0].center.x = iteration
      cuboids[1].center.x = iteration

      expect(collideCuboidWithCuboid(...cuboids)).to.have.lengthOf(4)
      expect(acquiredObjects.size).to.equal(vectorCount)
      expect(borrowedObjects.size).to.equal(0)
      expect(collisions).to.deep.equal(snapshot)
    }
  })
  it('returns scratch vectors when the separating-axis check exits early', () => {
    const cuboids = createCuboidPair()

    cuboids[1].center.x = 10

    expect(collideCuboidWithCuboid(...cuboids)).to.equal(null)
    expect(acquiredObjects.size).to.be.greaterThan(0)
    expect(borrowedObjects.size).to.equal(0)
  })
  it('preserves clipped and reduced face contacts after resetting pooled polygon vertices', () => {
    const cuboids = createCuboidPair()

    cuboids[1].applyTransform(
      new Transform({
        translation: new Vector3([0, 1.5, 0]),
        rotation: Quaternion.setFromAxisAngle(Vector3.createUp(), 0.4)
      })
    )

    const originalAxes = cuboids.map((cuboid) => cuboid.axes.map((axis) => axis.xyz))
    const collisions = collideCuboidWithCuboid(...cuboids)!
    const snapshot = collisions.map(({ point: contact, normal }) => ({ point: contact.xyz, normal: normal.xyz }))

    expect(collisions).to.have.lengthOf(4)
    expect(borrowedObjects.size).to.equal(0)
    expect(cuboids.map((cuboid) => cuboid.axes.map((axis) => axis.xyz))).to.deep.equal(originalAxes)

    for (const collision of collisions) {
      expect(collision.contactType).to.equal('patch')
      expect(collision.point.y).to.equal(0.75)
      expect(Math.max(Math.abs(collision.point.x), Math.abs(collision.point.z))).to.equal(1)
      expect(collision.normal.xyz).to.deep.equal(Vector3.createUp().xyz)
      expect(acquiredObjects.has(collision.point)).to.equal(false)
      expect(acquiredObjects.has(collision.normal)).to.equal(false)
    }

    collideCuboidWithCuboid(...createCuboidPair())
    expect(collisions.map(({ point: contact, normal }) => ({ point: contact.xyz, normal: normal.xyz }))).to.deep.equal(
      snapshot
    )
    expect(borrowedObjects.size).to.equal(0)
  })
  it('preserves edge contacts after resetting pooled axes and segment endpoints', () => {
    const firstCuboid = new Cuboid({ extents: new Vector3([1, 0.3, 0.4]) })
    const secondCuboid = new Cuboid({ extents: new Vector3([1, 0.3, 0.4]) })

    firstCuboid.applyTransform(new Transform({ rotation: Quaternion.setFromEulerAngles(0.2, 0.4, 0.6) }))
    secondCuboid.applyTransform(
      new Transform({
        translation: new Vector3([0.3, 0.2, 0.1]),
        rotation: Quaternion.setFromEulerAngles(-0.5, 0.3, 0.8)
      })
    )

    const collisions = collideCuboidWithCuboid(firstCuboid, secondCuboid)!
    const collision = collisions[0]
    const expectedContact = [-0.0613249242, 0.1456148177, 0.4517841637]
    const normal = collision.normal.xyz

    expect(collisions).to.have.lengthOf(1)
    expect(collision.contactType).to.equal('point')
    expect(collision.normal.magnitude).to.be.closeTo(1, 1e-6)
    expect(acquiredObjects.has(collision.point)).to.equal(false)
    expect(acquiredObjects.has(collision.normal)).to.equal(false)
    expect(borrowedObjects.size).to.equal(0)
    collideCuboidWithCuboid(...createCuboidPair())

    for (let axis = 0; axis < 3; axis++) {
      expect(collision.point[axis]).to.be.closeTo(expectedContact[axis], 1e-6)
    }

    expect(collision.normal.xyz).to.deep.equal(normal)
    expect(borrowedObjects.size).to.equal(0)
  })
  it('returns scratch vectors when a collision calculation throws', () => {
    const cuboids = createCuboidPair()

    Object.defineProperty(cuboids[0].extents, 'x', {
      get() {
        throw new Error('Extent read failed')
      }
    })
    expect(() => collideCuboidWithCuboid(...cuboids)).to.throw('Extent read failed')
    expect(acquiredObjects.size).to.be.greaterThan(0)
    expect(borrowedObjects.size).to.equal(0)
    expect(collideCuboidWithCuboid(...createCuboidPair())).to.have.lengthOf(4)
    expect(borrowedObjects.size).to.equal(0)
  })
  it('keeps outer scratch vectors alive during a nested collision calculation', () => {
    const cuboids = createCuboidPair()
    const nestedCuboids = createCuboidPair()
    const expectedCollisions = collideCuboidWithCuboid(...cuboids)

    let hasNestedCollision = false

    nestedCuboids[0].center.set([5, 3, 2])
    nestedCuboids[1].center.set([6.5, 3, 2])
    Object.defineProperty(cuboids[0].extents, 'x', {
      get() {
        if (!hasNestedCollision) {
          hasNestedCollision = true

          const borrowedObjectCount = borrowedObjects.size

          expect(borrowedObjectCount).to.be.greaterThan(0)
          expect(collideCuboidWithCuboid(...nestedCuboids)).to.have.lengthOf(4)
          expect(borrowedObjects.size).to.equal(borrowedObjectCount)
        }

        return this[0]
      }
    })
    expect(collideCuboidWithCuboid(...cuboids)).to.deep.equal(expectedCollisions)
    expect(hasNestedCollision).to.equal(true)
    expect(borrowedObjects.size).to.equal(0)
  })
})
