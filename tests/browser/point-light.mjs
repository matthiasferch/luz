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
  Vector3,
  Vector4,
  Quaternion,
  defaultMaterialGraphSource
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
  const colorTexture = backend.textures.create({ width: 64, height: 64, precision: 32 })
  const shadowTexture = backend.textures.create({ width: 386, height: 259, format: 'depth', precision: 32 })
  const shadowBuffer = backend.buffers.create('frameBuffer')
  const lightingBuffer = backend.buffers.create('frameBuffer')
  const light = new Light()
  const lightTransform = new Transform()
  const transform = new Transform()
  const camera = new Camera()
  const pixel = new Float32Array(4)
  const directions = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
    [1, 1, 0],
    [1, -1, 0],
    [-1, 1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [1, 0, -1],
    [-1, 0, 1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, 1, -1],
    [0, -1, 1],
    [0, -1, -1],
    [1, 0.3, 0.5],
    [-1, 0.3, -0.5],
    [0.3, 1, 0.5],
    [-0.3, -1, 0.5],
    [0.3, 0.5, 1],
    [-0.3, 0.5, -1],
    [1, 1, 1],
    [-1, -1, -1]
  ]

  shadowPipeline.program = backend.programs.create(depthVertex, depthFragment)
  light.lightType = 'point'
  light.range = 10
  light.softness = 0.2
  light.coneAngle = 0
  camera.fieldOfView = 60
  camera.aspect = 1

  light.clipPlanes.set([0.1, 10])
  camera.clipPlanes.set([0.1, 10])
  transform.update(0)
  backend.buffers.attach(shadowBuffer, shadowTexture, gl.DEPTH_ATTACHMENT)
  backend.buffers.attach(lightingBuffer, colorTexture, gl.COLOR_ATTACHMENT0)

  for (const pass of ['scene', 'physically-based-lighting']) {
    const fragment = backend.shaders.create('fragment', await loadSource(`${pass}.fragment.glsl`), [
      definitions,
      uniforms,
      lighting,
      shadows,
      defaultMaterialGraphSource
    ])

    lightingPipeline.program = backend.programs.create(vertex, fragment)

    assertCondition(lightingPipeline.program, `${pass} links`)

    for (const directionValues of directions) {
      const direction = new Vector3(directionValues).normalize()
      const cameraMatrix = Matrix4.createLookAtTransform(
        Vector3.createZero(),
        direction,
        Math.abs(direction.y) > 0.99 ? Vector3.createForward() : Vector3.createUp()
      )
      const vertices = []

      camera.updateFromMatrix(cameraMatrix)

      for (const [x, y] of [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0, 0.5]
      ]) {
        const position = cameraMatrix.transform(new Vector4([x, y, -2, 1]))
        const normal = cameraMatrix.transform(new Vector4([0, 0, 1, 0]))

        vertices.push(position.x, position.y, position.z, normal.x, normal.y, normal.z, 0, 0)
      }

      const model = await Model.deserialize({ type: 'model', meshes: { Surface: { topology: 'triangles', vertices } } })
      const primitive = backend.primitives.create(model.meshes.Surface, backend.defaultMaterial)
      const renderModel = { source: model, materials: {}, primitives: { Surface: primitive } }
      const occluder = new Entity()
      const renderer = new FrameRenderer(backend, () => renderModel)

      occluder.components.Surface = model

      occluder.scale.set([0.5, 0.5, 0.5])
      occluder.refreshWorldTransform()

      const drawSurface = (isOccluderVisible, areShadowsEnabled = true) => {
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
            overrideTargets: { shadowMapping: { width: 386, height: 259, frameBuffer: shadowBuffer } },
            additionalUniforms: { lighting: { shadowTexture, areShadowsEnabled, isEmissionSuppressed: true } }
          }
        )
        gl.readPixels(32, 32, 1, 1, gl.RGBA, gl.FLOAT, pixel)
        assertCondition(
          gl.getError() === gl.NO_ERROR && pixel.every(Number.isFinite),
          `${pass} ${directionValues} valid GPU output`
        )

        return pixel[0]
      }

      light.range = 10

      const illuminated = drawSurface(false)

      for (const lightType of ['spot', 'directional']) {
        light.lightType = lightType
        light.coneAngle = 60

        drawSurface(false)
      }

      light.lightType = 'point'
      light.coneAngle = 0

      const shadowed = drawSurface(true)

      assertCondition(illuminated > 0.1, `${pass} ${directionValues} lit: ${illuminated}`)
      assertCondition(shadowed < illuminated * 0.01, `${pass} ${directionValues} shadow: ${shadowed} vs ${illuminated}`)
      assertCondition(Math.abs(drawSurface(true, false) - illuminated) < 0.0001, `${pass} disabling shadows`)
      assertCondition(Math.abs(drawSurface(false) - illuminated) < 0.0001, `${pass} clearing stale atlas faces`)
      lightTransform.rotation.set(Quaternion.setFromAxisAngle(Vector3.createRight(), 1.7))
      lightTransform.scale.set([-2, 3, 4])
      assertCondition(Math.abs(drawSurface(false) - illuminated) < 0.0001, `${pass} ignores rotation and scale`)

      for (const range of [0, 1]) {
        light.range = range

        assertCondition(drawSurface(false) < 0.0001, `${pass} finite range ${range}`)
      }
    }

    messages.push(
      `PASS ${pass}: six faces, twelve edges, corners, real shadow depth, atlas clearing, range, rotation/scale, mixed light types, shadows toggle`
    )

    const pixels = new Float32Array(32 * 32 * 4)

    light.range = 10

    lightTransform.translation.set([4, 4, 3])

    for (const directionValues of directions) {
      const direction = new Vector3(directionValues).normalize()
      const cameraMatrix = Matrix4.createLookAtTransform(
        lightTransform.translation,
        Vector3.add(lightTransform.translation, direction),
        Math.abs(direction.y) > 0.99 ? Vector3.createForward() : Vector3.createUp()
      )
      const vertices = []

      camera.updateFromMatrix(cameraMatrix)

      for (const [x, y] of [
        [-2, -2],
        [2, -2],
        [2, 2],
        [-2, 2]
      ]) {
        const position = cameraMatrix.transform(new Vector4([x, y, -2 + 0.8 * x + 0.4 * y, 1]))
        const normal = cameraMatrix.transform(new Vector4([-0.8, -0.4, 1, 0]))

        vertices.push(position.x, position.y, position.z, normal.x, normal.y, normal.z, 0, 0)
      }

      const model = await Model.deserialize({
        type: 'model',
        meshes: { Surface: { topology: 'triangles', vertices, indices: [0, 1, 2, 0, 2, 3] } }
      })
      const primitive = backend.primitives.create(model.meshes.Surface, backend.defaultMaterial)
      const renderModel = { source: model, materials: {}, primitives: { Surface: primitive } }
      const receiver = new Entity()
      const renderer = new FrameRenderer(backend, () => renderModel)

      receiver.components.Surface = model

      receiver.refreshWorldTransform()

      const drawReceiver = (areShadowsEnabled) => {
        lightTransform.update(0)
        light.update(lightTransform, 0)
        renderer.clear()
        renderer.renderFrame(
          { shadowMapping: shadowPipeline, lighting: lightingPipeline },
          { camera, time: 0, target: { width: 64, height: 64, frameBuffer: lightingBuffer } },
          [{ light, entities: [receiver] }],
          [{ transform, model: renderModel }],
          [],
          {
            clear: { shadowMapping: { depth: 1 }, lighting: { color: new Vector4([0, 0, 0, 0]) } },
            overrideTargets: { shadowMapping: { width: 386, height: 259, frameBuffer: shadowBuffer } },
            additionalUniforms: { lighting: { shadowTexture, areShadowsEnabled, isEmissionSuppressed: true } }
          }
        )
        gl.readPixels(16, 16, 32, 32, gl.RGBA, gl.FLOAT, pixels)
        assertCondition(gl.getError() === gl.NO_ERROR && pixels.every(Number.isFinite), `${pass} valid receiver output`)

        return Float32Array.from(pixels)
      }

      for (const clipPlanes of [
        [0.1, 10],
        [1, 100]
      ]) {
        light.clipPlanes.set(clipPlanes)

        const reference = drawReceiver(false)
        const maximumBrightness = Math.max(...reference)

        for (const softness of [0, 0.2, 1]) {
          light.softness = softness

          const shadowed = drawReceiver(true)
          const maximumError = Math.max(...shadowed.map((value, index) => Math.abs(value - reference[index])))

          assertCondition(maximumBrightness > 0.1, `${pass} receiver is visible`)
          assertCondition(
            maximumError < maximumBrightness * 0.001 + 0.00001,
            `${pass} point receiver self-shadows at ${directionValues}, clip=${clipPlanes}, softness=${softness}: ${maximumError}`
          )
        }
      }

      receiver.scale.set([0.98, 0.98, 0.98])
      receiver.translation.set([...lightTransform.translation].map((value) => value * 0.02))
      receiver.refreshWorldTransform()

      const contactReference = drawReceiver(false)
      const contactShadow = drawReceiver(true)
      const centerOffset = (16 * 32 + 16) * 4

      assertCondition(
        contactShadow
          .slice(centerOffset, centerOffset + 3)
          .every((value, index) => value < contactReference[centerOffset + index] * 0.01 + 0.00001),
        `${pass} nearby occluders still shadow the receiver at ${directionValues}`
      )
      backend.primitives.destroy(primitive)
    }

    messages.push(
      `PASS ${pass}: sloped receivers stay lit across point-shadow faces, seams, clip planes and filter widths`
    )
    light.clipPlanes.set([0.1, 10])
    lightTransform.translation.reset()

    light.softness = 0.2
  }

  results.dataset.status = 'passed'
  results.textContent = messages.join('\n')
} catch (error) {
  results.dataset.status = 'failed'
  results.textContent = [...messages, error.stack ?? String(error)].join('\n')
}
