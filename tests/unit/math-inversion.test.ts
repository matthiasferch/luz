import { expect } from 'chai'
import { Matrix2, Matrix3, Matrix4, Quaternion, Vector2, Vector3 } from '@luz/math'

interface InvertibleMatrix<T> extends Float32Array {
  invert(destination?: T): T
  tryInvert(destination?: T): boolean
}

interface MatrixConstructor<T> {
  new (): T
  readonly name: string
}

function testMatrix<T extends InvertibleMatrix<T>>(Matrix: MatrixConstructor<T>): void {
  it(`rejects singular and unrepresentable ${Matrix.name} inverses without writing`, () => {
    const matrix = new Matrix()
    const destination = new Matrix()
    const snapshot = [...destination]

    for (const value of [0, NaN, Infinity, 1e-45]) {
      matrix.fill(0)

      for (let index = 0; index < matrix.length; index += Math.sqrt(matrix.length) + 1) {
        matrix[index] = value
      }

      expect(matrix.tryInvert(destination)).to.equal(false)
      expect([...destination]).to.deep.equal(snapshot)
      expect(() => matrix.invert(destination)).to.throw(RangeError)
      expect([...destination]).to.deep.equal(snapshot)

      const sourceSnapshot = [...matrix]

      expect(matrix.tryInvert()).to.equal(false)
      expect([...matrix]).to.deep.equal(sourceSnapshot)
    }
  })
  it(`inverts ${Matrix.name} at different scales and in place`, () => {
    for (const scale of [1e-12, 1, 1e12]) {
      const matrix = new Matrix()
      const destination = new Matrix()
      const components = [...matrix].map((value) => value * scale)

      matrix.set(components)
      expect(matrix.tryInvert(destination)).to.equal(true)
      expect([...matrix]).to.deep.equal(components.map(Math.fround))
      expect(matrix.invert()).to.equal(matrix)
      expect([...matrix]).to.deep.equal([...destination])

      for (let index = 0; index < matrix.length; index++) {
        if (components[index] !== 0) {
          expect(matrix[index] * scale).to.be.closeTo(1, 1e-6)
        } else {
          expect(matrix[index]).to.equal(0)
        }
      }
    }
  })
}

describe('Math inversion contracts', () => {
  testMatrix<Matrix2>(Matrix2)
  testMatrix<Matrix3>(Matrix3)
  testMatrix<Matrix4>(Matrix4)
  it('rejects invalid quaternions and leaves the destination unchanged', () => {
    const destination = new Quaternion()

    for (const value of [0, Infinity, NaN, 1e-45]) {
      const rotation = new Quaternion([value, 0, 0, 0])

      expect(rotation.tryInvert(destination)).to.equal(false)
      expect(() => rotation.invert(destination)).to.throw(RangeError)
      expect([...destination]).to.deep.equal([0, 0, 0, 1])
    }

    const rotation = Quaternion.setFromAxisAngle(Vector3.createUp(), 0.6)
    const inverseRotation = rotation.clone().invert()

    expect(rotation.multiply(inverseRotation).equals(Quaternion.createIdentity())).to.equal(true)
  })
  it('returns the signed scalar cross product in two dimensions', () => {
    const firstVector = new Vector2([2, 3])
    const secondVector = new Vector2([5, 7])

    expect(Vector2.calculateCrossProduct(firstVector, secondVector)).to.equal(-1)
    expect(Vector2.calculateCrossProduct(secondVector, firstVector)).to.equal(1)
    expect(Vector2.calculateCrossProduct(firstVector, firstVector)).to.equal(0)
  })
  it('creates a camera world transform with look-at helpers', () => {
    const eye = new Vector3([2, 3, 4])
    const target = new Vector3([2, 3, 3])
    const transform = Matrix4.createLookAtTransform(eye, target)
    const rotation = Matrix3.createLookAtRotation(eye, target)

    expect([...transform].slice(12, 15)).to.deep.equal([...eye])
    expect([...rotation]).to.deep.equal([...Matrix3.createIdentity()])
  })
})
