import { expect } from 'chai'
import { Quaternion, Vector3 } from '@luz/math'

const transformWithQuaternionProducts = (rotation: Quaternion, vector: Vector3): Vector3 => {
  const vectorQuaternion = new Quaternion([...vector, 0])
  const inverseRotation = rotation.clone().invert()
  const transformedQuaternion = Quaternion.multiply(rotation, vectorQuaternion).multiply(inverseRotation)

  return new Vector3([transformedQuaternion.x, transformedQuaternion.y, transformedQuaternion.z])
}

describe('Quaternion vector transformation', () => {
  it('rotates around each coordinate axis for unit and scaled quaternions', () => {
    const cases = [
      { axis: Vector3.createRight(), vector: Vector3.createUp(), expectedVector: Vector3.createForward() },
      { axis: Vector3.createUp(), vector: Vector3.createForward(), expectedVector: Vector3.createRight() },
      { axis: Vector3.createForward(), vector: Vector3.createRight(), expectedVector: Vector3.createUp() }
    ]

    for (const { axis, vector, expectedVector } of cases) {
      for (const scale of [1, 3, -2, 0.001]) {
        const rotation = Quaternion.setFromAxisAngle(axis, Math.PI / 2)

        rotation.set(Array.from(rotation, (value) => value * scale))

        const transformedVector = rotation.transformVector3(vector)

        expect(Vector3.subtract(transformedVector, expectedVector).magnitude).to.be.lessThan(1e-6)
        expect(transformedVector.magnitude).to.be.closeTo(vector.magnitude, 1e-6)
      }
    }
  })
  it('preserves Float32 rounding from quaternion multiplication and inversion', () => {
    for (let index = 0; index < 256; index++) {
      const rotation = new Quaternion([
        Math.sin(index),
        Math.cos(index * 1.3),
        Math.sin(index * 2.3),
        Math.cos(index * 0.7)
      ])
      const vector = new Vector3([Math.cos(index) * 20, Math.sin(index * 1.7) * 50, Math.cos(index * 0.4) * 100])
      const expectedVector = transformWithQuaternionProducts(rotation, vector)

      expect([...rotation.transformVector3(vector)]).to.deep.equal([...expectedVector])
      rotation.transformVector3(vector, vector)
      expect([...vector]).to.deep.equal([...expectedVector])
    }
  })
  it('preserves extreme finite quaternion behavior', () => {
    const values = [1e-30, 1e30]
    const vector = new Vector3([1, -2, 3])

    for (const value of values) {
      const rotation = new Quaternion([value, -value, value, value])
      const expectedVector = transformWithQuaternionProducts(rotation, vector)
      const transformedVector = rotation.transformVector3(vector)

      for (let index = 0; index < 3; index++) {
        expect(Object.is(transformedVector[index], expectedVector[index])).to.equal(true)
      }
    }
  })
  it('keeps default results independently owned and leaves inputs unchanged', () => {
    const rotation = Quaternion.setFromEulerAngles(0.7, -0.4, 0.2)
    const vector = new Vector3([1, 2, 3])
    const rotationSnapshot = [...rotation]
    const vectorSnapshot = [...vector]
    const transformedVector = rotation.transformVector3(vector)
    const resultSnapshot = [...transformedVector]
    const otherResult = rotation.transformVector3(Vector3.createLeft())

    otherResult.reset()
    expect(transformedVector).not.to.equal(vector)
    expect(transformedVector).not.to.equal(otherResult)
    expect([...transformedVector]).to.deep.equal(resultSnapshot)
    expect([...rotation]).to.deep.equal(rotationSnapshot)
    expect([...vector]).to.deep.equal(vectorSnapshot)
  })
  it('supports a reusable destination and transforming a vector in place', () => {
    const rotation = Quaternion.setFromEulerAngles(0.7, -0.4, 0.2)
    const vector = new Vector3([1, 2, 3])
    const destination = new Vector3([NaN, NaN, NaN])
    const expectedVector = transformWithQuaternionProducts(rotation, vector)

    expect(rotation.transformVector3(vector, destination)).to.equal(destination)
    expect([...destination]).to.deep.equal([...expectedVector])
    expect(rotation.transformVector3(vector, vector)).to.equal(vector)
    expect([...vector]).to.deep.equal([...expectedVector])
    expect(rotation.transformVector3(Vector3.createZero(), destination)).to.equal(destination)
    expect([...destination]).to.deep.equal([0, 0, 0])
  })
})
