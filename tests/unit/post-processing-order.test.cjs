const { it } = require('node:test')
const assert = require('node:assert/strict')

require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { PostProcessing } = require('../../packages/graphics/rendering/post-processing.ts')

const render = function (options) {
  const context = {
    renderingSettings: this.renderingSettings,
    backend: this.backend,
    camera: this.camera,
    viewport: this.canvas,
    fullscreenModel: {},
    frameRenderer: this.frameRenderer,
    elapsedTime: 0,
    targets: this,
    canvasTarget: this.canvasTarget,
    compositePipeline: this.compositePipeline,
    presentPipeline: this.presentPipeline,
    fxaaPipeline: this.fxaaPipeline,
    occlusion: { ambientOcclusion: this.ambientOcclusion },
    volume: { volumetricLighting: this.volumetricLighting },
    focus: {
      depthOfField: this.depthOfField,
      depthOfFieldDilatePipeline: this.depthOfFieldDilatePipeline,
      depthOfFieldPrefilterPipeline: this.depthOfFieldPrefilterPipeline,
      depthOfFieldLayersPipeline: this.depthOfFieldLayersPipeline
    },
    bloomEffect: {
      bloom: this.bloom,
      bloomExtractPipeline: this.bloomExtractPipeline,
      bloomDownsamplePipeline: this.bloomDownsamplePipeline,
      bloomUpsamplePipeline: this.bloomUpsamplePipeline
    },
    motion: { renderMotionBlur: this.renderMotionBlur.bind(this) },
    history: { resolveTemporalAntialiasing: this.resolveTemporalAntialiasing.bind(this) },
    environment: { calculateEnvironmentRotation: () => 0 }
  }

  const processing = new PostProcessing(context)

  processing.beginFrame(context)
  processing.render({
    ...options,
    isMotionVisualizationEnabled: false,
    isDepthVisualized: options.isDebugViewActive,
    isScreenOcclusionVisualized: false,
    isVolumetricLightingEnabled: true
  })
}

