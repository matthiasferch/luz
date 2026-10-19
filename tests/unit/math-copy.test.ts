import { expect } from 'chai'
import { Matrix2, Matrix3, Matrix4, Quaternion, Vector2, Vector3, Vector4 } from '@luz/math'

interface CopyValue<Value> extends Float32Array {
  copyTo(destination: Value): Value
  copyFrom(source: Value): Value
  clone(): Value
}

describe('Math copy contracts', () => {
  function verifyCopyContract<Value extends CopyValue<Value>>(Constructor: new () => Value): void {
    it(`${Constructor.name} copies in the named direction and clones owned storage`, () => {
      const source = new Constructor()
      const destination = new Constructor()

      source.fill(3)
      destination.fill(7)

      const sourceValues = Array.from(source)
      const sourceBuffer = source.buffer
      const destinationBuffer = destination.buffer

      expect(source.copyTo(destination)).to.equal(destination)
      expect(Array.from(source)).to.deep.equal(sourceValues)
      expect(Array.from(destination)).to.deep.equal(sourceValues)
      expect(destination.buffer).to.equal(destinationBuffer)
      destination.fill(9)
      expect(source.copyFrom(destination)).to.equal(source)
      expect(Array.from(source)).to.deep.equal(Array.from(destination))
      expect(source.buffer).to.equal(sourceBuffer)
      expect(source.copyFrom(source)).to.equal(source)
      expect(source.copyTo(source)).to.equal(source)

      const clone = source.clone()

      expect(clone).to.be.instanceOf(Constructor)
      expect(clone.buffer).not.to.equal(source.buffer)
      expect(Array.from(clone)).to.deep.equal(Array.from(source))

      clone[0] = 0

      expect(source[0]).to.equal(9)
      expect(source).not.to.have.property('copy')
    })
  }

  verifyCopyContract(Vector2)
  verifyCopyContract(Vector3)
  verifyCopyContract(Vector4)
  verifyCopyContract(Quaternion)
  verifyCopyContract(Matrix2)
  verifyCopyContract(Matrix3)
  verifyCopyContract(Matrix4)
  it('keeps allocation and mutation semantics when destinations are omitted', () => {
    const source = new Vector3([1, 2, 3])
    const result = Vector3.add(source, source, undefined)

    expect(result).not.to.equal(source)
    expect(Array.from(source)).to.deep.equal([1, 2, 3])
    expect(Array.from(result)).to.deep.equal([2, 4, 6])
    expect(source.add(result, undefined)).to.equal(source)
    expect(Array.from(source)).to.deep.equal([3, 6, 9])

    const translation = new Vector3()
    const rotation = new Matrix3()

    expect(() => new Matrix4().decompose(translation, rotation)).not.to.throw()
  })
})
