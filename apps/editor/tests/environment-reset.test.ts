import { it, vi } from 'vitest'
import assert from 'node:assert/strict'
import { normalizeSceneSettings } from '../src/settings'
import { Entity, Light, Camera, isLight } from '@luz/core'
import { Scene } from '@luz/scene'
import { Model } from '@luz/graphics'
import { Vector3 } from '@luz/math'
import { Editor } from '../src/runtime/editor-runtime'

for (const hasEnvironment of [true, false]) {
  it(`resets only environment overrides (${hasEnvironment ? 'imported environment' : 'no environment'})`, async () => {
    const runtime = Object.create(Editor.prototype)

    runtime.settings = normalizeSceneSettings({
      environment: { rotationDegrees: 120, ambientBrightness: 0.7, diffuseStrength: 1.8, specularStrength: 1.2 },
      camera: { position: [1, 2, 3], rotation: [0, 0, 0, 1] },
      lights: { sun: { isEnabled: false } },
      models: { mesh: { isVisible: false } },
      simulation: { timeScale: 0.5, gravity: -3 },
      rendering: { bloom: { isEnabled: true } }
    })

    const before = structuredClone(runtime.settings)
    const environment = hasEnvironment
      ? { rotation: 0.75, irradiance: 'diffuse.ktx', radiance: 'specular.ktx' }
      : undefined

    runtime.scene = Object.freeze({ environment })
    runtime.sceneRenderer = { setEnvironmentSetting: vi.fn() }
    runtime.environmentRotation = 2
    runtime.simulation = { isRunning: true }

    let applicationCount = 0,
      persisted

    runtime.applySceneEnvironment = async (scene: { environment?: { rotation: number } }) => {
      assert.equal(scene, runtime.scene)

      runtime.environmentRotation = scene.environment?.rotation ?? 0
      applicationCount++
    }
    runtime.persistSettings = () => {
      persisted = structuredClone(runtime.settings)
    }

    const result = await runtime.resetImportedEnvironment()
    const expected = { ...before, environment: normalizeSceneSettings({}).environment }

    assert.deepEqual(runtime.settings, expected)
    assert.deepEqual(persisted, expected)
    assert.deepEqual(result, expected.environment)
    assert.notEqual(result, runtime.settings.environment)
    assert.equal(runtime.environmentRotation, hasEnvironment ? 0.75 : 0)
    assert.equal(runtime.simulation.isRunning, true)
    assert.equal(applicationCount, 1)
    assert.equal(runtime.sceneRenderer.setEnvironmentSetting.mock.calls.length, 4)
  })
}

it('restores imported camera pose and descendant visibility without resetting environment or simulation', () => {
  const runtime = Object.create(Editor.prototype)
  const scene = new Scene(),
    root = new Entity(),
    child = new Entity(),
    view = new Entity()

  scene.entities.root = root
  root.translation.x = 10
  root.children.visuals = child
  root.children.view = view
  view.components.camera = new Camera()

  view.translation.set([1, 2, 3])

  child.components.shownModel = new Model()
  child.components.hiddenModel = new Model()
  ;(child.components.hiddenModel as Model).isVisible = false
  child.components.shownLight = new Light()
  child.components.hiddenLight = new Light()
  ;(child.components.hiddenLight as Light).isVisible = false

  const initialRotation = Array.from(view.rotation)

  runtime.settings = normalizeSceneSettings({
    environment: { rotationDegrees: 120, diffuseStrength: 1.7 },
    simulation: { timeScale: 0.5, gravity: -3 },
    rendering: { bloom: { isEnabled: true } },
    models: {
      '["root/visuals","shownModel"]': { isVisible: false },
      '["root/visuals","hiddenModel"]': { isVisible: true }
    },
    lights: { shownLight: { isEnabled: false }, hiddenLight: { isEnabled: true } }
  })

  const before = structuredClone(runtime.settings)

  runtime.importedModelVisibility = new WeakMap()
  runtime.importedLightVisibility = new WeakMap()
  runtime.simulation = {
    isRunning: true,
    applyImportedState: (installedScene: Scene) => installedScene.gravity.set(new Vector3())
  }
  runtime.canvas = { width: 800, height: 600 }
  runtime.collectSceneLights = () =>
    Object.entries(child.components)
      .filter(([, component]) => isLight(component))
      .map(([key, light]) => ({ key, light }))
  runtime.hasAnimatedCamera = () => false
  runtime.restoreCameraPose = () => view.translation.set([8, 9, 10])
  runtime.synchronizeReflectorResources = () => {}

  let boundCamera, persisted

  runtime.cameraController = {
    setTransform: (entity: Entity) => {
      boundCamera = entity
    }
  }
  runtime.sceneRenderer = { invalidateHistory: vi.fn() }

  runtime.installScene(scene)
  assert.equal((child.components.hiddenModel as Model).isVisible, true)
  assert.equal((child.components.shownModel as Model).isVisible, false)
  assert.equal((child.components.hiddenLight as Light).isVisible, true)
  assert.equal((child.components.shownLight as Light).isVisible, false)
  view.rotation.set([0, 1, 0, 0])

  boundCamera = undefined

  runtime.sceneRenderer.invalidateHistory.mockClear()

  runtime.persistSettings = () => {
    persisted = structuredClone(runtime.settings)
  }
  runtime.captureEditorState = () => ({ settings: structuredClone(runtime.settings) })

  const result = runtime.resetImportedEntities()

  assert.deepEqual(Array.from(view.translation), [1, 2, 3])
  assert.deepEqual(Array.from(view.rotation), initialRotation)
  assert.deepEqual(Array.from(view.worldTranslation), [11, 2, 3])
  assert.equal(boundCamera, view)
  assert.equal((child.components.hiddenModel as Model).isVisible, false)
  assert.equal((child.components.shownModel as Model).isVisible, true)
  assert.equal((child.components.hiddenLight as Light).isVisible, false)
  assert.equal((child.components.shownLight as Light).isVisible, true)

  const expected = { ...before, models: {}, lights: {}, camera: { position: [1, 2, 3], rotation: initialRotation } }

  assert.deepEqual(result.settings, expected)
  assert.deepEqual(persisted, expected)
  assert.equal(runtime.simulation.isRunning, true)
  assert.equal(runtime.sceneRenderer.invalidateHistory.mock.calls.length, 1)
})
