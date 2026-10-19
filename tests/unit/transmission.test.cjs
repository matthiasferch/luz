const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const assets = path.resolve(__dirname, '../../packages/graphics/rendering')

describe('Transmission integration', () => {
  it('writes nearest-surface depth in both pipeline definitions', () => {
    const flow = JSON.parse(fs.readFileSync(path.join(assets, 'flows/scene.flow.json'), 'utf8'))
    const pipeline = JSON.parse(fs.readFileSync(path.join(assets, 'pipelines/transmission.pipeline.json'), 'utf8'))

    assert.equal(flow.pipelines.transmission.depthMask, true)
    assert.equal(pipeline.depthMask, true)
    assert.equal(flow.pipelines.transmission.depthTest, 'lessEqual')
    assert.equal(pipeline.depthTest, 'lessEqual')
  })
  it('preserves graph emission in the replacing transmission pass', () => {
    const shader = fs.readFileSync(path.join(assets, 'shaders/transmission.fragment.glsl'), 'utf8')

    assert.match(shader, /color\s*\+=\s*materialSample\.emission\s*;/)
    assert.ok(
      shader.indexOf('color += materialSample.emission;') < shader.indexOf('outColor = vec4(color, 1.0);'),
      'emission must be included before the final transmission color is written'
    )
  })
  it('blends refraction with the material PBR lighting rather than raw albedo', () => {
    const shader = fs.readFileSync(path.join(assets, 'shaders/transmission.fragment.glsl'), 'utf8')

    assert.match(shader, /uniform sampler2D transmissionSurfaceTexture;/)
    assert.match(shader, /texture\(transmissionSurfaceTexture, screenTextureCoordinates\)/)
    assert.match(shader, /mix\(litSurface, glass, transmission\)/)
    assert.doesNotMatch(shader, /mix\(tint, glass, transmission\)/)
  })
  it('combines planar reflection with refraction and volume absorption', () => {
    const shader = fs.readFileSync(path.join(assets, 'shaders/transmission.fragment.glsl'), 'utf8')

    assert.match(shader, /uniform bool isPlanarReflectionEnabled;/)
    assert.match(shader, /texture\(planarReflectionTexture, reflectionCoordinates\)/)
    assert.match(shader, /texture\(blurredPlanarReflectionTexture, reflectionCoordinates\)/)
    assert.match(shader, /materialSample\.specularLevel \* 2\.0/)
    assert.match(shader, /texture\(reflectanceLookupTexture, vec2\(normalViewDot, roughness\)\)/)
    assert.match(shader, /planarReflectionIntensity \* planarReflection\.a \* roughnessFade \* planarVisibility/)
    assert.match(shader, /mix\(transmitted, reflected, reflectionResponse\)/)
    assert.match(shader, /exp\(-extinction \* max\(pathLength, 0\.0\)\)/)
  })
  it('softens transmissive intersections without changing framebuffer alpha', () => {
    const shader = fs.readFileSync(path.join(assets, 'shaders/transmission.fragment.glsl'), 'utf8')

    assert.match(shader, /materialTransmissionEdgeFade/)
    assert.match(shader, /smoothstep\(0\.0, edgeWidth, depthGap\)/)
    assert.match(
      shader,
      /mix\(\s*screenTextureCoordinates,\s*refractedTextureCoordinates,\s*intersectionFade \* refractionValidity\s*\)/
    )
    assert.match(shader, /mix\(undistortedBackground, color, intersectionFade\)/)
    assert.match(shader, /outColor = vec4\(color, 1\.0\)/)
  })
})
