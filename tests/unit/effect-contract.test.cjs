require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { it } = require('node:test')
const assert = require('node:assert/strict')
const { createBlurConfiguration, shaderSources } = require('../../packages/graphics/rendering/shader-catalog.ts')

it('preserves authored blur parameters and binds declared uniforms', () => {
  const compiler = { compile() {} }

  for (const isAmbientOcclusion of [false, true]) {
    const effect = createBlurConfiguration(compiler, isAmbientOcclusion)

    assert.equal(effect.parameters.radius, isAmbientOcclusion ? 2 : 6)
    assert.equal(effect.isCameraRequired, isAmbientOcclusion)

    const shader = shaderSources[effect.pipeline.fragmentShader]

    for (const uniform of Object.keys(effect.parameters)) {
      assert.match(shader, new RegExp('uniform\\s+\\w+\\s+' + uniform + '\\s*;'))
    }
  }

  const ambientOcclusion = createBlurConfiguration(compiler, true)

  assert.equal(ambientOcclusion.parameters.ambientOcclusionDepthSharpness, 24)
  assert.equal(ambientOcclusion.parameters.ambientOcclusionNormalSharpness, 16)
})
