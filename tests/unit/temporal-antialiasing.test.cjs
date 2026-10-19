const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const read = (relativePath) =>
  require('node:fs').readFileSync(
    require('node:path').resolve(__dirname, '../../packages/graphics', relativePath),
    'utf8'
  )
const motionVertex = read('rendering/shaders/motion-vectors.vertex.glsl')
const motionFragment = read('rendering/shaders/motion-vectors.fragment.glsl')
const temporalShader = read('rendering/shaders/temporal-antialiasing.fragment.glsl')
const motionPass = read('rendering/pipelines/motion-vectors.pipeline.json')

describe('Motion vectors and temporal antialiasing', () => {
  it('tracks previous camera, object, and skeletal transforms', () => {
    assert.match(motionVertex, /previousViewProjectionMatrix \* previousModelMatrix \* previousPosition/)
    assert.match(motionVertex, /getBoneMatrix\(previousBoneTexture, boneIndex\)/)
    assert.match(motionFragment, /currentNormalizedDeviceCoordinates - previousNormalizedDeviceCoordinates\.xy/)
    assert.match(motionFragment, /temporalSurfaceId \+ 0\.5 \* temporalReactive/)
  })
  it('renders material-aware velocities only at visible depth', () => {
    assert.match(motionFragment, /evaluateMaterial\(materialContext\)/)
    assert.match(motionFragment, /isMaterialAlphaMasked && materialSample\.alpha < materialAlphaCutoff/)
    assert.match(motionPass, /"depthTest": "lessEqual"/)
    assert.match(motionPass, /"depthMask": false/)
    assert.match(motionFragment, /isMaterialAlphaBlended && materialSample\.alpha <= 1\.0 \/ 255\.0/)
  })
  it('uses an eight-sample Halton jitter without treating it as scene motion', () => {
    assert.match(motionVertex, /v_currentClipPosition = currentViewProjectionMatrix \* v_worldPosition/)
    assert.match(motionVertex, /gl_Position = camera\.projectionMatrix \* v_cameraPosition/)
  })
  it('rejects disoccluded history and clips valid history to the current neighborhood', () => {
    assert.match(temporalShader, /previousTextureCoordinates = textureCoordinates - velocity/)
    assert.match(temporalShader, /2\.0 \/ 65535\.0 \+ 2\.0 \* fwidth\(currentLogDepth\)/)
    assert.match(temporalShader, /historyMetadataTexture/)
    assert.match(temporalShader, /isHistoryTexelValid/)
    assert.match(temporalShader, /depthDifference < depthTolerance/)
    assert.match(temporalShader, /clipHistoryToNeighborhood/)
    assert.match(temporalShader, /mean - 1\.25 \* standardDeviation/)
    assert.match(temporalShader, /accumulatedFrames \/ \(accumulatedFrames \+ 1\.0\)/)
    assert.match(temporalShader, /min\(0\.97, accumulatedFrames/)
    assert.match(temporalShader, /historyColor = clipHistoryToNeighborhood/)
    assert.doesNotMatch(temporalShader, /mix\(historySample\.rgb, clippedHistory/)
    assert.match(temporalShader, /mix\(0\.98, 1\.0, colorConfidence\)/)
    assert.match(
      temporalShader,
      /fragmentColor = vec4\(clamp\(resolvedColor, vec3\(-65504\.0\), vec3\(65504\.0\)\), currentLogDepth\)/
    )
  })
  it('reprojects the sky as a direction without camera-translation parallax', () => {
    assert.match(temporalShader, /bool isSky = currentRawDepth >= 1\.0 - 1e-6/)
    assert.match(temporalShader, /worldDirectionAtInfinity = vec4\(worldDirection, 0\.0\)/)
    assert.match(temporalShader, /previousViewProjectionMatrix \* worldDirectionAtInfinity/)
    assert.match(temporalShader, /isSky\s*\? 1\.0\s*:\s*encodeLogarithmicDepth/)
  })
  it('rejects object history when motion exposes another surface or the sky', () => {
    assert.match(temporalShader, /bool hasSurfaceMotion = motionSample\.a >= 1\.0/)
    assert.match(temporalShader, /currentSurfaceId = hasSurfaceMotion \? floor\(motionSample\.a \+ 1e-4\) : 0\.0/)
    assert.match(temporalShader, /isStationarySurface = hasSurfaceMotion && isStationarySample/)
    assert.match(temporalShader, /isSameSurface\(decodeHistorySurfaceId\(metadata\), expectedSurfaceId\)/)
    assert.match(temporalShader, /&& depthDifference < depthTolerance/)
    assert.doesNotMatch(temporalShader, /isStationarySurface \|\| depthDifference < depthTolerance/)
  })
  it('recovers ownership-matched static edge history without accepting stale geometry', () => {
    assert.match(temporalShader, /bool findClosestSurfaceHistory\(/)
    assert.match(temporalShader, /expectedSurfaceId/)
    assert.match(temporalShader, /closestSample = texelFetch\(historyTexture, pixel, 0\)/)
    assert.match(temporalShader, /candidateDepthDifference < closestDepthDifference/)
    assert.match(temporalShader, /isStationarySurface && !isHistorySampleValid/)
    assert.match(temporalShader, /isHistorySampleValid = findClosestSurfaceHistory\(/)
  })
  it('stabilizes stationary jitter while reducing history at moving discontinuities', () => {
    assert.match(motionFragment, /materialTemporalReactive/)
    assert.doesNotMatch(motionFragment, /specularResponse/)
    assert.match(motionFragment, /emissionResponse/)
    assert.match(temporalShader, /calculateMotionBoundaryResponse/)
    assert.match(temporalShader, /materialReactive \* movingSurface/)
    assert.match(temporalShader, /\? smoothstep\(0\.08, 0\.45, stationaryAppearanceDifference\)/)
    assert.match(temporalShader, /motionHistoryCap = isStationarySample\s*\? 1\.0/)
    assert.match(temporalShader, /maximumHistoryWeight = isStationarySample \? 0\.97 : 0\.95/)
    assert.match(temporalShader, /pow\(1\.0 - reactive, 2\.0\)/)
  })
  it('filters color only after validating each contributing history texel', () => {
    assert.doesNotMatch(temporalShader, /texture\(history(?:Metadata)?Texture,/)
    assert.match(temporalShader, /texelFetch\(historyMetadataTexture, pixel, 0\)/)
    assert.match(temporalShader, /historySample \+= texelFetch\(historyTexture, pixel, 0\) \* weight/)
    assert.match(temporalShader, /historySample \/= totalWeight/)
    assert.match(temporalShader, /if \(totalWeight <= 1e-6\) \{\s*return false;\s*\}/)
  })
})
