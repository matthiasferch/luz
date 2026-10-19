const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const read = (relativePath) =>
  require('node:fs').readFileSync(
    require('node:path').resolve(__dirname, '../../packages/graphics', relativePath),
    'utf8'
  )
const flow = JSON.parse(read('rendering/flows/scene.flow.json'))
const ambientOcclusionShader = read('rendering/shaders/ambient-occlusion.fragment.glsl')
const normalShader = read('rendering/shaders/ambient-occlusion-normal.fragment.glsl')
const temporalShader = read('rendering/shaders/ambient-occlusion-temporal.fragment.glsl')
const blurShader = read('rendering/shaders/ambient-occlusion-blur.fragment.glsl')
const upsampleShader = read('rendering/shaders/ambient-occlusion-upsample.fragment.glsl')
const ambientShader = read('rendering/shaders/ambient.fragment.glsl')
const lightingShader = read('rendering/shaders/physically-based-lighting.fragment.glsl')
const compositeShader = read('rendering/shaders/composite.fragment.glsl')
const depthVertexShader = read('rendering/shaders/depth.vertex.glsl')

describe('Screen-space ambient occlusion', () => {
  it('establishes opaque depth before ambient shading and AO evaluation', () => {
    assert.deepEqual(Object.keys(flow.pipelines).slice(0, 2), ['depth', 'ambient'])
    assert.equal(flow.pipelines.ambient.depthTest, 'equal')
    assert.equal(flow.pipelines.ambient.depthMask, false)
    assert.match(depthVertexShader, /cameraPosition = camera\.viewMatrix \* worldPosition/)
    assert.match(depthVertexShader, /camera\.projectionMatrix \* cameraPosition/)
  })
  it('uses half-resolution horizon sampling with tunable range and thickness', () => {
    assert.match(ambientOcclusionShader, /calculateHorizonOcclusion/)
    assert.match(ambientOcclusionShader, /distanceToSample >= ambientOcclusionRadius/)
    assert.match(ambientOcclusionShader, /normalDistance - ambientOcclusionThickness/)
    assert.match(ambientOcclusionShader, /stepIndex >= ambientOcclusionStepCount/)
    assert.match(ambientOcclusionShader, /directionIndex >= ambientOcclusionDirectionCount/)
  })
  it('temporally rejects disocclusions and spatially preserves surface edges', () => {
    assert.match(temporalShader, /previousTextureCoordinates = textureCoordinates - velocity/)
    assert.match(
      temporalShader,
      /depthDifference = abs\(decodeAmbientOcclusionUnsigned16\(metadata\.ba\) \/ 65535\.0 - motion\.b\)/
    )
    assert.match(temporalShader, /motion\.a >= 1\.0/)
    assert.match(normalShader, /encodeOctahedralNormal\(worldNormal\)/)
    assert.match(ambientOcclusionShader, /mat3\(camera\.viewMatrix\) \* centerNormalWorld/)
    assert.match(temporalShader, /dot\(currentNormal, historyNormal\) <= 0\.85/)
    assert.match(temporalShader, /clamp\(rawHistory, neighborhoodMinimum, neighborhoodMaximum\)/)
    assert.match(temporalShader, /texelFetch\(historyMetadataTexture, pixel, 0\)/)
    assert.match(temporalShader, /appearanceChange/)
    assert.match(blurShader, /relativeDepth/)
    assert.match(blurShader, /dot\(sampleNormal, centerNormal\)/)
    assert.match(upsampleShader, /guideWeight/)
  })
  it('applies screen occlusion to diffuse lighting without dimming directional reflections', () => {
    assert.match(ambientShader, /diffuseVisibility = materialVisibility \* screenVisibility/)
    assert.match(ambientShader, /diffuseVisibility \* ambientBrightness/)
    assert.match(ambientShader, /pow\(materialVisibility, 4\.0\) \+ normalViewDot/)
    assert.match(ambientShader, /if \(isAmbientOcclusionVisualized\)/)
    assert.match(lightingShader, /Material AO is visualized once by the ambient pass/)
    assert.match(lightingShader, /diffuse \* directDiffuseVisibility \+ specular/)
    assert.match(lightingShader, /isScreenOcclusionEnabled/)
    assert.doesNotMatch(lightingShader, /specular \*= specOcc/)
    assert.doesNotMatch(compositeShader, /color \*= texture\(.*Occlusion/)
    assert.match(compositeShader, /isScreenOcclusionVisualized/)
  })
})
