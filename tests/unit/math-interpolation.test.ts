import { expect } from 'chai'
import { Quaternion, Vector2, Vector3, Vector4 } from '@luz/math'

interface InterpolatedVector<T> extends Iterable<number> {
  x: number
  y: number
  fill(value: number): T
  normalize(destination: T): T
  interpolateClamped(secondVector: T, fraction: number): T
}

interface VectorConstructor<T> {
  new (): T
  name: string
  interpolateLinear(firstVector: T, secondVector: T, fraction: number, destination?: T): T
  interpolateClamped(firstVector: T, secondVector: T, fraction: number, destination?: T): T
}

function testVector<T extends InterpolatedVector<T>>(Vector: VectorConstructor<T>): void {
  it(`copies unit and zero ${Vector.name} normalization into its destination`, () => {
    const vector = new Vector()
    const destination = new Vector()

    vector.fill(0)

    vector.x = 1
    destination.y = 8

    expect(vector.normalize(destination)).to.equal(destination)
    expect([...destination]).to.deep.equal([...vector])
    vector.fill(0)
    expect(vector.normalize(destination)).to.equal(destination)
    expect([...destination]).to.deep.equal([...vector])
  })
  it(`interpolates ${Vector.name} with either input as destination`, () => {
    for (const destinationIndex of [0, 1, 2]) {
      const firstVector = new Vector()
      const secondVector = new Vector()
      const destination = [firstVector, secondVector, new Vector()][destinationIndex]

      firstVector.x = 2
      secondVector.x = 6

      expect(Vector.interpolateLinear(firstVector, secondVector, 0.25, destination)).to.equal(destination)
      expect(destination.x).to.equal(3)
    }

    const firstVector = new Vector()
    const secondVector = new Vector()

    secondVector.x = 4

    expect(Vector.interpolateLinear(firstVector, secondVector, 2).x).to.equal(8)
    expect(Vector.interpolateClamped(firstVector, secondVector, 2).x).to.equal(4)
    expect(Vector.interpolateClamped(firstVector, secondVector, -1).x).to.equal(0)
    expect(firstVector.interpolateClamped(secondVector, 0.5)).to.equal(firstVector)
    expect(firstVector.x).to.equal(2)
  })
}

describe('Math destinations and interpolation', () => {
  testVector<Vector2>(Vector2)
  testVector<Vector3>(Vector3)
  testVector<Vector4>(Vector4)
  it('reflects in place or into either input without corrupting the source', () => {
    for (const destinationIndex of [0, 1, 2]) {
      const vector = new Vector3([1, -1, 2])
      const normal = new Vector3([0, 1, 0])
      const destination = [vector, normal, new Vector3()][destinationIndex]

      expect(vector.reflect(normal, destination)).to.equal(destination)
      expect([...destination]).to.deep.equal([1, 1, 2])
    }
  })
  it('takes the shortest rotation path for antipodal quaternions', () => {
    const rotation = Quaternion.setFromAxisAngle(Vector3.createUp(), Math.PI / 3)
    const oppositeRotation = new Quaternion(Array.from(rotation, (value) => -value))

    for (const fraction of [-1, 0, 0.25, 0.5, 0.75, 1, 2]) {
      const result = Quaternion.interpolateSpherical(rotation, oppositeRotation, fraction)

      expect(Math.abs(Quaternion.calculateDotProduct(rotation, result))).to.be.closeTo(1, 1e-6)
      expect(Math.hypot(...result)).to.be.closeTo(1, 1e-6)
    }
  })
  it('normalizes spherical interpolation and supports either aliased input', () => {
    for (const destinationIndex of [0, 1, 2]) {
      const firstRotation = new Quaternion([0, 0, 0, 2])
      const secondRotation = new Quaternion([0, 3, 0, 0])
      const destination = [firstRotation, secondRotation, new Quaternion()][destinationIndex]

      expect(Quaternion.interpolateSpherical(firstRotation, secondRotation, 0.5, destination)).to.equal(destination)
      expect(destination.y).to.be.closeTo(Math.SQRT1_2, 1e-6)
      expect(destination.w).to.be.closeTo(Math.SQRT1_2, 1e-6)
    }

    const rotation = new Quaternion()

    expect(rotation.interpolateSpherical(new Quaternion([0, 1, 0, 0]), 0.5)).to.equal(rotation)
    expect(() => Quaternion.interpolateSpherical(new Quaternion([0, 0, 0, 0]), rotation, 0.5)).to.throw(RangeError)
    expect(() => Quaternion.interpolateSpherical(rotation, rotation, NaN)).to.throw(RangeError)
  })
})
