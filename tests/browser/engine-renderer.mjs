import {
  WebGL2RenderBackend,
  ModelManager,
  SceneRenderer,
  DebugRenderer,
  Scene,
  Entity,
  Model,
  Camera,
  createDebugSettings,
  Quaternion,
  Vector3,
  AnimationLoop,
  decodeImage
} from 'luz'

const results = document.querySelector('#results')
const assertCondition = (isValid, message) => {
  if (!isValid) {
    throw new Error(message)
  }
}

const verifyBuiltinImages = (images) => {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2')
  const texture = gl.createTexture()
  const framebuffer = gl.createFramebuffer()

  try {
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    assertCondition(images.length === 2, 'Both built-in images decode')

    for (const image of images) {
      const pixels = new Uint8Array(image.width * image.height * 4)

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
      assertCondition(gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE, 'Generated PNG uploads')
      gl.readPixels(0, 0, image.width, image.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

      if (image.width === 256) {
        const smoothFacingOffset = (256 - 1) * 4
        const roughFacingOffset = (256 * 256 - 1) * 4

        assertCondition(
          pixels[smoothFacingOffset] >= 253 && pixels[smoothFacingOffset + 1] <= 1,
          'Smooth facing BRDF is linear'
        )
        assertCondition(pixels[0] <= 5 && pixels[1] >= 250, 'Smooth grazing BRDF has the correct Fresnel channels')
        assertCondition(
          Math.abs(pixels[roughFacingOffset] - 78) <= 2,
          'Rough BRDF has the correct vertical axis and linear encoding'
        )
      } else {
        const histogram = new Uint32Array(256)

        assertCondition(image.width === 512 && image.height === 512, 'Noise preserves the shader sampling period')

        for (let index = 0; index < pixels.length; index += 4) {
          ++histogram[pixels[index]]

          assertCondition(
            pixels[index] === pixels[index + 1] && pixels[index] === pixels[index + 2] && pixels[index + 3] === 255,
            'Noise decodes as opaque grayscale'
          )
        }

        assertCondition(
          histogram.every((count) => count === 1024),
          'Browser decoding preserves uniform noise values'
        )
      }

      assertCondition(gl.getError() === gl.NO_ERROR, 'Generated texture readback has no GPU errors')
    }
  } finally {
    gl.deleteFramebuffer(framebuffer)
    gl.deleteTexture(texture)
  }
}

try {
  assertCondition(!('luz' in window), 'ES module runs without a global engine namespace')

  const canvas = document.querySelector('#canvas')
  const gl = canvas.getContext('webgl2', { antialias: false })
  const backend = new WebGL2RenderBackend(gl)
  const resources = new ModelManager(backend, {
    resolveSurface: async () => {
      throw new Error('Unexpected model image request')
    }
  })
  const scene = new Scene()
  const entity = new Entity()
  const view = new Entity()
  const camera = new Camera()
  const model = await Model.deserialize({
    type: 'model',
    meshes: {
      triangle: {
        topology: 'triangles',
        vertices: [-1, -1, -3, 0, 0, 0, 0, 1, 1, -1, -3, 1, 0, 0, 0, 1, 0, 1, -3, 0.5, 1, 0, 0, 1]
      }
    }
  })

  view.rotation.copyFrom(Quaternion.setFromAxisAngle(Vector3.createRight(), Math.PI / 2))

  entity.components.model = model
  view.components.camera = camera
  scene.entities.surface = entity
  scene.entities.view = view
  camera.aspect = 1

  scene.update(0)

  await resources.prepareScene(scene)

  const fetchSource = window.fetch.bind(window)
  const requests = []

  window.fetch = (source, options) => {
    requests.push(String(source))
    assertCondition(String(source).startsWith('data:'), `Unexpected built-in request: ${source}`)

    return fetchSource(source, options)
  }

  const builtinImages = []
  const renderer = await SceneRenderer.create({
    backend,
    models: resources.compiler,
    decodeImage: async (blob, signal) => {
      const image = await decodeImage(blob, signal)

      builtinImages.push(image)

      return image
    }
  })

  verifyBuiltinImages(builtinImages)

  const debug = new DebugRenderer(backend)
  const target = { width: 64, height: 64 }
  const projection = Array.from(camera.projectionMatrix)
  const settings = createDebugSettings()

  settings.areModelBoundingBoxesVisible = true
  settings.areCameraFrustumsVisible = true

  renderer.setEnvironmentSetting('ambientBrightness', 0.5)
  renderer.setRenderingSetting('ambientOcclusion', 'isEnabled', true)
  renderer.setRenderingSetting('bloom', 'isEnabled', true)
  renderer.setRenderingSetting('motionBlur', 'isEnabled', true)
  renderer.setRenderingSetting('depthOfField', 'isEnabled', true)

  camera.isDepthOfFieldEnabled = true

  let frame

  for (let index = 0; index < 3; index++) {
    scene.update(1 / 60)

    frame = renderer.render(scene, { camera, target, time: index / 60 })

    assertCondition(
      projection.every((value, component) => value === camera.projectionMatrix[component]),
      'Camera projection remains unjittered'
    )
    assertCondition(gl.getError() === gl.NO_ERROR, `Scene frame ${index} has no GPU errors`)
  }

  const pixels = new Uint8Array(64 * 64 * 4)

  gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  assertCondition(
    pixels.some((value, index) => index % 4 !== 3 && value > 10),
    'Synthetic scene produces visible color'
  )

  for (const mode of ['visible', 'occluded', 'always']) {
    settings.overlayDepthMode = mode

    debug.render(scene, camera, settings, frame, 2)
    assertCondition(gl.getError() === gl.NO_ERROR, `Debug depth mode ${mode} has no GPU errors`)
  }

  const diagnosticPixels = new Uint8Array(pixels.length)

  gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, diagnosticPixels)
  assertCondition(
    pixels.some((value, index) => value !== diagnosticPixels[index]),
    'GPU diagnostics change the image'
  )

  const previousDepth = frame.depthTexture

  canvas.width = target.width = 80
  camera.aspect = 80 / 64

  scene.update(0)
  renderer.setAntialiasingMode('fxaa')
  renderer.setRenderingSetting('motionBlur', 'isEnabled', false)
  renderer.setRenderingSetting('ambientOcclusion', 'isEnabled', false)
  renderer.setRenderingSetting('bloom', 'isEnabled', false)

  model.isVisible = false
  frame = renderer.render(scene, { camera, target, time: 1 })

  assertCondition(
    frame.depthTexture !== previousDepth && frame.depthTexture.width === 80,
    'Resize replaces internal depth'
  )

  model.isVisible = true
  entity.scale.x = -1

  scene.update(0)
  renderer.invalidateHistory()
  renderer.render(scene, { camera, target, time: 0 })
  assertCondition(gl.getError() === gl.NO_ERROR, 'Resize, visibility, mirrored transforms and history reset succeed')

  const loop = new AnimationLoop((time, elapsedTime) => {
    scene.update(elapsedTime)
    renderer.render(scene, { camera, target, time })
  })

  loop.start()
  assertCondition(loop.isRunning, 'Browser loop schedules a native animation frame')
  loop.stop()
  assertCondition(!loop.isRunning, 'Browser loop cancels its scheduled frame')
  debug.destroy()
  debug.destroy()
  renderer.destroy()
  renderer.destroy()
  assertCondition(gl.isTexture(backend.defaultTexture), 'Renderer preserves caller-owned backend')
  assertCondition(resources.compiler.requireCompiledModel(model), 'Renderer preserves caller-owned models')
  assertCondition(requests.length === 2, 'Only bundled lookup images are decoded')
  resources.destroy()
  backend.destroy()

  results.dataset.status = 'passed'
  results.textContent = 'Engine-only scene, effects, debug, resizing and lifetime checks passed'
} catch (error) {
  results.dataset.status = 'failed'
  results.textContent = error.stack ?? String(error)
}
