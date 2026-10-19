require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { it } = require('node:test')
const assert = require('node:assert/strict')
const { Camera, Entity } = require('@luz/core')
const { Scene } = require('@luz/scene')
const { Model, SceneRenderer, createRenderingSettings, DEBUG_VISUALIZATION_KEYS } = require('@luz/graphics')
const { createBackend } = require('../fixtures/renderer-backend.cjs')

async function createFixture() {
  const backend = createBackend()
  const renderer = await SceneRenderer.create({
    backend,
    models: { requireCompiledModel: (model) => ({ source: model, primitives: {}, materials: {} }) },
    decodeImage: async () => ({ width: 1, height: 1 }),
    settings: { ambientOcclusion: { isEnabled: true }, bloom: { isEnabled: true } }
  })
  const scene = new Scene()
  const context = { camera: new Camera(), target: { width: 65, height: 49 }, time: 0 }
  const render = () => {
    backend.events.length = 0

    const result = renderer.render(scene, context)

    return { result, events: [...backend.events] }
  }

  return { backend, renderer, scene, context, render }
}

const findStage = (events, name) => events.find((event) => event.pipeline.endsWith(`/${name}.fragment.glsl`))

it('executes temporal history before optical effects and presents exactly one display conversion', async () => {
  const { renderer, backend, render } = await createFixture()

  try {
    const { events } = render()
    const temporal = findStage(events, 'temporal-antialiasing')
    const bloom = findStage(events, 'bloom-extract')
    const presentation = findStage(events, 'present')

    assert.ok(temporal)
    assert.ok(bloom)
    assert.ok(events.indexOf(temporal) < events.indexOf(bloom))
    assert.equal(presentation.uniforms.isGammaCorrectionEnabled, true)
    assert.equal(events.filter((event) => event.uniforms.isGammaCorrectionEnabled).length, 1)
    assert.equal(events.filter((event) => event.uniforms.isToneMappingEnabled).length, 1)

    const output = backend.attachments.get(temporal.target.frameBuffer).get(0x8ce0)

    assert.notEqual(output, temporal.uniforms.currentTexture)
    assert.notEqual(output, temporal.uniforms.historyTexture)
    assert.equal(bloom.uniforms.baseTexture, output)
  } finally {
    renderer.destroy()
  }
})
it('resets temporal history for camera, scene, size, environment, visibility, settings, and explicit seeks', async () => {
  const { renderer, backend, scene, context, render } = await createFixture()
  const hiddenModel = new Model()

  hiddenModel.isVisible = false
  scene.entities.hidden = new Entity()
  scene.entities.hidden.components.model = hiddenModel

  try {
    const mutations = [
      () => renderer.invalidateHistory(),
      () => {
        context.camera = new Camera()
      },
      () => {
        context.target.width++
      },
      () => renderer.setEnvironment(null),
      () => renderer.setRenderingSetting('bloom', 'intensity', 0.6),
      () => {
        hiddenModel.isVisible = true
      }
    ]

    for (const mutate of mutations) {
      render()
      assert.equal(findStage(render().events, 'temporal-antialiasing').uniforms.isHistoryValid, true)
      mutate()
      assert.equal(findStage(render().events, 'temporal-antialiasing').uniforms.isHistoryValid, false)
    }

    render()

    backend.events.length = 0

    renderer.render(new Scene(), context)
    assert.equal(findStage(backend.events, 'temporal-antialiasing').uniforms.isHistoryValid, false)
  } finally {
    renderer.destroy()
  }
})
it('all diagnostic views suppress optical processing and display conversion', async () => {
  const { renderer, render } = await createFixture()

  try {
    for (const selected of DEBUG_VISUALIZATION_KEYS) {
      for (const key of DEBUG_VISUALIZATION_KEYS) {
        renderer.setRenderingSetting('debug', key, key === selected)
      }

      const { events } = render()

      if (selected === 'areMotionVectorsVisualized') {
        assert.equal(findStage(events, 'temporal-antialiasing').uniforms.areMotionVectorsVisualized, true)
      } else {
        assert.equal(findStage(events, 'temporal-antialiasing'), undefined, selected)
      }

      assert.equal(findStage(events, 'bloom-extract'), undefined, selected)
      assert.equal(findStage(events, 'motion-blur'), undefined, selected)
      assert.equal(findStage(events, 'present').uniforms.isGammaCorrectionEnabled, false, selected)
    }
  } finally {
    renderer.destroy()
  }
})
it('restores projection and repeats the eight-frame jitter sequence', async () => {
  const { renderer, context, render } = await createFixture()
  const projection = Array.from(context.camera.projectionMatrix)

  try {
    const samples = Array.from({ length: 16 }, () => {
      const { result } = render()

      assert.deepEqual(Array.from(context.camera.projectionMatrix), projection)

      return Array.from(result.depthJitter)
    })

    assert.deepEqual(samples.slice(0, 8), samples.slice(8))
    assert.equal(new Set(samples.slice(0, 8).map(JSON.stringify)).size, 8)
    assert.equal(createRenderingSettings().antialiasing.method, 'taa')
  } finally {
    renderer.destroy()
  }
})
