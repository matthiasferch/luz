require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const {
  SCENE_SETTINGS_STORAGE_KEY,
  normalizeSceneSettings,
  createSceneSettingsId,
  SettingsStore
} = require('../src/settings.ts')

const createStorage = () => {
  const values = new Map()

  return {
    getItem: (key) => values.get(key) ?? null,

    setItem: (key, value) => values.set(key, value),

    removeItem: (key) => values.delete(key),
    values
  }
}

it('restores rendering preferences through engine validation while preserving annotation preferences', () => {
  const settings = normalizeSceneSettings({
    environment: { ambientBrightness: 5 },
    rendering: {
      bloom: { intensity: 9 },
      motionBlur: { maximumSamples: 3 },
      debug: { areOverlaysVisible: false, overlayCategories: { sleeping: false }, overlayLineWidth: 100 }
    }
  })

  assert.equal(settings.environment.ambientBrightness, 1)
  assert.equal(settings.rendering.bloom.intensity, 2)
  assert.equal(settings.rendering.motionBlur.maximumSamples, 24)
  assert.equal(settings.rendering.planarReflections.isEnabled, false)
  assert.equal(settings.rendering.ambientOcclusion.isEnabled, false)
  assert.equal(settings.rendering.volumetricLighting.isEnabled, true)
  assert.equal(settings.rendering.lighting.isSubsurfaceLightingEnabled, false)
  assert.equal(settings.rendering.bloom.isEnabled, true)
  assert.equal(settings.rendering.motionBlur.isEnabled, false)
  assert.equal(settings.rendering.depthOfField.isEnabled, false)
  assert.equal(settings.rendering.debug.areOverlaysVisible, false)
  assert.equal(settings.rendering.debug.overlayCategories.sleeping, false)
  assert.equal(settings.rendering.debug.overlayLineWidth, 5)
})
it('persists model visibility independently by entity path and component name', async () => {
  const storage = createStorage()
  const store = new SettingsStore('http://localhost/assets/scenes/test.scene.json', storage, 0)
  const firstModelKey = JSON.stringify(['Room/First', 'Mesh'])
  const secondModelKey = JSON.stringify(['Room/Second', 'Mesh'])
  const settings = normalizeSceneSettings({
    models: {
      [firstModelKey]: { isVisible: false },
      [secondModelKey]: { isVisible: true },
      invalid: { isVisible: 'false' }
    }
  })

  store.save(settings)
  assert.deepEqual((await store.load()).models, {
    [firstModelKey]: { isVisible: false },
    [secondModelKey]: { isVisible: true }
  })
})
describe('Scene settings storage', () => {
  it('persists the renamed rendering predicates across independent stores', async () => {
    const storage = createStorage()
    const store = new SettingsStore('predicates.scene.json', storage, 0)
    const settings = normalizeSceneSettings({
      rendering: {
        shadows: { isEnabled: false },
        lighting: { isSubsurfaceLightingEnabled: false },
        depthOfField: { isCameraOverridden: true },
        debug: { isAmbientOcclusionVisualized: true, areCollidersVisible: true }
      }
    })

    store.save(settings)
    store.flush()

    const restored = await new SettingsStore('predicates.scene.json', storage, 0).load()

    assert.deepEqual(restored.rendering, settings.rendering)

    const saved = JSON.parse(storage.values.get(SCENE_SETTINGS_STORAGE_KEY))['predicates.scene.json'].rendering

    assert.equal(saved.debug.isAmbientOcclusionVisualized, true)
    assert.equal(saved.shadows.isEnabled, false)
    assert.equal(Object.hasOwn(saved.debug, 'visualizeAO'), false)
    assert.equal(Object.hasOwn(saved.shadows, 'enabled'), false)
  })
  it('defaults camera blur on for existing scenes and persists object-only mode', async () => {
    assert.equal(normalizeSceneSettings({}).rendering.motionBlur.isCameraBlurEnabled, true)
    assert.equal(
      normalizeSceneSettings({ rendering: { motionBlur: { isCameraBlurEnabled: 'false' } } }).rendering.motionBlur
        .isCameraBlurEnabled,
      true
    )

    const storage = createStorage()
    const store = new SettingsStore('motion.scene.json', storage, 0)
    const settings = normalizeSceneSettings({ rendering: { motionBlur: { isCameraBlurEnabled: false } } })

    store.save(settings)
    store.flush()
    assert.equal((await store.load()).rendering.motionBlur.isCameraBlurEnabled, false)
  })
  it('uses a concise scene identifier beneath the shared storage key', () => {
    assert.equal(SCENE_SETTINGS_STORAGE_KEY, 'luz.scene.settings')
    assert.equal(
      createSceneSettingsId(
        'assets/scenes/coastal/editor%20scene.scene.json?variant=night',
        'https://example.test/editor/'
      ),
      'coastal/editor scene.scene.json?variant=night'
    )
  })
  it('persists validated settings independently for each scene', async () => {
    const storage = createStorage()
    const firstStore = new SettingsStore('first.scene.json', storage, 0)
    const secondStore = new SettingsStore('second.scene.json', storage, 0)
    const settings = normalizeSceneSettings({
      simulation: { timeScale: 0.25, gravity: -4.5 },
      rendering: { bloom: { isEnabled: true } }
    })

    firstStore.save(settings)
    assert.equal((await firstStore.load()).simulation.timeScale, 0.25)
    assert.equal((await firstStore.load()).simulation.gravity, -4.5)
    assert.equal((await firstStore.load()).rendering.bloom.isEnabled, true)
    assert.equal((await secondStore.load()).simulation.timeScale, 1)
    secondStore.save(normalizeSceneSettings({ simulation: { timeScale: 0.5 } }))

    const storedScenes = JSON.parse(storage.values.get(SCENE_SETTINGS_STORAGE_KEY))

    assert.deepEqual(Object.keys(storedScenes).sort(), ['first.scene.json', 'second.scene.json'])
    assert.equal(storedScenes['first.scene.json'].simulation.timeScale, 0.25)
    assert.equal(storedScenes['second.scene.json'].simulation.timeScale, 0.5)
  })
  it('keeps gravity unset until a scene-specific override is stored', () => {
    assert.equal(normalizeSceneSettings({}).simulation.gravity, null)
    assert.equal(normalizeSceneSettings({ simulation: { gravity: -3.2 } }).simulation.gravity, -3.2)
    assert.equal(normalizeSceneSettings({ simulation: { gravity: 'heavy' } }).simulation.gravity, null)
  })
  it('groups feature settings instead of persisting prefixed flat keys', () => {
    const settings = normalizeSceneSettings({
      rendering: {
        output: { toneMapping: false, gammaCorrection: false },
        ambientOcclusion: { isEnabled: true, falloff: 2.25 }
      }
    })

    assert.equal(settings.rendering.ambientOcclusion.isEnabled, true)
    assert.equal(settings.rendering.ambientOcclusion.falloff, 2.25)
    assert.equal(Object.hasOwn(settings.rendering, 'ambientOcclusionFalloff'), false)
    assert.equal(Object.hasOwn(settings.rendering, 'output'), false)
    assert.equal(Object.hasOwn(settings, 'graphics'), false)
  })
  it('normalizes overlay category visibility independently', () => {
    const settings = normalizeSceneSettings({
      rendering: {
        debug: {
          overlayCategories: { active: false, colliding: false, passive: 'hidden' }
        }
      }
    })

    assert.deepEqual(settings.rendering.debug.overlayCategories, {
      active: false,
      passive: true,
      sleeping: true,
      colliding: false,
      culled: true
    })
  })
  it('removes obsolete output settings from persisted scene data when loading', async () => {
    const storage = createStorage()
    const store = new SettingsStore('editor.scene.json', storage, 0)

    storage.setItem(
      store.key,
      JSON.stringify({
        'editor.scene.json': { rendering: { output: { toneMapping: false, gammaCorrection: false } } }
      })
    )

    await store.load()

    const stored = JSON.parse(storage.getItem(store.key))['editor.scene.json']

    assert.equal(Object.hasOwn(stored.rendering, 'output'), false)
  })
  it('stores settings per light', () => {
    const settings = normalizeSceneSettings({
      lights: {
        'Light 1': { isEnabled: true },
        'Light 2': { isEnabled: false },
        Invalid: { isEnabled: 'yes' }
      }
    })

    assert.deepEqual(settings.lights, {
      'Light 1': { isEnabled: true },
      'Light 2': { isEnabled: false }
    })
  })
  it('ignores an invalid scene entry without discarding other scenes', async () => {
    const storage = createStorage()
    const store = new SettingsStore('broken.scene.json', storage, 0)

    storage.setItem(
      store.key,
      JSON.stringify({
        'broken.scene.json': 'invalid',
        'valid.scene.json': { simulation: { timeScale: 0.4 } }
      })
    )

    const originalWarn = console.warn

    console.warn = () => undefined

    try {
      const settings = await store.load()

      assert.equal(settings.simulation.timeScale, 1)

      const validStore = new SettingsStore('valid.scene.json', storage, 0)

      assert.equal((await validStore.load()).simulation.timeScale, 0.4)
      assert.notEqual(storage.getItem(store.key), null)
    } finally {
      console.warn = originalWarn
    }
  })
  it('recovers from a corrupt root when the next scene is saved', async () => {
    const storage = createStorage()
    const store = new SettingsStore('editor.scene.json', storage, 0)

    storage.setItem(store.key, '{not json')
    store.save(normalizeSceneSettings({ simulation: { timeScale: 0.75 } }))
    assert.equal((await store.load()).simulation.timeScale, 0.75)
  })
})
describe('Geometry overlay settings', () => {
  it('defaults new controls and discards obsolete names and invalid modes', () => {
    const defaults = normalizeSceneSettings({}).rendering.debug

    assert.equal(defaults.overlayDepthMode, 'occluded')
    assert.equal(defaults.overlayLineWidth, 2)
    assert.equal(defaults.overlayOpacity, 0.9)

    const debug = normalizeSceneSettings({
      rendering: {
        debug: {
          areFrustumsVisible: true,
          areBoundsVisible: true,
          areModelBoundsVisible: true,
          areBodyBoundsVisible: true,
          overlayDepthMode: 'invalid',
          overlayLineWidth: Infinity,
          overlayOpacity: -1
        }
      }
    }).rendering.debug

    assert.equal(debug.overlayDepthMode, 'occluded')
    assert.equal(debug.overlayLineWidth, 2)
    assert.equal(debug.overlayOpacity, 0.1)
    assert.equal(debug.areCameraFrustumsVisible, false)
    assert.equal(debug.areBodyBoundingBoxesVisible, false)
    assert.equal(debug.areModelBoundingBoxesVisible, false)
    assert.equal(debug.areGeometryOverlaysVisible, true)
    assert.equal(Object.hasOwn(debug, 'areBoundsVisible'), false)
    assert.equal(Object.hasOwn(debug, 'areModelBoundsVisible'), false)
    assert.equal(Object.hasOwn(debug, 'areBodyBoundsVisible'), false)
  })
  it('persists styles and independent categories and clamps finite values', async () => {
    const store = new SettingsStore('overlays.scene.json', createStorage(), 0)
    const settings = normalizeSceneSettings({
      rendering: {
        debug: {
          overlayDepthMode: 'visible',
          overlayLineWidth: 8,
          overlayOpacity: 2,
          areCameraFrustumsVisible: true,
          areGeometryOverlaysVisible: false,
          areModelBoundingBoxesVisible: true
        }
      }
    })

    store.save(settings)
    store.flush()

    const debug = (await store.load()).rendering.debug

    assert.equal(debug.overlayDepthMode, 'visible')
    assert.equal(debug.overlayLineWidth, 5)
    assert.equal(debug.overlayOpacity, 1)
    assert.equal(debug.areCameraFrustumsVisible, true)
    assert.equal(debug.areLightFrustumsVisible, false)
    assert.equal(debug.areModelBoundingBoxesVisible, true)
    assert.equal(debug.areGeometryOverlaysVisible, false)
  })
})
