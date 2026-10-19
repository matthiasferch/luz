import { expect } from 'chai'
import { rejects } from 'node:assert/strict'
import { BoundingBox, Frustum, Light, Transform } from '@luz/core'
import { Quaternion, Vector3, Vector4 } from '@luz/math'
import { collectUniformProperties } from '@luz/serialization'

describe('Directional lights', () => {
  it('round-trips explicit light types and shadow dimensions without runtime camera state', async () => {
    const light = await Light.deserialize({
      type: 'light',
      lightType: 'directional',
      shadowSize: [30, 12],
      clipPlanes: [0.2, 80]
    })
    const serialized = light.serialize()

    expect(light.isDirectional).to.equal(true)
    expect(serialized.shadowSize).to.deep.equal([30, 12])
    expect(serialized).not.to.have.any.keys('shadowCamera', 'isDirectional', 'textureMatrix', 'boundingBox')
    expect((await Light.deserialize(serialized)).serialize()).to.deep.equal(serialized)
    expect(
      (await Light.deserialize({ type: 'light', lightType: 'spot', coneAngle: 90, coneFalloff: 10 })).isDirectional
    ).to.equal(false)
    expect(collectUniformProperties(Light).map(({ key }) => key)).to.include.members(['isDirectional', 'clipPlanes'])
  })
  it('rejects unsupported types and invalid shadow volumes', async () => {
    for (const lightType of [undefined, null, 'area', 'sun', 0, {}]) {
      await rejects(Light.deserialize({ type: 'light', lightType }), /lightType/)
    }

    for (const shadowSize of [[0, 2], [-1, 2], [NaN, 2], [Infinity, 2], [2], [2, 2, 2], ['2', 2], null]) {
      await rejects(Light.deserialize({ type: 'light', lightType: 'directional', shadowSize }), /shadowSize/)
    }

    for (const clipPlanes of [[0, 10], [10, 1], [1, 1], [1, Infinity], [1]]) {
      await rejects(Light.deserialize({ type: 'light', lightType: 'directional', clipPlanes }), /clipPlanes/)
    }
  })
  it('uses parallel shadow rays and maps orthographic corners to the shadow texture', () => {
    const light = new Light()
    const transform = new Transform({
      translation: new Vector3([2, 3, 4]),
      rotation: Quaternion.setFromEulerAngles(0.3, 0.7, -0.2)
    })

    light.lightType = 'directional'

    light.shadowSize.set([12, 8])
    light.clipPlanes.set([1, 25])
    transform.update(0)
    light.update(transform, 0)

    const vertices = light.shadowCamera.frustum.calculateVertices()

    expect(Vector3.subtract(vertices[0], vertices[2]).magnitude).to.be.closeTo(12, 1e-5)
    expect(Vector3.subtract(vertices[4], vertices[6]).magnitude).to.be.closeTo(12, 1e-5)
    expect(Vector3.subtract(vertices[0], vertices[1]).magnitude).to.be.closeTo(8, 1e-5)
    vertices.forEach((vertex, index) => {
      const projected = light.textureMatrix.transform(new Vector4([...vertex, 1]))

      expect(projected.w).to.be.closeTo(1, 1e-6)
      expect(Math.min(Math.abs(projected.x), Math.abs(projected.x - 1))).to.be.lessThan(1e-5)
      expect(Math.min(Math.abs(projected.y), Math.abs(projected.y - 1))).to.be.lessThan(1e-5)
      expect(projected.z).to.be.closeTo(index < 4 ? 0 : 1, 1e-5)
    })
  })
  it('ignores scale and translation for direction while moving its shadow coverage', () => {
    const light = new Light()
    const parent = new Transform({
      rotation: Quaternion.setFromEulerAngles(0.1, 0.3, -0.4),
      scale: new Vector3([-2, 3, 4])
    })
    const transform = new Transform({ rotation: Quaternion.setFromEulerAngles(-0.2, 0.4, 0.3) })

    light.lightType = 'directional'
    transform.parent = parent

    transform.refreshWorldTransform()
    light.update(transform, 0)

    const direction = Array.from(light.direction)
    const projection = Array.from(light.shadowCamera.projectionMatrix)
    const textureMatrix = Array.from(light.textureMatrix)

    transform.translation.set([100, -20, 30])
    transform.scale.set([8, 2, -5])
    transform.refreshWorldTransform()
    light.update(transform, 0)
    expect(Array.from(light.direction)).to.deep.equal(direction)
    expect(Array.from(light.shadowCamera.projectionMatrix)).to.deep.equal(projection)
    expect(Array.from(light.textureMatrix)).not.to.deep.equal(textureMatrix)
    expect(
      Vector3.subtract(
        light.shadowCamera.frustum.calculateVertices()[0],
        light.shadowCamera.frustum.calculateVertices()[1]
      ).magnitude
    ).to.be.closeTo(20, 1e-4)
    transform.rotation.set(Quaternion.createIdentity())
    transform.refreshWorldTransform()
    light.update(transform, 0)
    expect(Array.from(light.direction)).not.to.deep.equal(direction)
  })
  it('culls orthographic bounds on all six planes and invalidates cached dimensions', () => {
    const frustum = new Frustum()
    const createBoundingBox = (x: number, y: number, z: number) =>
      new BoundingBox([new Vector3([x - 0.1, y - 0.1, z - 0.1]), new Vector3([x + 0.1, y + 0.1, z + 0.1])])

    frustum.orthographicHeight = 8
    frustum.aspect = 1.5

    frustum.clipPlanes.set([1, 20])
    frustum.applyTransform(new Transform())
    expect(frustum.intersectsBoundingBox(createBoundingBox(5, 3, -15))).to.equal(true)

    for (const [x, y, z] of [
      [7, 0, -10],
      [-7, 0, -10],
      [0, 5, -10],
      [0, -5, -10],
      [0, 0, 1],
      [0, 0, -21]
    ]) {
      expect(frustum.intersectsBoundingBox(createBoundingBox(x, y, z))).to.equal(false)
    }

    frustum.orthographicHeight = 16

    expect(frustum.intersectsBoundingBox(createBoundingBox(7, 5, -10))).to.equal(true)

    frustum.orthographicHeight = 0

    expect(frustum.intersectsBoundingBox(createBoundingBox(7, 0, -2))).to.equal(false)
    expect(frustum.intersectsBoundingBox(createBoundingBox(7, 0, -15))).to.equal(true)
  })
})