for (const mode of ['taa', 'fxaa', 'none', 'debug', 'fxaa-only', 'taa-only']) {
  it(`${mode} preserves HDR order and avoids texture feedback`, () => {
    const calls = []
    const queue = { batches: [], sortByMaterialThenDepth() {} }
    const instance = {
      renderingSettings: { bloom: { isEnabled: true }, depthOfField: { isEnabled: true }, debug: {} },
      backend: { defaultTexture: {} },
      ambientOcclusion: {},
      volumetricLighting: { texture: {}, depthTexture: {} },
      camera: {},
      canvas: { height: 8 },
      modelCache: { compiler: { requireCompiledModel: () => ({}) } },
      calculateEnvironmentRotation: () => 0,

      resolveTemporalAntialiasing(_queue, input) {
        calls.push({ pipeline: 'taa', input })

        return this.historyTexture
      },

      renderMotionBlur(_queue, input) {
        calls.push({ pipeline: 'blur', input })

        return this.motionBlur.texture
      },
      frameRenderer: {
        ensureQueue: () => queue,

        renderQueue(_queue, pipeline, context) {
          calls.push({ pipeline, ...context })

          const inputs = pipeline === 'composite' ? ['sceneTexture'] : ['baseTexture', 'sceneTexture']

          for (const key of inputs) {
            if (context.uniforms[key]) {
              assert.notEqual(context.target.texture, context.uniforms[key], `${pipeline} feedback on ${key}`)
            }
          }
        }
      }
    }

    for (const prefix of [
      'scene',
      'linearScene',
      'composite',
      'history',
      'motionBlur',
      'canvas',
      'depthOfFieldPrefilter',
      'depthOfFieldLayer',
      'depthOfFieldBacking',
      'depthOfFieldBackingDepth',
      'depthOfFieldSurface'
    ]) {
      instance[prefix + 'Texture'] = { name: prefix }
      instance[prefix + 'Target'] = { texture: instance[prefix + 'Texture'], width: 8, height: 8 }
    }

    instance.bloom = { levels: [{ name: 'bloom0' }, { name: 'bloom1' }] }
    instance.bloom.targets = instance.bloom.levels.map((texture) => ({ texture, width: 4, height: 4 }))
    instance.depthOfField = {}
    instance.depthOfField.radiusTextures = [{}, {}]
    instance.depthOfField.radiusTargets = [
      { width: 4, height: 4 },
      { width: 4, height: 4 }
    ]
    instance.depthOfField.layerTextures = [{}, {}]
    instance.depthOfField.prefilterTexture = instance.depthOfFieldPrefilterTexture
    instance.depthOfField.prefilterTarget = instance.depthOfFieldPrefilterTarget
    instance.depthOfField.layerTarget = instance.depthOfFieldLayerTarget
    instance.depthOfField.backingTexture = instance.depthOfFieldBackingTexture
    instance.depthOfField.backingDepthTexture = instance.depthOfFieldBackingDepthTexture
    instance.depthOfField.backingTarget = instance.depthOfFieldBackingTarget
    instance.depthOfField.surfaceTexture = instance.depthOfFieldSurfaceTexture
    instance.depthOfField.surfaceTarget = instance.depthOfFieldSurfaceTarget
    instance.motionBlur = { texture: instance.motionBlurTexture }

    if (mode.endsWith('-only')) {
      instance.renderingSettings.bloom.isEnabled = false
    }

    for (const prefix of [
      'composite',
      'present',
      'fxaa',
      'bloomExtract',
      'bloomDownsample',
      'bloomUpsample',
      'depthOfFieldDilate',
      'depthOfFieldPrefilter',
      'depthOfFieldLayers'
    ]) {
      instance[prefix + 'Pipeline'] = prefix
    }

    const opticalEffects = mode !== 'debug' && !mode.endsWith('-only')

    render.call(instance, {
      isTemporalAntialiasingEnabled: mode.startsWith('taa'),
      isAntialiasingEnabled: mode !== 'none',
      isMotionBlurEnabled: opticalEffects,
      isDepthOfFieldEnabled: opticalEffects,
      isDebugViewActive: mode === 'debug'
    })

    const stages = calls.map((call) => call.pipeline)

    assert.equal(stages[0], 'composite')
    assert.equal(calls[0].uniforms.isToneMappingEnabled, false)
    assert.equal(calls[0].uniforms.isGammaCorrectionEnabled, false)
    assert.equal(calls[0].uniforms.isDepthOfFieldEnabled, false)

    if (mode.endsWith('-only')) {
      assert.deepEqual(
        stages,
        mode === 'fxaa-only' ? ['composite', 'present', 'fxaa'] : ['composite', 'taa', 'present']
      )

      return
    }

    if (mode === 'debug') {
      assert.deepEqual(stages, ['composite', 'present'])
      assert.equal(calls[1].uniforms.isToneMappingEnabled, false)
      assert.equal(calls[1].uniforms.isGammaCorrectionEnabled, false)

      return
    }

    if (mode === 'taa') {
      assert.ok(stages.indexOf('taa') < stages.indexOf('depthOfFieldPrefilter'))
    }

    const stabilized = mode === 'taa' ? instance.historyTexture : instance.linearSceneTexture
    const bloom = calls.find((call) => call.pipeline === 'bloomExtract')

    assert.equal(bloom.uniforms.baseTexture, stabilized)
    assert.equal(bloom.uniforms.isVolumetricLightingEnabled, false, 'volume is already in stabilized input')

    const depthOfField = calls.find((call) => call.pipeline === 'depthOfFieldPrefilter')

    assert.equal(depthOfField.uniforms.sceneTexture, stabilized)

    const optical = calls.filter((call) => call.pipeline === 'composite')[1]

    assert.equal(optical.uniforms.bloomTexture, instance.bloom.levels[0], 'first-frame bloom is available')
    assert.equal(optical.uniforms.isVolumetricLightingEnabled, false)
    assert.ok(stages.indexOf('depthOfFieldLayers') < stages.indexOf('blur'))
    assert.ok(stages.indexOf('blur') < stages.indexOf('present'))

    const presentation = calls.find((call) => call.pipeline === 'present')

    assert.equal(presentation.uniforms.isToneMappingEnabled, true)
    assert.equal(presentation.uniforms.isGammaCorrectionEnabled, true)
    assert.equal(stages.at(-1), mode === 'fxaa' ? 'fxaa' : 'present')
  })
}
