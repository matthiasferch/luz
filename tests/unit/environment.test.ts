import { expect } from 'chai'
import { Scene } from '@luz/scene'

describe('Scene: Environment', () => {
  it('keeps environments optional for programmatic and older scenes', async () => {
    const scene = await Scene.deserialize({ entities: {} } as any)

    expect(scene.environment).to.equal(undefined)
    expect(scene.serialize()).not.to.have.property('environment')
  })
  it('round-trips scene image-based lighting resources', async () => {
    const scene = await Scene.deserialize({
      entities: {},
      environment: {
        sky: '../environments/studio/sky.ktx',
        radiance: '../environments/studio/radiance.ktx',
        irradiance: '../environments/studio/irradiance.ktx',
        rotation: -0.75
      }
    } as any)

    expect(scene.environment).to.deep.equal({
      sky: '../environments/studio/sky.ktx',
      radiance: '../environments/studio/radiance.ktx',
      irradiance: '../environments/studio/irradiance.ktx',
      rotation: -0.75
    })
    expect(scene.serialize()).to.have.deep.property('environment', {
      sky: '../environments/studio/sky.ktx',
      radiance: '../environments/studio/radiance.ktx',
      irradiance: '../environments/studio/irradiance.ktx',
      rotation: -0.75
    })
  })
})
