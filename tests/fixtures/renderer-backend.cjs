const assert = require('node:assert/strict')
const { RenderStatistics } = require('@luz/graphics')

function createBackend() {
  const allocations = new Set()
  const drawCalls = []
  const events = []
  const attachments = new Map()

  let activeTarget
  let activePipeline
  let activeUniforms = {}

  const createResource = (options = {}) => {
    const resource = { width: 1, height: 1, ...options }

    allocations.add(resource)

    return resource
  }

  const destroyResource = (resource) => {
    assert.ok(allocations.delete(resource), 'Resource released exactly once')
  }
  const backend = {
    allocations,
    drawCalls,
    events,
    attachments,
    maximumTextureUnits: 32,
    defaultTexture: {},
    defaultMaterial: { graphSource: '', graphTopology: 'default' },
    statistics: new RenderStatistics(),
    textures: { create: createResource, update() {}, destroy: destroyResource },
    buffers: {
      create: () => createResource(),

      attach(buffer, texture, attachment) {
        const entries = attachments.get(buffer) ?? new Map()

        entries.set(attachment, texture)
        attachments.set(buffer, entries)
      },
      destroy: destroyResource
    },
    primitives: { create: (_mesh, material) => createResource({ material }), destroy: destroyResource },
    shaders: { create: () => createResource(), destroy: destroyResource },
    programs: { create: () => createResource(), destroy: destroyResource },
    bindTarget(target) {
      activeTarget = target
    },

    bindPipeline(pipeline) {
      activePipeline = pipeline
      activeUniforms = {}
    },

    clear() {},

    resetMaterialBinding() {},

    bindCameraUniforms() {},

    bindLightUniforms() {},

    bindUniforms(_program, uniforms) {
      Object.assign(activeUniforms, uniforms)
    },

    render(...parameters) {
      drawCalls.push(parameters)
      events.push({
        pipeline: activePipeline.fragmentShader,
        target: activeTarget,
        uniforms: { ...activeUniforms },
        parameters
      })
    },

    copyDepth() {},

    copyColorToTexture() {}
  }

  return backend
}

exports.createBackend = createBackend
