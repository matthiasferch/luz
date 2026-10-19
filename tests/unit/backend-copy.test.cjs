require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { it } = require('node:test')
const assert = require('node:assert/strict')
const { WebGL2RenderBackend } = require('@luz/graphics')

function createFixture() {
  const state = { readBuffer: {}, drawBuffer: {}, activeTexture: 7, texture: {}, isScissorEnabled: true }
  const copies = []
  const gl = {
    READ_FRAMEBUFFER_BINDING: 1,
    DRAW_FRAMEBUFFER_BINDING: 2,
    ACTIVE_TEXTURE: 3,
    TEXTURE_BINDING_2D: 4,
    READ_FRAMEBUFFER: 5,
    DRAW_FRAMEBUFFER: 6,
    TEXTURE0: 8,
    TEXTURE_2D: 9,
    SCISSOR_TEST: 10,
    DEPTH_BUFFER_BIT: 11,
    NEAREST: 12,
    getParameter(key) {
      return state[{ 1: 'readBuffer', 2: 'drawBuffer', 3: 'activeTexture', 4: 'texture' }[key]]
    },

    isEnabled() {
      return state.isScissorEnabled
    },

    disable() {
      state.isScissorEnabled = false
    },

    enable() {
      state.isScissorEnabled = true
    },

    bindFramebuffer(target, buffer) {
      state[target === 5 ? 'readBuffer' : 'drawBuffer'] = buffer
    },

    activeTexture(unit) {
      state.activeTexture = unit
    },

    bindTexture(_target, texture) {
      state.texture = texture
    },

    blitFramebuffer(...parameters) {
      copies.push(parameters)
    },

    copyTexSubImage2D(...parameters) {
      copies.push(parameters)
    }
  }
  const backend = Object.assign(Object.create(WebGL2RenderBackend.prototype), { context: gl })

  return { state, gl, backend, copies }
}

it('restores framebuffer and texture bindings without invalidating manager caches', () => {
  const { state, backend, copies } = createFixture()
  const previousState = { ...state }
  const source = { width: 32, height: 16, frameBuffer: {} }

  backend.copyDepth(source, { width: 32, height: 16, frameBuffer: {} })
  assert.deepEqual(state, previousState)
  assert.deepEqual(copies[0], [0, 0, 32, 16, 0, 0, 32, 16, 11, 12])
  backend.copyColorToTexture(source, {})
  assert.deepEqual(state, previousState)
  assert.deepEqual(copies[1], [9, 0, 0, 0, 0, 0, 32, 16])
})
it('restores all borrowed bindings when a copy fails', () => {
  const { state, gl, backend } = createFixture()
  const previousState = { ...state }
  const failCopy = () => {
    throw new Error('copy failed')
  }
  const target = { width: 32, height: 16 }

  gl.blitFramebuffer = failCopy
  gl.copyTexSubImage2D = failCopy

  assert.throws(() => backend.copyDepth(target, target), /copy failed/)
  assert.deepEqual(state, previousState)
  assert.throws(() => backend.copyColorToTexture(target, {}), /copy failed/)
  assert.deepEqual(state, previousState)
})
