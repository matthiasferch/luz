const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const graphicsRoot = path.resolve(__dirname, '../../packages/graphics')
const shader = fs.readFileSync(path.join(graphicsRoot, 'rendering/shaders/composite.fragment.glsl'), 'utf8')
const dilationShader = fs.readFileSync(
  path.join(graphicsRoot, 'rendering/shaders/depth-of-field-dilate.fragment.glsl'),
  'utf8'
)
const prefilterShader = fs.readFileSync(
  path.join(graphicsRoot, 'rendering/shaders/depth-of-field-prefilter.fragment.glsl'),
  'utf8'
)
const layerShader = fs.readFileSync(
  path.join(graphicsRoot, 'rendering/shaders/depth-of-field-layers.fragment.glsl'),
  'utf8'
)
const depthShader = fs.readFileSync(path.join(graphicsRoot, 'rendering/shaders/depth.fragment.glsl'), 'utf8')
const surfaceShader = fs.readFileSync(
  path.join(graphicsRoot, 'rendering/shaders/depth-of-field-surface.fragment.glsl'),
  'utf8'
)
const backingDepthPass = fs.readFileSync(
  path.join(graphicsRoot, 'rendering/pipelines/depth-of-field-backing-depth.pipeline.json'),
  'utf8'
)
const backingAmbientPass = fs.readFileSync(
  path.join(graphicsRoot, 'rendering/pipelines/depth-of-field-backing-ambient.pipeline.json'),
  'utf8'
)
const surfacePass = fs.readFileSync(
  path.join(graphicsRoot, 'rendering/pipelines/depth-of-field-surface.pipeline.json'),
  'utf8'
)
const schema = JSON.parse(
  fs.readFileSync(path.join(graphicsRoot, '../../packages/formats/schemas/camera.schema.json'), 'utf8')
)

