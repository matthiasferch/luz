require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { it } = require('node:test')
const assert = require('node:assert/strict')
const { Scene } = require('@luz/scene')
const { Camera } = require('@luz/core')
const { SceneRenderer, createDebugSettings, updateDebugSetting } = require('@luz/graphics')
const { createBackend } = require('../fixtures/renderer-backend.cjs')
const { EnvironmentManager } = require('../../packages/graphics/rendering/environment-manager.ts')
const { TemporalHistory } = require('../../packages/graphics/rendering/temporal-history.ts')

const createOptions = () => ({
  backend: createBackend(),
  models: {},
  decodeImage: async () => ({ width: 1, height: 1 })
})

it('renders without DOM globals, restores the camera on failure, and releases only owned resources', async () => {
  assert.equal(typeof document, 'undefined')

  const options = createOptions()
  const borrowedTexture = options.backend.textures.create()
  const borrowedFrameBuffer = options.backend.buffers.create('frameBuffer')
  const renderer = await SceneRenderer.create(options)
  const scene = new Scene()
  const camera = new Camera()
  const target = { width: 64, height: 48, frameBuffer: borrowedFrameBuffer }
  const projection = Array.from(camera.projectionMatrix)
  const frame = renderer.render(scene, { camera, target, time: 0 })

  assert.equal(frame.width, 64)
  assert.equal(frame.height, 48)
  assert.deepEqual(Array.from(camera.projectionMatrix), projection)
  assert.ok(options.backend.drawCalls.length > 0)

  const draw = options.backend.render

  options.backend.render = () => {
    throw new Error('draw failed')
  }

  assert.throws(() => renderer.render(scene, { camera, target, time: 1 }), /draw failed/)
  assert.deepEqual(Array.from(camera.projectionMatrix), projection)

  options.backend.render = draw
  target.width = 32

  const resizedFrame = renderer.render(scene, { camera, target, time: 2 })

  assert.notEqual(frame.depthTexture, resizedFrame.depthTexture)
  assert.equal(resizedFrame.depthTexture.width, 32)
  assert.equal(frame.width, 64)
  renderer.destroy()
  renderer.destroy()
  assert.deepEqual([...options.backend.allocations], [borrowedTexture, borrowedFrameBuffer])
  assert.throws(() => renderer.render(scene, { camera, target, time: 3 }), /destroyed/)
})
it('cleans up failed or cancelled factory initialization', async () => {
  const options = createOptions()

  options.decodeImage = async () => {
    throw new Error('decode failed')
  }

  await assert.rejects(SceneRenderer.create(options), /decode failed/)
  assert.equal(options.backend.allocations.size, 0)

  const controller = new AbortController()

  options.signal = controller.signal
  options.decodeImage = async () => {
    controller.abort()

    return { width: 1, height: 1 }
  }

  await assert.rejects(SceneRenderer.create(options), { name: 'AbortError' })
  assert.equal(options.backend.allocations.size, 0)
})
it('publishes an environment atomically and cleans up partial GPU allocation failure', () => {
  const backend = createBackend()
  const environment = new EnvironmentManager({
    backend,
    requireActive() {},

    invalidateHistory() {},
    environmentSettings: { rotationDegrees: 0 }
  })
  const source = { kind: 'hdr', width: 1, height: 1, data: new Uint8Array([255, 255, 255, 255]) }
  const sources = { irradiance: source, radiance: source, rotation: 1 }

  environment.setEnvironment(sources)

  const previousTextures = [...backend.allocations]
  const createTexture = backend.textures.create

  let requestCount = 0

  backend.textures.create = (...parameters) => {
    if (++requestCount === 2) {
      throw new Error('allocation failed')
    }

    return createTexture(...parameters)
  }

  assert.throws(() => environment.setEnvironment(sources), /allocation failed/)
  assert.deepEqual([...backend.allocations], previousTextures)
  assert.equal(environment.environmentDiffuseTexture, previousTextures[0])

  backend.textures.create = createTexture

  environment.setEnvironment(sources)
  assert.equal(backend.allocations.size, 2)
  assert.notEqual(environment.environmentDiffuseTexture, previousTextures[0])
})
it('validates debug drawing settings independently of editor preferences', () => {
  const settings = createDebugSettings()

  assert.equal(updateDebugSetting(settings, 'overlayLineWidth', 100), 5)
  assert.equal(updateDebugSetting(settings, 'overlayOpacity', -1), 0.1)
  assert.equal(updateDebugSetting(settings, 'overlayOpacity', NaN), 0.1)
  assert.equal(updateDebugSetting(settings, 'overlayDepthMode', 'invalid'), 'occluded')
  assert.equal(updateDebugSetting(settings, 'areCollidersVisible', true), true)
})
it('discards object and skeletal motion history after an explicit reset or seek', () => {
  const ambientOcclusion = { isHistoryValid: true, frameIndex: 3 }
  const history = new TemporalHistory({ ambientOcclusion, backend: createBackend() })
  const transform = {}
  const model = {}

  history.previousModelMatrices.set(transform, {})
  history.previousBoneMatrices.set(model, new Float32Array(16))

  history.isMotionHistoryInitialized = true
  history.temporalAntialiasing.isHistoryValid = true

  history.invalidateHistory()
  assert.equal(history.previousModelMatrices.has(transform), false)
  assert.equal(history.previousBoneMatrices.has(model), false)
  assert.equal(history.isMotionHistoryInitialized, false)
  assert.equal(history.temporalAntialiasing.isHistoryValid, false)
  assert.equal(ambientOcclusion.isHistoryValid, false)
})
it('can retry target allocation after a failed resize and release every allocation', async () => {
  const options = createOptions()
  const renderer = await SceneRenderer.create(options)
  const scene = new Scene()
  const camera = new Camera()
  const target = { width: 32, height: 32 }
  const createTexture = options.backend.textures.create

  renderer.render(scene, { camera, target, time: 0 })

  target.width = 64
  options.backend.textures.create = () => {
    throw new Error('target allocation failed')
  }

  assert.throws(() => renderer.render(scene, { camera, target, time: 1 }), /target allocation failed/)

  options.backend.textures.create = createTexture

  assert.equal(renderer.render(scene, { camera, target, time: 2 }).width, 64)
  renderer.destroy()
  assert.equal(options.backend.allocations.size, 0)
})
