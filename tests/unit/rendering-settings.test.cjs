require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { it } = require('node:test')
const assert = require('node:assert/strict')
const {
  normalizeRenderingSettings,
  normalizeRenderingSetting,
  normalizeEnvironmentSettings,
  normalizeEnvironmentSetting,
  SceneRenderer
} = require('@luz/graphics')
const { createBackend } = require('../fixtures/renderer-backend.cjs')

it('normalizes partial and malformed settings without mutating input or sharing defaults', () => {
  const input = {
    motionBlur: { shutterAngle: 500, maximumSamples: 17 },
    bloom: { isEnabled: 'yes', intensity: Infinity },
    antialiasing: { method: 'invalid' },
    ambientOcclusion: { quality: 'high', radius: -2 },
    debug: { isDepthVisualized: true },
    unknown: { value: true }
  }
  const snapshot = structuredClone(input)
  const settings = normalizeRenderingSettings(input)

  assert.equal(settings.motionBlur.shutterAngle, 360)
  assert.equal(settings.motionBlur.maximumSamples, 24)
  assert.equal(settings.bloom.isEnabled, true)
  assert.equal(settings.bloom.intensity, 0.35)
  assert.equal(settings.antialiasing.method, 'taa')
  assert.equal(settings.ambientOcclusion.quality, 'high')
  assert.equal(settings.ambientOcclusion.radius, 0.1)
  assert.equal(settings.debug.isDepthVisualized, true)
  assert.equal(settings.unknown, undefined)
  assert.deepEqual(input, snapshot)

  settings.bloom.intensity = 1

  assert.equal(normalizeRenderingSettings(null).bloom.intensity, 0.35)
  assert.deepEqual(normalizeRenderingSettings([]), normalizeRenderingSettings(undefined))
  assert.equal(normalizeRenderingSetting('bloom', 'intensity', NaN, 0.8), 0.8)
  assert.equal(normalizeEnvironmentSetting('rotationDegrees', 400), 360)
  assert.deepEqual(normalizeEnvironmentSettings({ diffuseStrength: -1, ambientBrightness: Infinity }), {
    rotationDegrees: 0,
    ambientBrightness: 0.02,
    diffuseStrength: 0,
    specularStrength: 0.5
  })
})
it('renderer construction and live updates use the same accepted values', async () => {
  const renderer = await SceneRenderer.create({
    backend: createBackend(),
    models: {},
    decodeImage: async () => ({ width: 1, height: 1 }),
    settings: { bloom: { intensity: 100 }, antialiasing: { method: 'fxaa' } },
    environmentSettings: { diffuseStrength: -1 }
  })

  try {
    assert.equal(renderer.setRenderingSetting('bloom', 'intensity', NaN), 2)
    assert.equal(renderer.setRenderingSetting('antialiasing', 'method', 'invalid'), 'fxaa')
    assert.equal(renderer.setRenderingSetting('antialiasing', 'method', 'off'), 'off')
    assert.equal(renderer.setEnvironmentSetting('diffuseStrength', NaN), 0)
    assert.equal(renderer.setEnvironmentSetting('diffuseStrength', 10), 2)
  } finally {
    renderer.destroy()
  }
})
