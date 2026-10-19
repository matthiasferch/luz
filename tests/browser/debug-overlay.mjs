import { WebGL2RenderBackend, Model, Transform, Matrix4, Vector2, Vector3 } from '/engine.mjs'

const results = document.querySelector('#results')
const messages = []
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

try {
  const canvas = document.querySelector('#canvas')
  const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true })

  assert(gl, 'WebGL2 unavailable')

  const backend = new WebGL2RenderBackend(gl)
  const readShader = async (name) =>
    (await fetch(`/graphics/${name.startsWith('debug.') ? 'debug' : 'rendering'}/shaders/${name}`)).text()
  const headers = await Promise.all(
    ['common/definitions.glsl', 'common/attributes.glsl', 'common/uniforms.glsl'].map(readShader)
  )
  const vertex = backend.shaders.create('vertex', await readShader('debug.vertex.glsl'), headers)
  const fragment = backend.shaders.create('fragment', await readShader('debug.fragment.glsl'), headers)

  assert(vertex && fragment, 'debug shaders compile')

  const program = backend.programs.create(vertex, fragment)

  assert(program, 'debug shaders link')
  backend.programs.bind(program)

  const depth = gl.createTexture()

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, depth)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  const resource = backend.buffers.create('vertexBuffer')
  const attributes = [
    { buffer: resource, location: 7, format: 'float32x3', byteStride: 24, divisor: 1 },
    { buffer: resource, location: 8, format: 'float32x3', byteStride: 24, byteOffset: 12, divisor: 1 }
  ]
  const linePrimitive = backend.primitives.create({ topology: 'triangles', vertexCount: 6, attributes })
  const conePrimitive = backend.primitives.create({ topology: 'triangles', vertexCount: 96, attributes })
  const identity = Matrix4.createIdentity()
  const setDepth = (width, split = width) => {
    const values = new Float32Array(width)

    for (let x = 0; x < width; x++) {
      values[x] = x < split ? 0.25 : 1
    }

    gl.bindTexture(gl.TEXTURE_2D, depth)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, width, 1, 0, gl.RED, gl.FLOAT, values)
    gl.uniform1i(gl.getUniformLocation(program, 'depthTexture'), 0)
  }

  const draw = (segments, options = {}) => {
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    backend.depthTest = 'always'
    backend.depthMask = false
    backend.cullMode = 'none'
    backend.blendMode = 'transparent'

    backend.bindUniforms(program, {
      camera: { projectionMatrix: identity, viewMatrix: identity },
      viewportSize: new Vector2([canvas.width, canvas.height]),
      depthJitter: new Vector2([0, 0]),
      lineWidth: 2,
      pixelRatio: 1,
      opacity: 0.9,
      depthMode: 0,
      isScreenSpace: false,
      isDashed: false,
      isCone: false,
      baseColor: new Vector3([1, 1, 1]),
      ...options
    })
    backend.buffers.update(resource, new Float32Array(segments))
    backend.draw(options.isCone ? conePrimitive : linePrimitive, { instanceCount: segments.length / 6 })
    assert(gl.getError() === gl.NO_ERROR, 'no WebGL errors')

    const pixels = new Uint8Array(canvas.width * canvas.height * 4)

    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    return pixels
  }

  const intensity = (pixels, x, y) => pixels[(y * canvas.width + x) * 4]
  const horizontal = [-0.75, 0, 0, 0.75, 0, 0]

  setDepth(128)

  const hidden = draw(horizontal)
  const hiddenSamples = Array.from({ length: 90 }, (_, index) => intensity(hidden, 19 + index, 64))

  assert(
    hiddenSamples.some((value) => value > 40 && value < 70),
    'hidden lines use quarter opacity'
  )
  assert(
    hiddenSamples.some((value) => value === 0),
    'hidden lines contain dash gaps'
  )

  const visibleOnly = draw(horizontal, { depthMode: 1 })

  assert(
    visibleOnly.every((value, index) => index % 4 === 3 || value === 0),
    'visible-only mode removes occluded lines'
  )

  const always = draw(horizontal, { depthMode: 2 })

  assert(intensity(always, 64, 64) > 200, 'always-on-top ignores scene depth')

  const scissors = draw(horizontal, { depthMode: 1, isScreenSpace: true })

  assert(intensity(scissors, 64, 64) > 200, 'screen rectangles ignore depth modes')
  messages.push('PASS depth modes, hidden dashes, opacity, and screen-space scissors')
  setDepth(128, 0)

  const nearCrossing = draw([-0.5, 0, -2, 0.5, 0, 0], { depthMode: 2 })

  assert(
    intensity(nearCrossing, 48, 64) === 0 && intensity(nearCrossing, 80, 64) > 200,
    'near-plane crossing clips the segment'
  )

  const clipped = draw([-0.5, 0, -2, 0.5, 0, -2], { depthMode: 2 })

  assert(
    clipped.every((value, index) => index % 4 === 3 || value === 0),
    'fully clipped segments draw nothing'
  )

  const marker = draw([0, 0, 0, 0, 0, 0], { lineWidth: 6 })

  assert(
    intensity(marker, 64, 64) > 200 && intensity(marker, 70, 64) === 0,
    'degenerate segment becomes a round joint marker'
  )

  const perspective = Matrix4.createPerspective(Math.PI / 2, 1, 0.1, 100)
  const perspectiveImage = draw([-0.2, 0, 0.2, 0.5, 0, -1], {
    depthMode: 2,
    camera: { projectionMatrix: perspective, viewMatrix: identity }
  })

  assert(
    perspectiveImage.some((value, index) => index % 4 === 0 && value > 0),
    'perspective segment crossing the eye is clipped and visible'
  )
  messages.push('PASS near-plane clipping and round joint markers')

  const measureWidth = (size, ratio) => {
    canvas.width = size
    canvas.height = size

    const pixels = draw(horizontal, { depthMode: 2, pixelRatio: ratio })

    let coverage = 0

    for (let y = 0; y < size; y++) {
      coverage += intensity(pixels, size / 2, y) / 230
    }

    return coverage
  }
  const normalWidth = measureWidth(128, 1)
  const doubledWidth = measureWidth(256, 2)

  assert(Math.abs(normalWidth - 2) < 0.2 && Math.abs(doubledWidth - 4) < 0.2, 'CSS width follows device pixel ratio')
  messages.push('PASS consistent width across viewport sizes and pixel ratios')

  canvas.width = 128
  canvas.height = 128

  setDepth(128, 64)

  const baseImage = draw(horizontal, { depthMode: 1 })

  for (const jitter of [-0.5, -0.25, 0.25, 0.5]) {
    const image = draw(horizontal, { depthMode: 1, depthJitter: new Vector2([jitter / 128, 0]) })

    let changedPixels = 0

    for (let index = 0; index < image.length; index += 4) {
      if (image[index] !== baseImage[index]) {
        changedPixels++
      }
    }

    assert(changedPixels <= 4, 'temporal depth offsets stay within one boundary pixel')
  }

  messages.push('PASS stable unjittered lines with temporal depth sampling')

  canvas.width = 640
  canvas.height = 640

  setDepth(640, 0)

  const mirroredTransform = new Transform()

  mirroredTransform.modelMatrix[0] = -1

  backend.render({ source: new Model(), materials: {}, primitives: {} }, program, mirroredTransform)
  assert(gl.getParameter(gl.FRONT_FACE) === gl.CW, 'mirrored model reverses winding')

  const cone = draw(horizontal, { isCone: true })

  assert(gl.getParameter(gl.FRONT_FACE) === gl.CCW, 'cones restore world-space winding after mirrored models')
  assert(intensity(cone, 546, 320) > 140 && intensity(cone, 546, 323) > 140, 'cone arrowhead has a filled interior')
  assert(intensity(cone, 530, 320) === 0 && intensity(cone, 563, 320) === 0, 'cone occupies only the arrow tip')

  const cap = draw([0, 0, -0.5, 0, 0, 0.5], { isCone: true })

  assert(intensity(cap, 320, 320) > 140, 'cone viewed along its axis is capped')

  const emptyCone = draw([0, 0, 0, 0, 0, 0], { isCone: true })

  assert(
    emptyCone.every((value, index) => index % 4 === 3 || value === 0),
    'zero-length cones draw nothing'
  )

  const crossingCone = draw([-0.5, 0, -2, 0.5, 0, -0.8], { isCone: true, depthMode: 2 })

  assert(
    crossingCone.some((value, index) => index % 4 === 0 && value > 0),
    'cone clips correctly at the near plane'
  )
  setDepth(640)

  const hiddenCone = draw(horizontal, { isCone: true })
  const hiddenConeSamples = Array.from({ length: 18 }, (_, index) => intensity(hiddenCone, 541 + index, 320))

  assert(
    hiddenConeSamples.some((value) => value > 30 && value < 65),
    'hidden cone uses quarter opacity'
  )
  assert(
    hiddenConeSamples.every((value) => value > 0),
    'hidden cone stays solid without dash gaps'
  )

  const removedCone = draw(horizontal, { isCone: true, depthMode: 1 })

  assert(
    removedCone.every((value, index) => index % 4 === 3 || value === 0),
    'visible-only mode removes hidden cones'
  )

  const overlayCone = draw(horizontal, { isCone: true, depthMode: 2 })

  assert(intensity(overlayCone, 546, 320) > 140, 'always-on-top cone ignores scene depth')
  messages.push('PASS filled cone heads, caps, degenerate axes, clipping, and all depth modes')
  backend.primitives.destroy(linePrimitive)
  backend.primitives.destroy(conePrimitive)
  backend.buffers.destroy(resource)
  backend.destroy()

  results.dataset.status = 'passed'
  results.textContent = messages.join('\n')
} catch (error) {
  results.dataset.status = 'failed'
  results.textContent = `${messages.join('\n')}\nFAIL ${error.stack || error}`
}
