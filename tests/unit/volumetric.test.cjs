require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { VOLUMETRIC_QUALITY, isVolumetricQuality, calculateVolumetricTargetSize } = require('@luz/graphics')
const { normalizeRenderingSettings } = require('@luz/graphics')

describe('Volumetric quality settings', () => {
  it('preserves the medium budget and scales odd/minimum target sizes', () => {
    assert.deepEqual(VOLUMETRIC_QUALITY.medium, { resolutionScale: 0.5, sampleCount: 24 })
    assert.deepEqual(calculateVolumetricTargetSize(101, 55, 'low'), { width: 26, height: 14 })
    assert.deepEqual(calculateVolumetricTargetSize(101, 55, 'medium'), { width: 51, height: 28 })
    assert.deepEqual(calculateVolumetricTargetSize(101, 55, 'high'), { width: 76, height: 42 })
    assert.deepEqual(calculateVolumetricTargetSize(0, 0, 'low'), { width: 1, height: 1 })
  })
  it('rejects unknown presets and inherited object keys', () => {
    for (const value of [undefined, null, 24, 'Ultra', 'function toString() { [native code] }', '[object Object]']) {
      assert.equal(isVolumetricQuality(value), false)
    }
  })
  it('normalizes partial settings with safe defaults without changing valid values', () => {
    const settings = normalizeRenderingSettings({
      volumetricLighting: { quality: 'Unknown', intensityMultiplier: 0.6, noiseSpeed: 0 }
    })

    assert.equal(settings.volumetricLighting.quality, 'medium')
    assert.equal(settings.volumetricLighting.intensityMultiplier, 0.6)
    assert.equal(settings.volumetricLighting.noiseSpeed, 0)
    assert.equal(settings.debug.isVolumetricLightVisualized, false)
    assert.equal(settings.lighting.isSubsurfaceLightingEnabled, true)
  })
})
