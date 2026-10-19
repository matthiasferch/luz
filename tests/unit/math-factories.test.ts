import { expect } from 'chai'
import { Transform } from '@luz/core'
import { Matrix2, Matrix3, Matrix4, Quaternion, Vector2, Vector3, Vector4 } from '@luz/math'

describe('Owned math values', () => {
  function verifyFactory<Value extends Float32Array>(name: string, createValue: (destination?: Value) => Value): void {
    it(`${name} returns independent values and reuses explicit destinations`, () => {
      const firstValue = createValue()
      const secondValue = createValue()
      const expected = Array.from(firstValue)
      const buffer = firstValue.buffer

      expect(firstValue).not.to.equal(secondValue)
      expect(firstValue.buffer).not.to.equal(secondValue.buffer)
      firstValue.fill(42)
      expect(Array.from(secondValue)).to.deep.equal(expected)
      expect(Array.from(createValue())).to.deep.equal(expected)
      expect(createValue(firstValue)).to.equal(firstValue)
      expect(firstValue.buffer).to.equal(buffer)
      expect(Array.from(firstValue)).to.deep.equal(expected)
    })
  }

  verifyFactory('Vector2.zero', Vector2.createZero)
  verifyFactory('Vector2.one', Vector2.createOne)
  verifyFactory('Vector2.right', Vector2.createRight)
  verifyFactory('Vector2.up', Vector2.createUp)
  verifyFactory('Vector2.infinity', Vector2.createInfinity)
  verifyFactory('Vector3.zero', Vector3.createZero)
  verifyFactory('Vector3.one', Vector3.createOne)
  verifyFactory('Vector3.grey', Vector3.createGrey)
  verifyFactory('Vector3.right', Vector3.createRight)
  verifyFactory('Vector3.left', Vector3.createLeft)
  verifyFactory('Vector3.up', Vector3.createUp)
  verifyFactory('Vector3.down', Vector3.createDown)
  verifyFactory('Vector3.forward', Vector3.createForward)
  verifyFactory('Vector3.backward', Vector3.createBackward)
  verifyFactory('Vector3.infinity', Vector3.createInfinity)
  verifyFactory('Vector4.zero', Vector4.createZero)
  verifyFactory('Vector4.one', Vector4.createOne)
  verifyFactory('Quaternion.identity', Quaternion.createIdentity)
  verifyFactory('Matrix2.identity', Matrix2.createIdentity)
  verifyFactory('Matrix3.identity', Matrix3.createIdentity)
  verifyFactory('Matrix4.identity', Matrix4.createIdentity)
  it('creates and resets independent axes without replacing existing vectors', () => {
    const axes = Vector3.createAxes()
    const firstAxis = axes[0]
    const up = Vector3.createUp()

    axes[1].fill(12)
    expect(Array.from(up)).to.deep.equal([0, 1, 0])
    expect(Array.from(Vector3.createAxes()[1])).to.deep.equal([0, 1, 0])
    expect(Vector3.createAxes(axes)).to.equal(axes)
    expect(axes[0]).to.equal(firstAxis)
    expect(axes.map((axis) => Array.from(axis))).to.deep.equal([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ])

    const planarAxes = Vector2.createAxes()
    const planarAxis = planarAxes[1]

    planarAxes[0].fill(9)
    expect(Vector2.createAxes(planarAxes)).to.equal(planarAxes)
    expect(planarAxes[1]).to.equal(planarAxis)
    expect(planarAxes.map((axis) => Array.from(axis))).to.deep.equal([
      [1, 0],
      [0, 1]
    ])
  })
  it('creates independent origin transforms and copies constructor inputs', () => {
    const origin = Transform.createOrigin()
    const otherOrigin = Transform.createOrigin()
    const translation = new Vector3([1, 2, 3])
    const transform = new Transform({ translation })

    origin.translation.x = 10
    origin.parent = transform

    origin.updateTransform()

    translation.x = 50

    expect(Array.from(otherOrigin.translation)).to.deep.equal([0, 0, 0])
    expect(otherOrigin.parent).to.equal(undefined)
    expect(otherOrigin.modelMatrix.equals(Matrix4.createIdentity())).to.equal(true)
    expect(Array.from(transform.translation)).to.deep.equal([1, 2, 3])

    for (const constructor of [Vector2, Vector3, Vector4, Quaternion, Matrix2, Matrix3, Matrix4, Transform]) {
      expect(constructor).not.to.have.any.keys('zero', 'one', 'identity', 'axes', 'origin')
    }
  })
})
