import { expect } from 'chai'
import { Entity } from '@luz/core'
import { Quaternion, Vector3 } from '@luz/math'
import { Body, Cuboid } from '@luz/physics'
import { Pool } from '@luz/serialization'

const createBody = () => {
  const body = new Body({ mass: 2 })
  const entity = new Entity()

  body.volume = new Cuboid({ origin: new Vector3([0.3, -0.4, 0.2]), extents: new Vector3([1, 2, 3]) })

  entity.translation.set([1, 2, 3])
  Quaternion.setFromEulerAngles(0.4, -0.2, 0.7, entity.rotation)
  body.applyTransform(entity)

  return { body, entity }
}

describe('Body pooling', () => {
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
  it('reuses scratch objects across bodies without pooling persistent motion or inertia', () => {
    const bodies = Array.from({ length: 16 }, createBody)
    const impulse = new Vector3([0.2, 0.5, -0.1])
    const contactPoint = new Vector3([1.4, 2, 3.6])
    const correction = Quaternion.setFromAxisAngle(Vector3.createUp(), 0.1)
    const inputSnapshot = [[...impulse], [...contactPoint], [...correction]]
    const advanceBody = ({ body, entity }: ReturnType<typeof createBody>) => {
      body.force.set([0, -19.6, 0])
      body.torque.set([0.4, 0.2, -0.1])
      body.applyImpulse(impulse, contactPoint)
      body.applyRotationCorrection(correction)
      body.update(entity, 1 / 60)
      expect(borrowedObjects.size).to.equal(0)
    }

    advanceBody(bodies[0])

    const objectCount = acquiredObjects.size

    expect(objectCount).to.be.greaterThan(0)
    expect([...acquiredObjects].some((object) => object instanceof Quaternion)).to.equal(true)

    for (let frame = 0; frame < 8; frame++) {
      for (const body of bodies) {
        advanceBody(body)
      }
    }

    expect(acquiredObjects.size).to.equal(objectCount)
    expect([[...impulse], [...contactPoint], [...correction]]).to.deep.equal(inputSnapshot)

    for (const { body, entity } of bodies) {
      for (const object of [
        body.force,
        body.torque,
        body.linearVelocity,
        body.angularVelocity,
        body.angularCorrection,
        body.volume.center,
        body.volume.inverseInertia,
        entity.translation,
        entity.rotation,
        ...(body.volume as Cuboid).axes
      ]) {
        expect(acquiredObjects.has(object)).to.equal(false)
        expect([...object].every(Number.isFinite)).to.equal(true)
      }
    }
  })
  it('keeps local points owned across later queries, corrections and integration', () => {
    const { body, entity } = createBody()
    const point = new Vector3([2, 4, 6])
    const localPoint = body.convertToLocalPoint(point)
    const snapshot = [...localPoint]
    const reconstructedPoint = entity.rotation.transformVector3(localPoint).add(body.volume.center)

    expect(Vector3.subtract(reconstructedPoint, point).magnitude).to.be.lessThan(1e-5)
    expect(acquiredObjects.has(localPoint)).to.equal(false)

    for (let frame = 0; frame < 16; frame++) {
      body.applyRotationCorrection(Quaternion.setFromAxisAngle(Vector3.createRight(), 0.1))
      body.angularVelocity.set([0.1, 0.2, 0.3])
      body.update(entity, 1 / 60)
      body.convertToLocalPoint(Vector3.createZero())
      expect([...localPoint]).to.deep.equal(snapshot)
      expect(borrowedObjects.size).to.equal(0)
    }

    const unboundBody = new Body()

    unboundBody.volume = new Cuboid()

    const unboundPoint = unboundBody.convertToLocalPoint(point)

    expect(unboundPoint).not.to.equal(point)
    expect([...unboundPoint]).to.deep.equal([...point])
  })
  it('owns queued kinematic poses through input mutations and reuse by another body', () => {
    const targetBody = createBody()
    const otherBody = createBody()
    const translation = new Vector3([5, 6, 7])
    const rotation = Quaternion.setFromEulerAngles(0.7, 0.3, -0.2)
    const expectedTranslation = [...translation]
    const expectedRotation = [...rotation]

    targetBody.body.motionType = 'kinematic'
    otherBody.body.motionType = 'kinematic'

    targetBody.body.setKinematicTarget(translation, rotation, 1 / 60)
    translation.reset()
    rotation.reset()
    otherBody.body.setKinematicTarget(Vector3.createLeft(), Quaternion.createIdentity(), 1 / 60)
    otherBody.body.update(otherBody.entity, 1 / 60)
    otherBody.body.update(otherBody.entity, 1 / 60)
    expect(borrowedObjects.size).to.equal(0)
    targetBody.body.update(targetBody.entity, 1 / 60)
    expect([...targetBody.entity.translation]).to.deep.equal(expectedTranslation)
    expect([...targetBody.entity.rotation]).to.deep.equal(expectedRotation)
    expect(acquiredObjects.has(targetBody.entity.translation)).to.equal(false)
    expect(acquiredObjects.has(targetBody.entity.rotation)).to.equal(false)
    expect(borrowedObjects.size).to.equal(0)
  })
  it('avoids borrowing scratch objects for sleeping and static updates', () => {
    const { body, entity } = createBody()

    acquiredObjects.clear()
    body.sleep()
    body.update(entity, 1 / 60)
    expect(body.isSleeping).to.equal(true)

    body.motionType = 'static'

    body.update(entity, 1 / 60)
    body.applyImpulse(Vector3.createUp())
    expect(acquiredObjects.size).to.equal(0)
    expect(borrowedObjects.size).to.equal(0)
  })
  it('releases vectors and quaternions when integration or correction throws', () => {
    const { body, entity } = createBody()
    const applyTransform = body.volume.applyTransform

    body.angularVelocity.set([1, 2, 3])

    body.volume.applyTransform = (transform) => {
      if ([...borrowedObjects].some((object) => object instanceof Quaternion)) {
        throw new Error('rotation failed')
      }

      applyTransform.call(body.volume, transform)
    }

    expect(() => body.update(entity, 1 / 60)).to.throw('rotation failed')
    expect(borrowedObjects.size).to.equal(0)
    expect(() => body.applyRotationCorrection(Quaternion.createIdentity())).to.throw('rotation failed')
    expect(borrowedObjects.size).to.equal(0)

    body.volume.applyTransform = applyTransform

    body.update(entity, 1 / 60)
    expect(borrowedObjects.size).to.equal(0)
  })
  it('releases partially calculated inertia axes when their transformation throws', () => {
    const { body, entity } = createBody()
    const transformVector = entity.rotation.transformVector3

    let axisCount = 0

    entity.rotation.transformVector3 = function (vector, destination) {
      axisCount++

      if (axisCount === 2) {
        throw new Error('inertia axis failed')
      }

      return transformVector.call(this, vector, destination)
    }

    expect(() => body.volume.calculateInverseInertia(body.mass, entity)).to.throw('inertia axis failed')
    expect(borrowedObjects.size).to.equal(0)

    entity.rotation.transformVector3 = transformVector

    body.volume.calculateInverseInertia(body.mass, entity)
    expect(borrowedObjects.size).to.equal(0)
  })
  it('keeps the outer center intact when another body rotates inside a volume callback', () => {
    const outerBody = createBody()
    const nestedBody = createBody()
    const correction = Quaternion.setFromAxisAngle(Vector3.createForward(), 0.3)
    const center = outerBody.body.volume.center.clone()
    const applyTransform = outerBody.body.volume.applyTransform

    let hasNestedCorrection = false

    outerBody.body.volume.applyTransform = (transform) => {
      if (!hasNestedCorrection) {
        const outerObjects = new Set(borrowedObjects)

        hasNestedCorrection = true

        nestedBody.body.applyRotationCorrection(correction)
        expect(borrowedObjects).to.deep.equal(outerObjects)
      }

      applyTransform.call(outerBody.body.volume, transform)
    }

    outerBody.body.applyRotationCorrection(correction)
    expect(borrowedObjects.size).to.equal(0)
    expect(Vector3.subtract(outerBody.body.volume.center, center).magnitude).to.be.lessThan(1e-5)
    expect([...outerBody.entity.rotation]).to.deep.equal([...nestedBody.entity.rotation])
    expect([...outerBody.entity.translation]).to.deep.equal([...nestedBody.entity.translation])
    expect([...outerBody.body.volume.inverseInertia]).to.deep.equal([...nestedBody.body.volume.inverseInertia])
  })
})
