import { expect } from 'chai'
import { rejects } from 'node:assert/strict'
import { Light, Transform } from '@luz/core'
import { Quaternion, Vector3, Vector4 } from '@luz/math'

describe('Point lights', () => {
  it('serializes point emission without shadow cameras or runtime state', async () => {
    const light = await Light.deserialize({ type: 'light', lightType: 'point', range: 8, clipPlanes: [0.1, 10] })

    light.update(new Transform(), 0)
    expect(light.isPoint).to.equal(true)
    expect(light.isDirectional).to.equal(false)
    expect(light.shadowCameras).to.have.length(6)
    expect(light.serialize()).not.to.have.any.keys('shadowCameras', 'shadowCamera', 'isPoint')
    expect((await Light.deserialize(light.serialize())).serialize()).to.deep.equal(light.serialize())

    for (const range of [0, -1, NaN, Infinity, '4']) {
      await rejects(Light.deserialize({ type: 'light', lightType: 'point', range }), /range/)
    }
  })
  it('projects all six axes to face centers and ignores rotation and scale', () => {
    const light = new Light()
    const transform = new Transform({
      translation: new Vector3([3, 4, 5]),
      rotation: Quaternion.setFromEulerAngles(0.3, -0.5, 1),
      scale: new Vector3([-2, 3, 4])
    })
    const directions = [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1]
    ]

    light.lightType = 'point'
    light.range = 6

    light.clipPlanes.set([0.1, 12])
    transform.update(0)
    light.update(transform, 0)
    expect(Array.from(light.boundingBox!.minimum)).to.deep.equal([-3, -2, -1])
    expect(Array.from(light.boundingBox!.maximum)).to.deep.equal([9, 10, 11])

    const cameras = light.shadowCameras.slice()
    const matrices = cameras.map((camera, index) => {
      const position = new Vector4([
        3 + directions[index][0] * 2,
        4 + directions[index][1] * 2,
        5 + directions[index][2] * 2,
        1
      ])
      const projected = camera.projectionMatrix.transform(camera.viewMatrix.transform(position))

      expect(projected.w).to.be.closeTo(2, 1e-6)
      expect(projected.x).to.be.closeTo(0, 1e-6)
      expect(projected.y).to.be.closeTo(0, 1e-6)
      expect(projected.z / projected.w).to.be.within(-1, 1)

      return Array.from(camera.viewMatrix)
    })

    transform.rotation.set(Quaternion.createIdentity())
    transform.scale.set([8, -3, 2])
    transform.update(0)
    light.update(transform, 0)
    expect(light.shadowCameras).to.deep.equal(cameras)
    expect(light.shadowCameras.map((camera) => Array.from(camera.viewMatrix))).to.deep.equal(matrices)

    light.lightType = 'spot'

    light.update(transform, 0)
    expect(light.shadowCameras).to.have.length(1)

    light.lightType = 'point'

    light.update(transform, 0)
    expect(light.shadowCameras).to.deep.equal(cameras)
  })
})
