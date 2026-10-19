import { expect } from 'chai'
import { rejects } from 'node:assert/strict'
import { Camera, Light } from '@luz/core'

describe('Light serialization', () => {
  it('rejects degenerate cones and falloff outside the cone', async () => {
    for (const coneAngle of [0, 180, 360]) {
      await rejects(Light.deserialize({ type: 'light', lightType: 'spot', coneAngle, coneFalloff: 0 }), /coneAngle/)
    }

    await rejects(
      Light.deserialize({ type: 'light', lightType: 'spot', coneAngle: 60, coneFalloff: 61 }),
      /coneFalloff/
    )

    for (const coneFalloff of [0, 60]) {
      const light = await Light.deserialize({ type: 'light', lightType: 'spot', coneAngle: 60, coneFalloff, range: 20 })

      expect(light.serialize()).to.include({ coneAngle: 60, coneFalloff, range: 20 })
      expect(light.serialize()).not.to.have.any.keys('aperture', 'falloff', 'radius')
    }
  })
  it('uses degrees for the serialized camera field of view', async () => {
    for (const fieldOfView of [0, 180, -1, NaN, Infinity, '60']) {
      await rejects(Camera.deserialize({ type: 'camera', fieldOfView }), /fieldOfView/)
    }

    const camera = await Camera.deserialize({ type: 'camera', fieldOfView: 60 })

    expect(camera.serialize().fieldOfView).to.equal(60)
    expect(camera.serialize()).not.to.have.property('aperture')
  })
  it('preserves cone settings for spotlights and omits them for other light types', async () => {
    const light = await Light.deserialize({ type: 'light', lightType: 'spot', coneAngle: 60, coneFalloff: 15 })

    expect(light.serialize()).to.include({ coneAngle: 60, coneFalloff: 15 })

    for (const lightType of ['point', 'directional'] as const) {
      light.lightType = lightType

      const serialized = light.serialize()

      expect(serialized).not.to.have.any.keys('coneAngle', 'coneFalloff')
      expect((await Light.deserialize(serialized)).serialize()).to.deep.equal(serialized)
    }

    light.lightType = 'spot'

    expect(light.serialize()).to.include({ coneAngle: 60, coneFalloff: 15 })
  })
  it('rejects cone settings on point and directional light documents', async () => {
    for (const lightType of ['point', 'directional']) {
      for (const property of ['coneAngle', 'coneFalloff']) {
        await rejects(Light.deserialize({ type: 'light', lightType, [property]: 10 }), /only supported for spot lights/)
      }
    }
  })
  it('requires finite nonnegative cone settings on spotlight documents', async () => {
    for (const property of ['coneAngle', 'coneFalloff']) {
      for (const value of [undefined, null, '10', -1, NaN, Infinity]) {
        await rejects(
          Light.deserialize({ type: 'light', lightType: 'spot', coneAngle: 60, coneFalloff: 15, [property]: value }),
          new RegExp(property)
        )
      }
    }
  })
})