describe('Depth of field integration', () => {
  it('uses camera optics for a bounded physical circle of confusion', () => {
    assert.match(shader, /calculateEffectiveFocalLength\(\) \* 0\.001/)
    assert.match(shader, /calculateEffectiveSensorHeight\(\) \* 0\.001/)
    assert.match(shader, /calculateEffectiveFocusDistance\(\)/)
    assert.match(shader, /calculateEffectiveFStop\(\)/)
    assert.match(shader, /max\(depthOfFieldMaximumBlurRadius, 0\.0\)/)
  })
  it('adapts a stable Vogel-disk sample budget to the blur radius', () => {
    assert.match(layerShader, /DEPTH_OF_FIELD_MAXIMUM_SAMPLES = 64/)
    assert.match(layerShader, /ceil\(clamp\(12\.0 \+ radius \* 1\.3, 12\.0, 64\.0\)\)/)
    assert.match(layerShader, /sqrt\(\(float\(index\) \+ 0\.5\) \/ float\(backgroundSampleCount\)\)/)
    assert.match(layerShader, /sqrt\(\(float\(index\) \+ 0\.5\) \/ float\(baseSampleCount\)\)/)
    assert.match(layerShader, /sqrt\(\(float\(index\) \+ 0\.5\) \/ float\(overlaySampleCount\)\)/)
    assert.match(layerShader, /DEPTH_OF_FIELD_GOLDEN_ROTATION/)
    assert.match(layerShader, /calculateSampleRotation\(gl_FragCoord\.xy\)/)
  })
  it('requires both Blender camera authoring and the runtime toggle', () => {
    assert.match(shader, /isDepthOfFieldEnabled && camera\.isDepthOfFieldEnabled/)
  })
  it('resolves foreground and background blur as separate depth-aware layers', () => {
    assert.match(layerShader, /layout\(location = 0\) out vec4 backgroundLayer/)
    assert.match(layerShader, /layout\(location = 1\) out vec4 foregroundLayer/)
    assert.match(layerShader, /isCenterForeground = hasCenterGeometry && centerCircle < -0\.25/)
    assert.match(layerShader, /sampleCircle >= 0\.0/)
    assert.match(layerShader, /smoothstep\(0\.25, 1\.25, -sampleCircle\)/)
    assert.match(layerShader, /foregroundLayer = vec4\(resolvedForeground, resolvedCoverage\)/)
    assert.match(shader, /background \* \(1\.0 - foregroundColor\.a\) \+ foregroundColor\.rgb/)
  })
  it('uses an independent foreground radius so blur remains visible over the sky', () => {
    assert.match(layerShader, /overlaySampleCount = overlayRadius >= 0\.5/)
    assert.match(layerShader, /direction \* diskRadius \* overlayRadius/)
    assert.match(prefilterShader, /depth >= 1\.0 - 1e-6 && sceneSample\.a <= 1e-6\s*\? sampleSky\(textureCoordinates\)/)
    assert.match(layerShader, /hasBackingSky/)
  })
  it('prefers the peeled hidden surface over observed sky when reconstructing a background', () => {
    assert.match(layerShader, /centerBackingRawDepth = texture\(backingDepthTexture, textureCoordinates\)\.r/)
    assert.match(layerShader, /isPeeledCandidate\s*\? sampleBackingScene\(sampleTextureCoordinates\)/)
    assert.match(layerShader, /nearestBackingDepth = min\(nearestBackingDepth, candidateDepth\)/)
    assert.match(layerShader, /hasBackingGeometry = backingGeometryWeight > 1e-4/)
    assert.match(layerShader, /hasBackingSky = backingSkyWeight > 1e-4/)
    assert.ok(
      layerShader.indexOf('hasBackingGeometry') < layerShader.indexOf('hasBackingSky'),
      'geometry must be selected before the sky fallback'
    )
    assert.doesNotMatch(layerShader, /: sampleSky\(textureCoordinates\)/)
  })
  it('renders a full-resolution, PBR-lit second depth layer', () => {
    assert.match(depthShader, /gl_FragCoord\.z <= frontDepth \+ 1e-6/)
    assert.match(depthShader, /applyDepthPeeling\(\)/)
    assert.match(backingDepthPass, /"depthTest": "less"/)
    assert.match(backingAmbientPass, /"depthTest": "equal"/)
  })
  it('dilates foreground blur radii at half resolution so silhouettes can spread', () => {
    assert.match(dilationShader, /DEPTH_OF_FIELD_DILATION_SAMPLES = 25/)
    assert.match(
      dilationShader,
      /maximumRadius = max\(maximumRadius, calculateForegroundRadiusAt\(sampleTextureCoordinates\)\)/
    )
  })
  it('prefilters HDR energy and evaluates both blur layers at half resolution', () => {
    assert.match(
      prefilterShader,
      /accumulateSceneSample\(\s*textureCoordinates \+ halfSourceTexel \* vec2\(-1\.0, -1\.0\)/
    )
    assert.match(prefilterShader, /isDepthCompatible\(anchorDepth, sampleDepth\)/)
    assert.match(prefilterShader, /isAnchorSky == isSampleSky/)
    assert.match(prefilterShader, /color \/ weight : sampleScene\(textureCoordinates\)/)
    assert.match(layerShader, /textureSize\(prefilteredSceneTexture, 0\)/)
  })
  it('uses depth-guided background upsampling without suppressing foreground bleed', () => {
    assert.match(shader, /sampleDepthOfFieldBackground/)
    assert.match(shader, /relativeDepthDifference/)
    assert.match(shader, /depthWeight = exp\(-6\.0 \* relativeDepthDifference\)/)
    assert.match(shader, /texelFetch\(depthOfFieldBackgroundTexture, coordinate, 0\)/)
    assert.match(shader, /foregroundColor = texture\(depthOfFieldForegroundTexture, textureCoordinates\)/)
  })
  it('uses smooth focus transitions and a deterministic sampling pattern', () => {
    assert.match(layerShader, /smoothstep\(0\.25, 1\.25, -centerCircle\)/)
    assert.match(layerShader, /calculateSampleRotation\(gl_FragCoord\.xy\)/)
    assert.doesNotMatch(layerShader, /elapsedTime/)
  })
  it('keeps the center foreground surface opaque while compositing a closer blurred overlay', () => {
    assert.match(layerShader, /baseColorSum \+= sampleScene\(sampleTextureCoordinates\) \* weight/)
    assert.match(layerShader, /overlayColorSum \+= sampleScene\(sampleTextureCoordinates\) \* weight/)
    assert.match(
      layerShader,
      /resolvedForeground = isCenterForeground\s*\? mix\(resolvedBaseColor, resolvedOverlayColor, overlayCoverage\)\s*:\s*resolvedOverlayColor \* overlayCoverage/
    )
    assert.match(layerShader, /resolvedCoverage = isCenterForeground \? 1\.0 : overlayCoverage/)
  })
  it('keeps opaque scene objects separate through an ownership buffer', () => {
    assert.match(layerShader, /overlayRadius = texture\(foregroundRadiusTexture, textureCoordinates\)\.r/)
    assert.match(layerShader, /texture\(surfaceOwnershipTexture, textureCoordinates\)/)
    assert.match(layerShader, /isDifferentSurface = !isSameSurface\(sampleSurface, centerSurface\)/)
    assert.match(layerShader, /isInFront = !hasCenterGeometry \|\| sampleDepth < centerDepth - separation/)
    assert.match(layerShader, /isSameSurface\(sampleSurface, overlaySurface\)/)
    assert.doesNotMatch(layerShader, /foregroundDepthBand/)
    assert.match(surfaceShader, /outColor = vec4\(depthOfFieldSurfaceId, 1\.0\)/)
    assert.match(surfaceShader, /isMaterialAlphaMasked && materialSample\.alpha < materialAlphaCutoff/)
    assert.match(surfacePass, /"depthTest": "equal"/)
    assert.match(surfacePass, /"depthMask": false/)
    assert.match(surfacePass, /"vertexShader": "\.\/assets\/shaders\/scene\.vertex\.glsl"/)
  })
  it('provides runtime optical overrides and a focus-region visualization', () => {
    assert.match(shader, /isDepthOfFieldOverridden/)
    assert.match(shader, /visualizeCircleOfConfusion/)
    assert.match(shader, /isDepthOfFieldVisualized && !isVolumetricLightVisualized/)
    assert.doesNotMatch(shader, /isDepthOfFieldVisualized && isDepthOfFieldEnabled/)
    assert.match(shader, /Green marks the focused band\. Blue is foreground blur; orange is background blur\./)
  })
  it('visualizes scene depth with a useful logarithmic false-color range', () => {
    assert.match(shader, /vec3 visualizeSceneDepth\(float depth, vec2 clipPlanes\)/)
    assert.match(shader, /log2\(max\(linearDepth, nearPlane\) \/ nearPlane\)/)
    assert.match(shader, /nearColor = vec3\(0\.1, 0\.4, 1\.0\)/)
    assert.match(shader, /middleColor = vec3\(0\.1, 1\.0, 0\.2\)/)
    assert.match(shader, /farColor = vec3\(1\.0, 0\.3, 0\.05\)/)
    assert.match(shader, /visualizeSceneDepth\(depth, clipPlanes\)/)
    assert.doesNotMatch(shader, /linearDepth \/ clipPlanes\.y/)
  })
  it('declares optional compatible camera schema fields', () => {
    for (const property of ['isDepthOfFieldEnabled', 'focusDistance', 'focalLength', 'sensorHeight', 'fStop']) {
      assert.ok(schema.properties[property], `missing camera schema property ${property}`)
      assert.ok(!schema.required.includes(property), `${property} must remain optional for older scenes`)
    }
  })
})
