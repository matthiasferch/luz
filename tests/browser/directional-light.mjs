import {
  WebGL2RenderBackend,
  Model,
  Light,
  Camera,
  Entity,
  FrameRenderer,
  RenderPipeline,
  Transform,
  Matrix4,
  Quaternion,
  Vector3,
  defaultMaterialGraphSource,
  Vector4
} from '/engine.mjs'

const results = document.querySelector('#results')
const messages = []
const assertCondition = (isValid, message) => {
  if (!isValid) {
    throw new Error(message)
  }
}

try {
  const gl = document.querySelector('#canvas').getContext('webgl2', { antialias: false })

  assertCondition(gl && gl.getExtension('EXT_color_buffer_float'), 'WebGL2 float targets unavailable')

  const backend = new WebGL2RenderBackend(gl)
  const loadSource = async (name) => (await fetch(`/graphics/rendering/shaders/${name}`)).text()
  const [definitions, uniforms, attributes, lighting, shadows] = await Promise.all(
    [
      'common/definitions.glsl',
      'common/uniforms.glsl',
      'common/attributes.glsl',
      'effects/physically-based-rendering.glsl',
      'effects/shadow-mapping.glsl'
    ].map(loadSource)
  )
  const vertex = backend.shaders.create('vertex', await loadSource('scene.vertex.glsl'), [
    definitions,
    uniforms,
    attributes
  ])
  const model = await Model.deserialize({
    type: 'model',
    meshes: {
      Surface: {
        topology: 'triangles',
        vertices: [-1, -1, -0.5, 0, 0, 1, 0, 0, 3, -1, -0.5, 0, 0, 1, 1, 0, -1, 3, -0.5, 0, 0, 1, 0, 1]
      }
    }
  })
  const primitive = backend.primitives.create(model.meshes.Surface, backend.defaultMaterial)
  const renderModel = { source: model, materials: {}, primitives: { Surface: primitive } }
  const transform = new Transform()
  const lightTransform = new Transform({
    translation: new Vector3([0, 0, 2]),
    rotation: Quaternion.setFromAxisAngle(Vector3.createRight(), Math.PI / 2)
  })
  const light = new Light()
  const identity = Array.from(Matrix4.createIdentity())
  const colorTexture = backend.textures.create({ width: 64, height: 64, precision: 32 })
  const shadowTexture = backend.textures.create({ width: 1, height: 1, precision: 32 })
  const framebuffer = gl.createFramebuffer()

  light.lightType = 'directional'
  light.range = 0
  light.softness = 0

  light.shadowSize.set([2, 2])
  light.clipPlanes.set([0.1, 10])
  transform.update(0)
  gl.bindTexture(gl.TEXTURE_2D, shadowTexture)
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 1, 1, gl.RGBA, gl.FLOAT, new Float32Array([0.1, 0.1, 0.1, 1]))
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0)
  assertCondition(gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE, 'Incomplete target')

  for (const pass of ['scene', 'physically-based-lighting']) {
    const fragment = backend.shaders.create('fragment', await loadSource(`${pass}.fragment.glsl`), [
      definitions,
      uniforms,
      lighting,
      shadows,
      defaultMaterialGraphSource
    ])
    const program = backend.programs.create(vertex, fragment)

    assertCondition(program, `${pass} program links`)

    const drawSurface = (areShadowsEnabled = false) => {
      lightTransform.update(0)
      light.update(lightTransform, 0)
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      gl.viewport(0, 0, 64, 64)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      backend.programs.bind(program)
      backend.bindUniforms(program, {
        camera: { viewMatrix: identity, projectionMatrix: identity },
        areShadowsEnabled,
        shadowTexture,
        isEmissionSuppressed: true
      })
      backend.bindLightUniforms(program, light)
      backend.render(renderModel, program, transform)

      const pixel = new Float32Array(4)

      gl.readPixels(32, 32, 1, 1, gl.RGBA, gl.FLOAT, pixel)
      assertCondition(gl.getError() === gl.NO_ERROR, `${pass} WebGL error`)
      assertCondition(pixel.every(Number.isFinite), `${pass} finite output`)

      return pixel[0]
    }

    light.lightType = 'directional'
    light.range = 0

    lightTransform.translation.set([0, 0, 2])
    lightTransform.rotation.set(Quaternion.setFromAxisAngle(Vector3.createRight(), Math.PI / 2))

    const illuminated = drawSurface()

    assertCondition(illuminated > 0.1, `${pass} sun illuminates with zero radius`)
    assertCondition(drawSurface(true) < illuminated * 0.01, `${pass} orthographic shadow occludes receiver`)
    lightTransform.translation.set([100, -50, 200])

    const translated = drawSurface()

    assertCondition(Math.abs(translated - illuminated) < 1e-5, `${pass} illumination ignores position`)
    assertCondition(
      Math.abs(drawSurface(true) - illuminated) < 1e-5,
      `${pass} outside shadow coverage remains illuminated`
    )

    light.range = 10000
    light.coneAngle = 0
    light.coneFalloff = 0

    assertCondition(Math.abs(drawSurface() - illuminated) < 1e-5, `${pass} illumination ignores cone and radius`)
    lightTransform.rotation.set(Quaternion.setFromAxisAngle(Vector3.createRight(), Math.PI))
    assertCondition(drawSurface() < illuminated * 0.01, `${pass} rotation changes illumination`)

    light.lightType = 'spot'
    light.range = 1
    light.coneAngle = 90
    light.coneFalloff = 10

    lightTransform.translation.set([0, 0, 2])
    lightTransform.rotation.set(Quaternion.setFromAxisAngle(Vector3.createRight(), Math.PI / 2))
    assertCondition(drawSurface() < illuminated * 0.01, `${pass} spot retains finite range`)

    light.range = 10

    assertCondition(drawSurface() > 0.05, `${pass} spot still illuminates within range`)

    light.coneFalloff = 0

    assertCondition(drawSurface() > 0.05, `${pass} zero cone falloff remains finite and illuminated`)
    messages.push(
      `PASS ${pass}: direction, position/range independence, orthographic shadows, coverage edges, spot regression`
    )
  }

  const depthVertex = backend.shaders.create('vertex', await loadSource('depth.vertex.glsl'), [
    definitions,
    uniforms,
    attributes
  ])
  const depthFragment = backend.shaders.create('fragment', await loadSource('depth.fragment.glsl'), [
    definitions,
    uniforms,
    defaultMaterialGraphSource
  ])
  const shadowPipeline = new RenderPipeline({
    depthTest: 'less',
    depthMask: true,
    colorMask: [false, false, false, false]
  })
  const lightingPipeline = new RenderPipeline({
    depthTest: 'none',
    depthMask: false
  })

  shadowPipeline.program = backend.programs.create(depthVertex, depthFragment)
  lightingPipeline.program = backend.programs.create(
    vertex,
    backend.shaders.create('fragment', await loadSource('physically-based-lighting.fragment.glsl'), [
      definitions,
      uniforms,
      lighting,
      shadows,
      defaultMaterialGraphSource
    ])
  )

  const renderedDepth = backend.textures.create({ width: 128, height: 128, format: 'depth', precision: 32 })
  const shadowBuffer = backend.buffers.create('frameBuffer')
  const lightingBuffer = backend.buffers.create('frameBuffer')

  backend.buffers.attach(shadowBuffer, renderedDepth, gl.DEPTH_ATTACHMENT)
  backend.buffers.attach(lightingBuffer, colorTexture, gl.COLOR_ATTACHMENT0)

  const occluder = new Entity()
  const camera = new Camera()

  occluder.components.Surface = model
  occluder.translation.z = 1

  occluder.refreshWorldTransform()

  const renderer = new FrameRenderer(backend, () => renderModel)
  const renderShadowedSurface = (isOccluderVisible) => {
    light.lightType = 'directional'
    light.softness = 0.15

    lightTransform.translation.set([0, 0, 2])
    lightTransform.rotation.set(Quaternion.setFromAxisAngle(Vector3.createRight(), Math.PI / 2))
    lightTransform.update(0)
    light.update(lightTransform, 0)
    renderer.clear()
    renderer.renderFrame(
      { shadowMapping: shadowPipeline, lighting: lightingPipeline },
      { camera, time: 0, target: { width: 64, height: 64, frameBuffer: lightingBuffer } },
      [{ light, entities: isOccluderVisible ? [occluder] : [] }],
      [{ transform, model: renderModel }],
      [],
      {
        clear: { shadowMapping: { depth: 1 }, lighting: { color: new Vector4([0, 0, 0, 0]) } },
        overrideTargets: { shadowMapping: { width: 128, height: 128, frameBuffer: shadowBuffer } },
        additionalUniforms: {
          lighting: { shadowTexture: renderedDepth, areShadowsEnabled: true, isEmissionSuppressed: true }
        }
      }
    )

    const pixel = new Float32Array(4)

    gl.readPixels(32, 32, 1, 1, gl.RGBA, gl.FLOAT, pixel)
    assertCondition(gl.getError() === gl.NO_ERROR, 'Rendered shadow map has no WebGL errors')

    return pixel[0]
  }
  const unshadowedSurface = renderShadowedSurface(false)
  const shadowedSurface = renderShadowedSurface(true)

  assertCondition(unshadowedSurface > 0.1, `Actual shadow pass: lit receiver ${unshadowedSurface}`)
  assertCondition(
    shadowedSurface < unshadowedSurface * 0.01,
    `Actual shadow pass must occlude: ${shadowedSurface} vs ${unshadowedSurface}`
  )
  messages.push('PASS actual FrameRenderer shadow-map rendering and subsequent lighting')
  light.clipPlanes.set([1, 40])

  occluder.translation.z = 0.005

  occluder.refreshWorldTransform()

  const contactShadow = renderShadowedSurface(true)

  assertCondition(
    contactShadow < unshadowedSurface * 0.01,
    `Directional contact shadow must survive a 40-unit depth range: ${contactShadow} vs ${unshadowedSurface}`
  )
  messages.push('PASS shallow directional contact shadows across a wide depth range')

  results.dataset.status = 'passed'
  results.textContent = messages.join('\n')
} catch (error) {
  results.dataset.status = 'failed'
  results.textContent = [...messages, error.stack ?? String(error)].join('\n')
}
