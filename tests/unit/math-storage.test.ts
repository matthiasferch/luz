import { expect } from 'chai'
import { Matrix2, Matrix3, Matrix4, Quaternion, Vector2, Vector3, Vector4 } from '@luz/math'

describe('Math typed-array storage', () => {
  for (const Value of [Vector2, Vector3, Vector4, Quaternion, Matrix2, Matrix3, Matrix4]) {
    it(`preserves native array operations on ${Value.name}`, () => {
      const value = new Value()
      const components = Array.from(value)
      const mapped = value.map((component) => component + 1)
      const filtered = value.filter((component) => component !== 0)
      const sliced = value.slice(0, 1)
      const view = value.subarray(0, 1)

      expect(value.length).to.equal(components.length)
      expect(mapped.constructor).to.equal(Float32Array)
      expect([...mapped]).to.deep.equal(components.map((component) => component + 1))
      expect([...filtered]).to.deep.equal(components.filter((component) => component !== 0))
      expect(sliced.constructor).to.equal(Float32Array)
      expect(view.constructor).to.equal(Float32Array)
      expect(view.length).to.equal(1)
      expect(view.buffer).to.equal(value.buffer)
      expect(sliced.buffer).not.to.equal(value.buffer)

      view[0] = 9

      expect(value[0]).to.equal(9)
      expect(sliced[0]).to.equal(components[0])
    })
    it(`validates ${Value.name} construction and factories`, () => {
      const value = new Value()
      const components = Array.from(value)
      const typedComponents = new Float32Array(components)
      const mapped = Value.from(components, (component) => component + 1)

      expect([...new Value(typedComponents)]).to.deep.equal(components)
      expect(Value.from(components)).to.be.instanceOf(Value)
      expect([...Value.of(...components)]).to.deep.equal(components)
      expect([...mapped]).to.deep.equal(components.map((component) => component + 1))
      expect(() => new Value([1])).to.throw(RangeError)
      expect(() => new Value([...components, 0])).to.throw(RangeError)
      expect(() => Value.from([1])).to.throw(RangeError)
      expect(() => Value.of(1)).to.throw(RangeError)
    })
  }

  it('accepts mapped iterable factories', () => {
    expect([...Vector3.from(new Set(['1', '2', '3']), Number)]).to.deep.equal([1, 2, 3])
  })
  it('separates vector and quaternion magnitude from component count', () => {
    for (const vector of [
      new Vector2([3, 4]),
      new Vector3([3, 4, 0]),
      new Vector4([3, 4, 0, 0]),
      new Quaternion([3, 4, 0, 0])
    ]) {
      expect(vector.magnitude).to.equal(5)
      expect(vector.squaredMagnitude).to.equal(25)
      expect(vector.length).to.equal([...vector].length)
    }
  })
})
