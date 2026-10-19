require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { afterEach, beforeEach, describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { BoundingBox, Camera, Light, Transform } = require('@luz/core')
const { Matrix4, Vector3 } = require('@luz/math')
const { Pool } = require('@luz/serialization')
const { Culling } = require('@luz/graphics')
const {
  calculateBoundingBoxNormalizedDeviceCoordinateRectangle,
  calculateFrustumNormalizedDeviceCoordinateRectangle
} = require('@luz/graphics')

const createFixture = (position = [0, 0, 0]) => {
  const camera = new Camera()
  const light = new Light()

  Matrix4.createPerspective(90, 1, 1, 10, camera.projectionMatrix)

  light.shadowCamera.frustum.fieldOfView = (2 * Math.atan(0.5) * 180) / Math.PI

  light.shadowCamera.frustum.clipPlanes.set([1, 4])
  light.shadowCamera.frustum.applyTransform(new Transform({ translation: new Vector3(position) }))

  return { camera, light, frustum: light.shadowCamera.frustum }
}

describe('Projected bounds pooling', () => {
  const acquireObject = Pool.prototype.acquire
  const releaseObject = Pool.prototype.release
  const acquiredBuffers = new Set()
  const borrowedObjects = new Set()

  beforeEach(() => {
    acquiredBuffers.clear()
    borrowedObjects.clear()

    Pool.prototype.acquire = function () {
      const object = acquireObject.call(this)

      assert.equal(borrowedObjects.has(object), false)
      borrowedObjects.add(object)

      if (object.viewProjection) {
        acquiredBuffers.add(object)
      }

      return object
    }
    Pool.prototype.release = function (object) {
      assert.equal(borrowedObjects.delete(object), true)
      releaseObject.call(this, object)
    }
  })
  afterEach(() => {
    Pool.prototype.acquire = acquireObject
    Pool.prototype.release = releaseObject
  })
  it('preserves finite scissors, near-plane clipping, viewport clamps and hidden lights', () => {
    const { camera, light, frustum } = createFixture()

    assert.deepEqual(calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera), {
      minimumX: -0.5,
      minimumY: -0.5,
      maximumX: 0.5,
      maximumY: 0.5
    })
    assert.deepEqual(Culling.computeLightScissor(light, camera, 200, 100, 2), {
      x: 48,
      y: 23,
      width: 104,
      height: 54
    })
    frustum.applyTransform(new Transform({ translation: new Vector3([0, 0, 2]) }))

    const clippedRectangle = calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera)

    assert.ok(Math.abs(clippedRectangle.minimumX + 1.5) < 1e-6)
    assert.ok(Math.abs(clippedRectangle.maximumX - 1.5) < 1e-6)
    assert.deepEqual(Culling.computeLightScissor(light, camera, 200, 100, 2), {
      x: 0,
      y: 0,
      width: 200,
      height: 100
    })
    frustum.applyTransform(new Transform({ translation: new Vector3([100, 0, 0]) }))
    assert.ok(calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera))
    assert.equal(Culling.computeLightScissor(light, camera, 200, 100), null)
    frustum.applyTransform(new Transform({ translation: new Vector3([0, 0, 10]) }))
    assert.equal(calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera), null)
    assert.equal(Culling.computeLightScissor(light, camera, 200, 100), null)
    assert.equal(borrowedObjects.size, 0)
  })
  it('projects boxes through the near plane and refreshes reused corners for different bounds', () => {
    const { camera } = createFixture()
    const boundingBox = new BoundingBox([new Vector3([-1, -1, -3]), new Vector3([1, 1, -2])])
    const snapshot = [boundingBox.minimum.clone(), boundingBox.maximum.clone()]
    const projectedRectangle = calculateBoundingBoxNormalizedDeviceCoordinateRectangle(
      boundingBox,
      camera.projectionMatrix
    )

    assert.deepEqual(projectedRectangle, { minimumX: -0.5, minimumY: -0.5, maximumX: 0.5, maximumY: 0.5 })

    boundingBox.maximum.z = 0

    const clippedRectangle = calculateBoundingBoxNormalizedDeviceCoordinateRectangle(
      boundingBox,
      camera.projectionMatrix
    )

    assert.ok(Math.abs(clippedRectangle.minimumX + 1) < 1e-6)
    assert.ok(Math.abs(clippedRectangle.maximumX - 1) < 1e-6)
    boundingBox.minimum.set([-2, -2, 1])
    boundingBox.maximum.set([2, 2, 3])
    assert.equal(calculateBoundingBoxNormalizedDeviceCoordinateRectangle(boundingBox, camera.projectionMatrix), null)
    boundingBox.minimum.set(snapshot[0])
    boundingBox.maximum.set(snapshot[1])
    assert.deepEqual(
      calculateBoundingBoxNormalizedDeviceCoordinateRectangle(boundingBox, camera.projectionMatrix),
      projectedRectangle
    )
    assert.deepEqual([boundingBox.minimum, boundingBox.maximum], snapshot)
    assert.equal(acquiredBuffers.size, 1)
    assert.equal(borrowedObjects.size, 0)
  })
  it('reuses projection buffers while retaining owned results and untouched inputs', () => {
    const { frustum, camera } = createFixture()
    const cameraMatrices = [camera.viewMatrix.clone(), camera.projectionMatrix.clone()]
    const originalVertices = frustum.calculateVertices()
    const rectangle = calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera)
    const snapshot = { ...rectangle }

    assert.equal(acquiredBuffers.size, 1)

    for (let iteration = 0; iteration < 20; iteration++) {
      const repeatedRectangle = calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera)

      assert.deepEqual(repeatedRectangle, snapshot)
      assert.notEqual(repeatedRectangle, rectangle)
      assert.equal(acquiredBuffers.size, 1)
      assert.equal(borrowedObjects.size, 0)

      repeatedRectangle.minimumX = -999

      assert.deepEqual(rectangle, snapshot)
    }

    assert.deepEqual([camera.viewMatrix, camera.projectionMatrix], cameraMatrices)
    assert.deepEqual(frustum.calculateVertices(), originalVertices)

    frustum.calculateVertices = () => originalVertices

    assert.deepEqual(calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera), snapshot)
    assert.deepEqual(originalVertices, createFixture().frustum.calculateVertices())
    assert.equal(borrowedObjects.size, 0)
  })
  it('overwrites stale projection values after degenerate and nonfinite camera matrices', () => {
    const { frustum, camera } = createFixture([0, 0, 2])
    const expectedRectangle = calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera)
    const projectionMatrix = camera.projectionMatrix.clone()

    camera.projectionMatrix.fill(0)
    assert.equal(calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera), null)

    for (const invalidValue of [NaN, Infinity]) {
      camera.projectionMatrix.set(projectionMatrix)

      camera.projectionMatrix[0] = invalidValue

      assert.equal(calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera), null)
      assert.equal(borrowedObjects.size, 0)
    }

    camera.projectionMatrix.set(projectionMatrix)
    assert.deepEqual(calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera), expectedRectangle)
    assert.equal(acquiredBuffers.size, 1)
    assert.equal(borrowedObjects.size, 0)
  })
  it('releases partially filled buffers on exceptions and recovers on the next projection', () => {
    const { frustum, camera } = createFixture()
    const calculateVertices = frustum.calculateVertices
    const expectedRectangle = calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera)

    frustum.calculateVertices = (destination) => {
      assert.ok(borrowedObjects.size > 0)
      destination[0].set([99, 99, 99])

      throw new Error('frustum vertices failed')
    }

    for (let iteration = 0; iteration < 3; iteration++) {
      assert.throws(
        () => calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera),
        /frustum vertices failed/
      )
      assert.equal(borrowedObjects.size, 0)
    }

    frustum.calculateVertices = calculateVertices

    assert.deepEqual(calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera), expectedRectangle)
    assert.equal(acquiredBuffers.size, 1)
    assert.equal(borrowedObjects.size, 0)
  })
  it('isolates nested projections using different cameras and frustums', () => {
    const { frustum, camera } = createFixture()
    const nestedFixture = createFixture([0.5, 0.25, 2])

    Matrix4.createPerspective(60, 1.5, 0.5, 20, nestedFixture.camera.projectionMatrix)

    const expectedRectangle = calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera)
    const expectedNestedRectangle = calculateFrustumNormalizedDeviceCoordinateRectangle(
      nestedFixture.frustum,
      nestedFixture.camera
    )
    const calculateVertices = frustum.calculateVertices

    let hasNestedCall = false

    frustum.calculateVertices = (destination) => {
      const outerObjects = new Set(borrowedObjects)
      const outerBuffer = [...outerObjects].find((object) => object.viewProjection)
      const matrixSnapshot = outerBuffer.viewProjection.clone()
      const vertexSnapshots = outerBuffer.vertices.map((vertex) => vertex.clone())

      assert.deepEqual(
        calculateFrustumNormalizedDeviceCoordinateRectangle(nestedFixture.frustum, nestedFixture.camera),
        expectedNestedRectangle
      )
      assert.deepEqual(borrowedObjects, outerObjects)
      assert.deepEqual(outerBuffer.viewProjection, matrixSnapshot)
      assert.deepEqual(outerBuffer.vertices, vertexSnapshots)

      hasNestedCall = true

      return calculateVertices.call(frustum, destination)
    }

    assert.deepEqual(calculateFrustumNormalizedDeviceCoordinateRectangle(frustum, camera), expectedRectangle)
    assert.equal(hasNestedCall, true)
    assert.equal(acquiredBuffers.size, 2)
    assert.equal(borrowedObjects.size, 0)
  })
})
