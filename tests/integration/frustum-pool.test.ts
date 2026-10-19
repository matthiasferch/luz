import { expect } from 'chai'
import { BoundingBox, Camera, Frustum, Light, Transform } from '@luz/core'
import { Vector3 } from '@luz/math'
import { Pool } from '@luz/serialization'

describe('Frustum pooling', () => {
  const acquireObject = Pool.prototype.acquire
  const releaseObject = Pool.prototype.release
  const acquiredObjects = new Set<unknown>()
  const borrowedObjects = new Set<unknown>()

  let acquisitionCount = 0

  beforeEach(() => {
    acquiredObjects.clear()
    borrowedObjects.clear()

    acquisitionCount = 0
    Pool.prototype.acquire = function () {
      const object = acquireObject.call(this)

      expect(borrowedObjects.has(object)).to.equal(false)
      acquiredObjects.add(object)
      borrowedObjects.add(object)

      acquisitionCount++

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
  it('reuses geometry for unchanged bounds checks and scratch vectors for changed projections', () => {
    const frustum = new Frustum()
    const boundingBox = new BoundingBox([new Vector3([-0.1, -0.1, -5.1]), new Vector3([0.1, 0.1, -4.9])])

    frustum.applyTransform(new Transform())
    expect(frustum.intersectsBoundingBox(boundingBox)).to.equal(true)

    const objectCount = acquiredObjects.size
    const initialAcquisitionCount = acquisitionCount

    expect(objectCount).to.be.greaterThan(0)
    expect(borrowedObjects.size).to.equal(0)

    for (let iteration = 0; iteration < 100; iteration++) {
      expect(frustum.intersectsBoundingBox(boundingBox)).to.equal(true)
    }

    expect(acquisitionCount).to.equal(initialAcquisitionCount)

    for (const aspect of [0.5, 1, 2, 3]) {
      frustum.aspect = aspect

      expect(frustum.intersectsBoundingBox(boundingBox)).to.equal(true)

      const vertices = frustum.calculateVertices()
      const planes = frustum.calculatePlanes()

      expect(acquiredObjects.size).to.equal(objectCount)
      expect(borrowedObjects.size).to.equal(0)

      for (const vector of [...vertices, ...planes.map(({ normal }) => normal)]) {
        expect(acquiredObjects.has(vector)).to.equal(false)
      }
    }

    expect(acquisitionCount).to.be.greaterThan(initialAcquisitionCount)
  })
  it('releases scratch vectors and invalidates partial geometry when rebuilding throws', () => {
    const frustum = new Frustum()
    const previousVertices = frustum.calculateVertices()
    const previousPlanes = frustum.calculatePlanes()
    const calculateCrossProduct = Vector3.calculateCrossProduct

    frustum.fieldOfView = 45
    Vector3.calculateCrossProduct = () => {
      throw new Error('plane calculation failed')
    }

    try {
      expect(() => frustum.calculatePlanes()).to.throw('plane calculation failed')
      expect(borrowedObjects.size).to.equal(0)
    } finally {
      Vector3.calculateCrossProduct = calculateCrossProduct
    }

    frustum.fieldOfView = 90

    expect(frustum.calculateVertices()).to.deep.equal(previousVertices)
    expect(frustum.calculatePlanes()).to.deep.equal(previousPlanes)
    expect(borrowedObjects.size).to.equal(0)
  })
  it('refreshes camera and light geometry independently when their poses and lenses change', () => {
    const camera = new Camera()
    const light = new Light()
    const transform = new Transform()

    transform.updateTransform()
    camera.update(transform, 0)
    light.update(transform, 0)

    const originalBoundingBox = new BoundingBox([camera.frustum.center.clone()])

    expect(camera.frustum.intersectsBoundingBox(originalBoundingBox)).to.equal(true)
    expect(light.shadowCamera.frustum.intersectsBoundingBox(originalBoundingBox)).to.equal(true)
    transform.translation.set([1000, 0, 0])
    transform.rotation.set([0, 0, 1, 0])
    transform.updateTransform()

    light.aspect = 2
    light.coneAngle = 40

    light.clipPlanes.set([0.25, 30])
    light.update(transform, 0)

    const movedBoundingBox = new BoundingBox([light.shadowCamera.frustum.center.clone()])

    expect(light.shadowCamera.frustum.intersectsBoundingBox(movedBoundingBox)).to.equal(true)
    expect(light.shadowCamera.frustum.intersectsBoundingBox(originalBoundingBox)).to.equal(false)
    expect(camera.frustum.intersectsBoundingBox(originalBoundingBox)).to.equal(true)
    expect(camera.frustum.intersectsBoundingBox(movedBoundingBox)).to.equal(false)

    camera.aspect = light.aspect
    camera.fieldOfView = light.coneAngle

    light.clipPlanes.copyTo(camera.clipPlanes)
    camera.update(transform, 0)
    expect(camera.frustum.calculatePlanes()).to.deep.equal(light.shadowCamera.frustum.calculatePlanes())
    expect(camera.frustum.intersectsBoundingBox(movedBoundingBox)).to.equal(true)
    expect(camera.frustum.intersectsBoundingBox(originalBoundingBox)).to.equal(false)
    expect(borrowedObjects.size).to.equal(0)
  })
})
