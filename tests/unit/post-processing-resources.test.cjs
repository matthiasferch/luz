const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { createEffectFixture } = require('../fixtures/effect-fixture.cjs')

const names = ['motionBlur', 'objectMotion', 'temporal', 'depthOfField', 'ambientOcclusion', 'bloom']
const createMethodName = (action, name) => `${action}${name[0].toUpperCase()}${name.slice(1)}Resources`

const createFixture = () => {
  const instance = createEffectFixture()
  const liveTextures = new Set(),
    liveBuffers = new Set()

  instance.viewport = { width: 33, height: 19 }
  instance.depthTexture = {}
  instance.motionBlur = {}
  instance.temporalAntialiasing = {
    historyTextures: [],
    historyMetadataTextures: [],
    historyLuminanceTextures: [],
    historyTargets: []
  }
  instance.depthOfField = { radiusTextures: [], radiusTargets: [], layerTextures: [] }
  instance.ambientOcclusion = {
    historyTextures: [],
    historyMetadataTextures: [],
    historyTargets: []
  }
  instance.bloom = { levels: [], targets: [] }
  instance.backend = {
    textures: {
      create: (options) => {
        const texture = { ...options }

        liveTextures.add(texture)

        return texture
      },

      destroy: (texture) => assert.ok(liveTextures.delete(texture), 'texture released exactly once')
    },
    buffers: {
      create: () => {
        const buffer = {}

        liveBuffers.add(buffer)

        return buffer
      },

      attach: (buffer, texture) => {
        assert.ok(liveBuffers.has(buffer))
        assert.ok(texture)
      },

      destroy: (buffer) => assert.ok(liveBuffers.delete(buffer), 'framebuffer released exactly once')
    }
  }

  return { instance, liveTextures, liveBuffers }
}

describe('Optional post-processing resources', () => {
  it('releases object-only resources when camera blur returns or motion blur is disabled', () => {
    const { instance, liveTextures, liveBuffers } = createFixture()

    instance.prepareMotionBlurResources(true)

    const cameraTextures = [...liveTextures]

    instance.prepareObjectMotionResources(true)
    assert.ok(instance.motionBlur.objectTarget)
    instance.prepareObjectMotionResources(false)
    assert.deepEqual([...liveTextures], cameraTextures)
    instance.prepareObjectMotionResources(true)
    instance.prepareMotionBlurResources(false)
    assert.equal(instance.motionBlur.objectTarget, undefined)
    assert.equal(liveTextures.size, 0)
    assert.equal(liveBuffers.size, 0)
  })

  for (const name of names) {
    it(`${name} allocates on demand, reuses, resizes and releases every resource`, () => {
      const { instance, liveTextures, liveBuffers } = createFixture()
      const prepare = (isEnabled) => instance[createMethodName('prepare', name)](isEnabled)

      prepare(false)
      assert.equal(liveTextures.size, 0)
      prepare(true)

      const originals = [...liveTextures]

      assert.ok(originals.length > 0)
      prepare(true)
      assert.deepEqual([...liveTextures], originals)

      instance.viewport = { width: 65, height: 37 }

      prepare(true)

      for (const old of originals) {
        assert.ok(!liveTextures.has(old))
      }

      prepare(false)
      prepare(false)
      assert.equal(liveTextures.size, 0)
      assert.equal(liveBuffers.size, 0)
      prepare(true)
      prepare(false)
      assert.equal(liveTextures.size, 0)
      assert.equal(liveBuffers.size, 0)
    })
  }

  it('allocates 87.01 MiB of DOF color storage at 4K before a backing layer is needed', () => {
    const { instance, liveTextures } = createFixture()

    instance.viewport = { width: 3840, height: 2160 }

    instance.prepareDepthOfFieldResources(true)
    assert.equal(instance.depthOfField.radiusTextures[0].format, 'red')

    let bytes = 0

    for (const texture of liveTextures) {
      if (texture.format === 'depth') {
        continue
      }

      bytes += (texture.width * texture.height * (texture.format === 'red' ? 1 : 4) * texture.precision) / 8
    }

    assert.equal(bytes, 91238400)
    assert.equal(instance.depthOfField.backingTarget, undefined)
  })
})
