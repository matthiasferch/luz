import { expect } from 'chai'
import { rejects } from 'node:assert/strict'
import { Matrix2, Matrix3, Matrix4, Quaternion, Vector2, Vector3, Vector4 } from '@luz/math'
import { Entity } from '@luz/core'
import { Serialize } from '@luz/serialization'

describe('Math document decoding', () => {
  for (const [MathClass, componentCount] of [
    [Vector2, 2],
    [Vector3, 3],
    [Vector4, 4],
    [Quaternion, 4],
    [Matrix2, 4],
    [Matrix3, 9],
    [Matrix4, 16]
  ] as const) {
    it(`requires fixed finite Float32 components for ${MathClass.name}`, async () => {
      const definition = Array.from({ length: componentCount }, (_, index) => index + 0.25)
      const value = await MathClass.deserialize(definition)

      expect(Array.from(value)).to.deep.equal(definition)
      expect(value.serialize()).to.deep.equal(definition)

      for (const invalidDefinition of [
        null,
        {},
        '1,2,3',
        definition.slice(1),
        [...definition, 1],
        definition.map(() => NaN),
        definition.map(() => Infinity),
        definition.map(() => 1e100),
        definition.map(() => '1')
      ]) {
        await rejects(MathClass.deserialize(invalidDefinition), /finite Float32 components/)
      }
    })
  }

  it('validates math fields when decoding registered components', async () => {
    await rejects(
      Entity.deserialize({ components: { view: { type: 'camera', clipPlanes: [1] } } }),
      /Vector2 requires 2/
    )

    await rejects(
      Entity.deserialize({ components: { light: { type: 'light', lightType: 'point', color: [1, 1, 'bad'] } } }),
      /Vector3 requires 3/
    )
  })
  it('rejects invalid collection deserializers at declaration time', () => {
    expect(() => {
      // @ts-expect-error Collection metadata requires a deserializable class.
      Serialize({ deserialize: async () => ({}) })
    }).to.throw(TypeError, 'class with a deserialize method')
    expect(() => {
      // @ts-expect-error Primitive constructors have no class decoder.
      Serialize(Number)
    }).to.throw(TypeError, 'class with a deserialize method')
  })
})
