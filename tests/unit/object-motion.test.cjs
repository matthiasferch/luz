const { it } = require('node:test')
const assert = require('node:assert/strict')

require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { createEffectFixture } = require('../fixtures/effect-fixture.cjs')

it('object-only vectors freeze the camera while retaining object and bone history', () => {
  const instance = createEffectFixture(),
    calls = []
  const batch = { transform: { modelMatrix: {} }, model: { source: { boneMatrices: {} } } }
  const previousModel = {},
    previousBones = {}

  instance.previousModelMatrices = new Map([[batch.transform, previousModel]])
  instance.previousBoneMatrices = new Map([[batch.model, previousBones]])
  instance.temporalAntialiasing = {
    currentViewProjectionMatrix: { frame: 'current' },
    previousViewProjectionMatrix: { frame: 'previous' }
  }
  instance.motionBlur = { vectorTarget: { kind: 'full' }, objectTarget: { kind: 'object' } }
  instance.resolveTemporalSurfaceId = () => 2
  instance.frameRenderer = { renderQueue: (queue, _pipeline, context) => calls.push({ queue, ...context }) }

  instance.renderMotionVectors([batch])
  instance.renderMotionVectors([batch], true)
  assert.equal(calls[0].target, instance.motionBlur.vectorTarget)
  assert.equal(
    calls[0].uniforms.previousViewProjectionMatrix,
    instance.temporalAntialiasing.previousViewProjectionMatrix
  )
  assert.equal(calls[1].target, instance.motionBlur.objectTarget)
  assert.equal(
    calls[1].uniforms.previousViewProjectionMatrix,
    instance.temporalAntialiasing.currentViewProjectionMatrix
  )

  for (const call of calls) {
    assert.equal(call.uniforms.currentViewProjectionMatrix, instance.temporalAntialiasing.currentViewProjectionMatrix)
    assert.equal(call.queue.batches[0].uniforms.previousModelMatrix, previousModel)
    assert.equal(call.queue.batches[0].uniforms.previousBoneMatrices, previousBones)
  }

  instance.previousModelMatrices.clear()
  instance.previousBoneMatrices.clear()
  instance.renderMotionVectors([batch], true)
  assert.equal(calls[2].queue.batches[0].uniforms.previousModelMatrix, batch.transform.modelMatrix)
  assert.equal(calls[2].queue.batches[0].uniforms.previousBoneMatrices, batch.model.source.boneMatrices)
})
it('motion tile selection and resolve use the selected velocity source together', () => {
  const instance = createEffectFixture(),
    calls = []

  instance.motionBlur = {}
  instance.temporalAntialiasing = {
    currentViewProjectionMatrix: {},
    previousViewProjectionMatrix: {}
  }

  for (const name of [
    'vectorTexture',
    'objectTexture',
    'tileVelocityTexture',
    'tileVelocityTarget',
    'neighborVelocityTexture',
    'neighborVelocityTarget',
    'texture',
    'target'
  ]) {
    instance.motionBlur[name] = { name }
  }

  instance.frameRenderer = { renderQueue: (_queue, _pipeline, context) => calls.push(context) }

  for (const isCameraBlurEnabled of [false, true, false]) {
    calls.length = 0
    instance.renderingSettings = { motionBlur: { isCameraBlurEnabled, maximumRadius: 32 } }

    assert.equal(instance.renderMotionBlur({}, { width: 32, height: 32 }), instance.motionBlur.texture)

    const expected = isCameraBlurEnabled ? instance.motionBlur.vectorTexture : instance.motionBlur.objectTexture

    assert.equal(calls[0].uniforms.motionVectorTexture, expected)
    assert.equal(calls[2].uniforms.motionVectorTexture, expected)
    assert.equal(calls[2].uniforms.isCameraBlurEnabled, isCameraBlurEnabled)
  }
})
