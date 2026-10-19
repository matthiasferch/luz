require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { it } = require('node:test')
const assert = require('node:assert/strict')
const { createBackend } = require('../fixtures/renderer-backend.cjs')
const { MotionBlur } = require('../../packages/graphics/rendering/motion-blur-effect.ts')
const { BloomEffect } = require('../../packages/graphics/rendering/bloom-effect.ts')

it('effect destruction releases its allocations without releasing another effect or borrowed depth', () => {
  const backend = createBackend()
  const viewport = { width: 64, height: 48 }
  const depthTexture = backend.textures.create({ ...viewport, format: 'depth' })
  const motion = new MotionBlur({ backend, viewport })
  const bloom = new BloomEffect({ backend, viewport })

  motion.resize(depthTexture)

  const motionAllocations = [...backend.allocations]

  bloom.prepareBloomResources(true)
  assert.ok(backend.allocations.size > motionAllocations.length)
  bloom.destroy()
  bloom.destroy()
  assert.deepEqual([...backend.allocations], motionAllocations)
  motion.destroy()
  motion.destroy()
  assert.deepEqual([...backend.allocations], [depthTexture])
})
it('an effect releases partially allocated targets after allocation failure', () => {
  const backend = createBackend()
  const effect = new BloomEffect({ backend, viewport: { width: 64, height: 48 } })

  backend.buffers.attach = () => {
    throw new Error('attachment failed')
  }

  assert.throws(() => effect.prepareBloomResources(true), /attachment failed/)
  effect.destroy()
  assert.equal(backend.allocations.size, 0)
})
