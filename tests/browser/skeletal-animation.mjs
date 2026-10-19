import {
  WebGL2RenderBackend,
  Model,
  Transform,
  Matrix4,
  defaultMaterialGraphSource,
  EntityLoader,
  ModelLoader
} from '/engine.mjs'

const results = document.querySelector('#results')
const messages = []
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

try {
  const gl = document.querySelector('#canvas').getContext('webgl2', { antialias: false })

  assert(gl && gl.getExtension('EXT_color_buffer_float'), 'WebGL2 float targets unavailable')

  const backend = new WebGL2RenderBackend(gl)
  const identity = Array.from(Matrix4.createIdentity())
  const loadSource = async (name) => (await fetch(`/graphics/rendering/shaders/${name}`)).text()
  const [definitions, uniforms, attributes, reconstruction] = await Promise.all(
    [
      'common/definitions.glsl',
      'common/uniforms.glsl',
      'common/attributes.glsl',
      'utilities/reconstruct-depth.glsl'
    ].map(loadSource)
  )
  const programs = {}

  for (const pass of ['scene', 'depth', 'motion-vectors']) {
    const vertex = backend.shaders.create('vertex', await loadSource(`${pass}.vertex.glsl`), [
      definitions,
      uniforms,
      attributes
    ])
    const fragment = backend.shaders.create(
      'fragment',
      pass === 'scene'
        ? 'out vec4 color; void main() { color = vec4(1.0); }'
        : await loadSource(`${pass}.fragment.glsl`),
      [definitions, uniforms, reconstruction, defaultMaterialGraphSource]
    )

    assert(vertex && fragment, `${pass} shaders compile`)

    programs[pass] = backend.programs.create(vertex, fragment)

    assert(programs[pass], `${pass} program links`)
  }

  const triangle = [-0.7, -0.2, 0, 0, 0, 1, 0, 0, -0.3, -0.2, 0, 0, 0, 1, 1, 0, -0.5, 0.2, 0, 0, 0, 1, 0.5, 1]
  const definition = {
    type: 'model',
    armatures: {
      Rig: { bones: Array.from({ length: 65 }, (_, index) => ({ name: `Bone${index}`, bindMatrix: identity })) }
    },
    meshes: {
      Triangle: {
        topology: 'triangles',
        vertices: triangle,
        weights: [2, 0, 1].map((vertex) => ({ vertex, indices: [62 + vertex, 0, 0, 0], weights: [1, 0, 0, 0] }))
      }
    }
  }
  const model = await Model.deserialize(definition)
  const primitive = backend.primitives.create(model.meshes.Triangle, backend.defaultMaterial)
  const boneIndices = new Float32Array(12)

  gl.bindVertexArray(primitive.vertexArray)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.getVertexAttrib(3, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING))
  gl.getBufferSubData(gl.ARRAY_BUFFER, 0, boneIndices)
  assert(
    boneIndices[0] === 62 && boneIndices[4] === 63 && boneIndices[8] === 64,
    'Weight buffers honor explicit vertex indices'
  )
  gl.bindVertexArray(null)

  const renderModel = { source: model, materials: {}, primitives: { Triangle: primitive } }
  const transform = new Transform()

  transform.updateTransform()

  const pixels = new Float32Array(128 * 128 * 4)
  const targetTexture = backend.textures.create({ width: 128, height: 128, precision: 32 })
  const framebuffer = gl.createFramebuffer()

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0)

  const draw = (pass, currentModel = renderModel, previousBones = model.boneMatrices) => {
    const program = programs[pass]

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.viewport(0, 0, 128, 128)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    backend.programs.bind(program)
    backend.bindUniforms(program, {
      camera: { viewMatrix: identity, projectionMatrix: identity, clipPlanes: [0.1, 10] },
      currentViewProjectionMatrix: identity,
      previousViewProjectionMatrix: identity,
      previousModelMatrix: identity,
      temporalSurfaceId: 1
    })
    backend.render(currentModel, program, transform, { previousBoneMatrices: previousBones })
    gl.readPixels(0, 0, 128, 128, gl.RGBA, gl.FLOAT, pixels)
    assert(gl.getError() === gl.NO_ERROR, `${pass} has no WebGL errors`)

    return pixels.slice()
  }

  const sample = (pixels, x, y, channel = 0) => pixels[(y * 128 + x) * 4 + channel]
  const previousBones = model.boneMatrices.slice()

  for (const index of [62, 63, 64]) {
    model.boneMatrices[index * 16 + 12] = 1
  }

  for (const pass of ['scene', 'depth']) {
    const values = draw(pass)

    assert(
      sample(values, 96, 64) > 0.4 && sample(values, 32, 64) === 0,
      `${pass}: bone 64 deforms the visible and shadow silhouettes`
    )
  }

  const motion = draw('motion-vectors', renderModel, previousBones)

  assert(Math.abs(sample(motion, 96, 64) - 0.5) < 0.001, 'Motion vectors preserve the previous skeletal pose')
  assert(Math.abs(sample(draw('motion-vectors'), 96, 64)) < 0.001, 'Stationary skeleton has zero velocity')
  messages.push(
    'PASS bone 64, explicit shuffled vertex references, surface/shadow deformation, previous-pose motion vectors'
  )

  const zeroModel = await Model.deserialize({
    ...definition,
    meshes: { Triangle: { topology: 'triangles', vertices: triangle } }
  })
  const zeroPrimitive = backend.primitives.create(zeroModel.meshes.Triangle, backend.defaultMaterial)
  const zeroRenderModel = { source: zeroModel, materials: {}, primitives: { Triangle: zeroPrimitive } }

  zeroModel.boneMatrices[12] = 1

  assert(sample(draw('scene', zeroRenderModel), 32, 64) > 0.9, 'Unweighted vertices keep identity deformation')
  messages.push('PASS zero-weight identity deformation')

  const entity = await new EntityLoader(new ModelLoader()).loadEntity(
    new URL('/skeletal-assets/entities/skeletal.entity.json', location.href).href
  )
  const collectModels = (entity) => [
    ...Object.values(entity.components).filter((component) => component.type === 'model'),
    ...Object.values(entity.children).flatMap(collectModels)
  ]
  const fixtureModels = collectModels(entity)

  assert(
    fixtureModels.length === 2 &&
      fixtureModels.every(
        (model) => model.boneMatrices.length === 65 * 16 && model.animations.Timeline.state === 'playing'
      ),
    'synthetic entity loads two independent skinned models and auto-plays Timeline'
  )

  const fixtureRenders = fixtureModels.map((source) => ({
    source,
    materials: {},
    primitives: Object.fromEntries(
      Object.entries(source.meshes).map(([name, mesh]) => [
        name,
        backend.primitives.create(mesh, backend.defaultMaterial)
      ])
    )
  }))
  const boundingBoxes = Object.values(fixtureModels[0].meshes).map((mesh) => mesh.boundingBox)
  const lower = [0, 1, 2].map((axis) => Math.min(...boundingBoxes.map((boundingBox) => boundingBox.minimum[axis])))
  const upper = [0, 1, 2].map((axis) => Math.max(...boundingBoxes.map((boundingBox) => boundingBox.maximum[axis])))
  const scale = 1.6 / Math.max(...upper.map((value, axis) => value - lower[axis]))

  transform.scale.set([scale, scale, scale])
  transform.translation.set(lower.map((value, axis) => -(value + upper[axis]) * 0.5 * scale))
  transform.updateTransform()

  const firstPose = draw('scene', fixtureRenders[0])

  fixtureModels.forEach((model) => model.update(transform, 0.5))

  const secondPose = draw('scene', fixtureRenders[0])

  assert(firstPose.some((value) => value > 0) && secondPose.some((value) => value > 0), 'synthetic mesh is visible')
  assert(
    firstPose.some((value, index) => value !== secondPose[index]),
    'synthetic playback changes the rendered pose'
  )
  messages.push('PASS generated skeletal.entity.json loads and visibly animates with all 65 bones and both meshes')

  const palette = backend.boneTexture
  const previousPalette = backend.previousBoneTexture

  assert(
    palette.height >= 65 && gl.isTexture(palette) && gl.isTexture(previousPalette),
    'Reusable palettes remain allocated across models'
  )

  model.boneMatrices = new Float32Array(80 * 16)

  for (let index = 0; index < 80; index++) {
    model.boneMatrices.set(identity, index * 16)
  }

  draw('motion-vectors')
  assert(
    backend.boneTexture === palette &&
      backend.previousBoneTexture === previousPalette &&
      palette.height === 80 &&
      previousPalette.height === 80,
    'Palettes grow without creating per-model textures'
  )
  backend.destroy()
  backend.destroy()
  assert(!gl.isTexture(palette) && !gl.isTexture(previousPalette), 'Backend releases both palettes')
  messages.push('PASS backend palette resource cleanup')

  results.textContent = messages.join('\n')
  results.dataset.status = 'passed'
} catch (error) {
  results.textContent = [...messages, error.stack ?? String(error)].join('\n')
  results.dataset.status = 'failed'
}
