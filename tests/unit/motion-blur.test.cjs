const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const read = (relativePath) =>
  require('node:fs').readFileSync(
    require('node:path').resolve(__dirname, '../../packages/graphics', relativePath),
    'utf8'
  )
const tileShader = read('rendering/shaders/motion-blur-tile.fragment.glsl')
const neighborShader = read('rendering/shaders/motion-blur-neighbor.fragment.glsl')
const motionBlurShader = read('rendering/shaders/motion-blur.fragment.glsl')

describe('Motion blur integration', () => {
  it('dilates velocity through tile-max and neighbor-max passes', () => {
    assert.match(tileShader, /MOTION_BLUR_TILE_SIZE = 16/)
    assert.match(tileShader, /dot\(velocityPixels, velocityPixels\)/)
    assert.match(neighborShader, /for \(int y = -2; y <= 2; \+\+y\)/)
    assert.match(neighborShader, /0\.5 \* maximumRadius \/ 16\.0/)
    assert.match(motionBlurShader, /ivec2\(gl_FragCoord\.xy\) \/ 16/)
  })
  it('uses adaptive, bounded sampling with depth and motion rejection', () => {
    assert.match(motionBlurShader, /shutterAngle \/ 360\.0/)
    assert.match(motionBlurShader, /blurRadius > maximumRadius/)
    assert.match(motionBlurShader, /clamp\(maximumSamples, 2, 32\)/)
    assert.match(motionBlurShader, /calculateVelocitySimilarity/)
    assert.match(motionBlurShader, /sampleLogDepth <= currentLogDepth \+ depthTolerance/)
    assert.match(motionBlurShader, /worldDirectionAtInfinity = vec4\(worldDirection, 0\.0\)/)
  })
})
