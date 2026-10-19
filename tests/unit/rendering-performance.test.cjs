require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { it } = require('node:test')
const assert = require('node:assert/strict')
const { Camera, Entity, Light, Transform } = require('@luz/core')
const { Matrix4 } = require('@luz/math')
const { Scene } = require('@luz/scene')
const { FrameRenderer, Model, Mesh, RenderPipeline, SceneRenderer, createRenderingSettings } = require('@luz/graphics')
const { ShadowRenderer } = require('../../packages/graphics/rendering/shadow-renderer.ts')
const { FocusEffect } = require('../../packages/graphics/rendering/focus-effect.ts')
const { createBackend } = require('../fixtures/renderer-backend.cjs')

function createModel(depth = 3) {
  const mesh = new Mesh({ vertices: [-1, -1, -depth, 0, 0, 0, 0, 1, 1, 1, -depth, 1, 1, 0, 0, 1] })
  const model = new Model({ meshes: { surface: mesh } })
  const compiledModel = { source: model, primitives: { surface: { material: { isOpaque: true } } }, materials: {} }
  const entity = new Entity()

  entity.components.model = model

  entity.update(0)

  return { model, compiledModel, entity, batch: { transform: entity, model: compiledModel, meshes: ['surface'] } }
}

it('reuses each light shadow map across views, refreshes every frame, and releases removed lights', () => {
  const backend = createBackend()
  const { compiledModel, entity } = createModel()
  const renderer = new ShadowRenderer(backend, { requireCompiledModel: () => compiledModel })
  const pipeline = new RenderPipeline({ vertexShader: '', fragmentShader: 'shadow' })
  const spotLight = new Light()
  const pointLight = new Light()

  pointLight.lightType = 'point'

  const spotBatch = { light: spotLight, entities: [entity] }
  const pointBatch = { light: pointLight, entities: [entity] }

  renderer.beginFrame([spotLight, pointLight], true)

  const spotTexture = renderer.render(spotBatch, pipeline)
  const pointTexture = renderer.render(pointBatch, pipeline)

  assert.notEqual(spotTexture, pointTexture)
  assert.equal(backend.events.length, 7)
  assert.equal(new Set(backend.events.slice(1).map((event) => JSON.stringify(event.target.viewport))).size, 6)
  assert.equal(renderer.render(spotBatch, pipeline), spotTexture)
  assert.equal(renderer.render(pointBatch, pipeline), pointTexture)
  assert.equal(backend.events.length, 7)
  renderer.beginFrame([spotLight, pointLight], true)
  renderer.render(spotBatch, pipeline)
  assert.equal(backend.events.length, 8)
  renderer.beginFrame([pointLight], true)
  assert.equal(backend.allocations.has(spotTexture), false)
  assert.equal(backend.allocations.has(pointTexture), true)
  renderer.beginFrame([pointLight], false)
  assert.equal(backend.allocations.size, 0)
  renderer.destroy()
  renderer.destroy()
})
it('binds the matching shared shadow map for opaque, transmissive, transparent and volumetric lighting', () => {
  const backend = createBackend()
  const { compiledModel, entity, batch } = createModel()
  const renderer = new FrameRenderer(backend, () => compiledModel)
  const firstLight = new Light()
  const secondLight = new Light()
  const shadowTextures = new Map([
    [firstLight, {}],
    [secondLight, {}]
  ])
  const createPipeline = (name) => new RenderPipeline({ vertexShader: '', fragmentShader: name })
  const transparentModel = {
    ...compiledModel,
    primitives: { surface: { material: { isOpaque: false, blendMode: 'transparent' } } }
  }
  const transmissionModel = {
    ...compiledModel,
    primitives: { surface: { material: { isOpaque: false, blendMode: 'transmissive' } } }
  }

  for (const light of [firstLight, secondLight]) {
    light.volumetricIntensity = 1
  }

  let activeLight

  backend.bindLightUniforms = (_program, light) => {
    activeLight = light
  }

  const bindUniforms = backend.bindUniforms

  backend.bindUniforms = (program, uniforms) => {
    if (uniforms.shadowTexture) {
      assert.equal(uniforms.shadowTexture, shadowTextures.get(activeLight))
    }

    bindUniforms(program, uniforms)
  }

  renderer.renderFrame(
    {
      lighting: createPipeline('lighting'),
      transparent: createPipeline('transparent'),
      volumetricLighting: createPipeline('volume')
    },
    { camera: new Camera(), target: { width: 64, height: 48 }, time: 0 },
    [firstLight, secondLight].map((light) => ({ light, entities: [entity] })),
    [batch],
    [
      { ...batch, model: transparentModel },
      { ...batch, model: transmissionModel }
    ],
    {
      resolveShadowTexture: ({ light }) => shadowTextures.get(light),

      resolveTransmissionLightingTarget: () => ({ width: 64, height: 48 }),
      volumetricBatches: [batch],
      additionalUniforms: { lighting: { shadowTexture: {} }, transparent: { shadowTexture: {} } }
    }
  )
  assert.equal(backend.events.filter((event) => event.pipeline === 'lighting').length, 4)
  assert.equal(backend.events.filter((event) => event.pipeline === 'transparent').length, 2)
  assert.equal(backend.events.filter((event) => event.pipeline === 'volume').length, 2)
})
it('conservatively detects foreground blur after transforms, optical overrides and geometry edits', () => {
  const backend = createBackend()
  const camera = new Camera()
  const effect = new FocusEffect({ backend, viewport: { width: 1920, height: 1080 } })
  const { model, entity, batch } = createModel(20)
  const settings = createRenderingSettings().depthOfField

  camera.updateFromMatrix(new Matrix4())
  effect.beginFrame({ camera })
  assert.equal(effect.requiresBackingLayer([batch], settings), false)

  entity.translation.z = 17
  entity.scale.z = -1

  entity.update(0)
  assert.equal(effect.requiresBackingLayer([batch], settings), true)

  entity.scale.z = 1

  entity.update(0)
  assert.equal(effect.requiresBackingLayer([batch], settings), true)
  assert.equal(effect.requiresBackingLayer([batch], { ...settings, maximumBlurRadius: 0 }), false)
  assert.equal(effect.requiresBackingLayer([batch], { ...settings, isCameraOverridden: true, focusDistance: 1 }), false)

  entity.translation.z = 0

  entity.update(0)
  model.setMesh('surface', new Mesh({ vertices: [-1, -1, -2, 0, 0, 0, 0, 1] }))
  assert.equal(effect.requiresBackingLayer([batch], settings), true)

  model.isVisible = false

  assert.equal(effect.requiresBackingLayer([batch], settings), false)
  effect.destroy()
})
it('omits all depth-of-field passes for a zero radius and all shadow maps when shadows are disabled', async () => {
  const backend = createBackend()
  const { compiledModel, entity } = createModel()
  const renderer = await SceneRenderer.create({
    backend,
    models: { requireCompiledModel: () => compiledModel },
    decodeImage: async () => ({ width: 1, height: 1 }),
    settings: { shadows: { isEnabled: false }, depthOfField: { maximumBlurRadius: 0 } }
  })
  const scene = new Scene()
  const camera = new Camera()
  const light = new Light()

  light.lightType = 'directional'
  camera.isDepthOfFieldEnabled = true
  scene.entities.surface = entity
  scene.entities.lamp = new Entity()
  scene.entities.lamp.components.light = light

  scene.update(0, false)
  camera.updateFromMatrix(Transform.createOrigin().modelMatrix)

  try {
    renderer.render(scene, { camera, target: { width: 64, height: 48 }, time: 0 })
    assert.ok(backend.events.every((event) => !event.pipeline.includes('depth-of-field')))
    assert.ok(backend.events.every((event) => event.target.width !== 2048))
    assert.ok([...backend.allocations].every((resource) => resource.width !== 2048))
  } finally {
    renderer.destroy()
  }
})
it('updates foreground detection when a skeletal pose crosses the focus plane', () => {
  const backend = createBackend()
  const camera = new Camera()
  const effect = new FocusEffect({ backend, viewport: { width: 1920, height: 1080 } })
  const { model, batch } = createModel(20)
  const settings = createRenderingSettings().depthOfField

  model.setMesh(
    'surface',
    new Mesh({
      vertices: [0, 0, -20, 0, 0, 0, 0, 1],
      weights: [{ vertex: 0, indices: [0, 0, 0, 0], weights: [1, 0, 0, 0] }]
    })
  )

  model.isAnimated = true
  model.boneMatrices = new Float32Array(new Matrix4())

  camera.updateFromMatrix(new Matrix4())
  effect.beginFrame({ camera })
  assert.equal(effect.requiresBackingLayer([batch], settings), false)

  model.boneMatrices[14] = 18

  assert.equal(effect.requiresBackingLayer([batch], settings), true)

  model.boneMatrices[14] = 0

  assert.equal(effect.requiresBackingLayer([batch], settings), false)
  effect.destroy()
})
it('allocates backing only for foreground blur, releases it on focus changes, and recreates it after resizing', () => {
  const backend = createBackend()
  const camera = new Camera()
  const viewport = { width: 1920, height: 1080 }
  const depthTexture = backend.textures.create({ ...viewport, format: 'depth' })
  const renderedFrames = []
  const effect = new FocusEffect({
    backend,
    viewport,
    environmentSettings: { ambientBrightness: 1, diffuseStrength: 1, specularStrength: 1 },
    calculateEnvironmentRotation: () => 0,
    frameRenderer: {
      clear() {},

      renderFrame: (...parameters) => renderedFrames.push(parameters)
    }
  })
  const { batch } = createModel(3)
  const settings = createRenderingSettings().depthOfField

  camera.updateFromMatrix(new Matrix4())
  effect.beginFrame({ camera, depthTexture, environmentSpecularTexture: { width: 1, height: 1 } })

  effect.depthOfFieldSurfacePipeline = new RenderPipeline({ vertexShader: '', fragmentShader: 'ownership' })

  effect.prepareDepthOfFieldResources(true)

  const baseAllocations = new Set(backend.allocations)
  const renderBacking = () => effect.renderDepthOfFieldBackingLayer([batch], [batch], [], {}, {}, undefined, settings)

  renderBacking()

  const backingTexture = effect.depthOfField.backingTexture

  assert.ok(backingTexture)
  assert.equal(renderedFrames.length, 1)
  renderBacking()
  assert.equal(effect.depthOfField.backingTexture, backingTexture)

  camera.focusDistance = 1

  renderBacking()
  assert.equal(renderedFrames.length, 2)
  assert.equal(effect.depthOfField.backingTexture, undefined)
  assert.deepEqual(backend.allocations, baseAllocations)

  camera.focusDistance = 10
  viewport.width = 1919

  effect.prepareDepthOfFieldResources(true)
  renderBacking()
  assert.equal(effect.depthOfField.backingTarget.width, 1919)
  assert.notEqual(effect.depthOfField.backingTexture, backingTexture)
  effect.destroy()
  assert.deepEqual([...backend.allocations], [depthTexture])
})
it('releases failed shadow allocations and retries failed rendering without reusing an incomplete map', () => {
  const backend = createBackend()
  const { compiledModel, entity } = createModel()
  const renderer = new ShadowRenderer(backend, { requireCompiledModel: () => compiledModel })
  const light = new Light()
  const batch = { light, entities: [entity] }
  const pipeline = new RenderPipeline({ vertexShader: '', fragmentShader: 'shadow' })
  const attach = backend.buffers.attach
  const createBuffer = backend.buffers.create

  backend.buffers.create = () => {
    throw new Error('allocation failed')
  }

  renderer.beginFrame([light], true)
  assert.throws(() => renderer.render(batch, pipeline), /allocation failed/)
  assert.equal(backend.allocations.size, 0)

  backend.buffers.create = createBuffer
  backend.buffers.attach = () => {
    throw new Error('attachment failed')
  }

  renderer.beginFrame([light], true)
  assert.throws(() => renderer.render(batch, pipeline), /attachment failed/)
  assert.equal(backend.allocations.size, 0)

  backend.buffers.attach = attach

  const render = backend.render

  backend.render = () => {
    throw new Error('draw failed')
  }

  assert.throws(() => renderer.render(batch, pipeline), /draw failed/)

  backend.render = render

  renderer.render(batch, pipeline)
  assert.equal(backend.events.length, 1)
  renderer.destroy()
  assert.equal(backend.allocations.size, 0)
})
