const results = document.querySelector('#results')
const messages = []
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const assertNear = (actual, expected, label, tolerance = 0.002) =>
  assert(Math.abs(actual - expected) < tolerance, `${label}: expected ${expected}, got ${actual}`)

try {
  const gl = document.querySelector('#canvas').getContext('webgl2')

  assert(gl && gl.getExtension('EXT_color_buffer_float'), 'WebGL2 float targets unavailable')
  gl.getExtension('OES_texture_float_linear')

  const load = async (name) => {
    const response = await fetch(`/graphics/rendering/shaders/${name}`)

    assert(response.ok, `Cannot load ${name}`)

    return response.text()
  }
  const sources = await Promise.all(
    [
      'common/definitions.glsl',
      'common/uniforms.glsl',
      'utilities/reconstruct-position.glsl',
      'utilities/reconstruct-depth.glsl',
      'temporal-antialiasing.fragment.glsl'
    ].map(load)
  )
  const compile = (type, source) => {
    const shader = gl.createShader(type)

    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    assert(gl.getShaderParameter(shader, gl.COMPILE_STATUS), gl.getShaderInfoLog(shader))

    return shader
  }
  const program = gl.createProgram()

  gl.attachShader(
    program,
    compile(
      gl.VERTEX_SHADER,
      `#version 300 es
    void main() {
      vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
      gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
    }`
    )
  )

  // Exercise both the full resolve and its actual lookup functions, without a
  // JavaScript reimplementation that could diverge from the production shader.
  gl.attachShader(
    program,
    compile(
      gl.FRAGMENT_SHADER,
      `${sources.slice(0, 4).join('\n')}
    #define main resolveMain
    ${sources[4]}
    #undef main
    uniform int testMode;
    uniform vec2 testTextureCoordinates;
    uniform float testOwner, testDepth;
    void main() {
      if (testMode == 0) { resolveMain(); return; }
      vec4 color;
      float difference;
      bool valid;
      if (testMode == 1) {
        valid = sampleSurfaceHistory(testTextureCoordinates, testOwner, testDepth, 0.001, color, difference);
      } else {
        valid = findClosestSurfaceHistory(testTextureCoordinates, testOwner, testDepth, 0.001, color, difference);
      }
      fragmentColor = vec4(color.rgb, valid ? 1.0 : 0.0);
      fragmentMetadata = vec4(0.0);
      fragmentLuminance = vec4(0.0);
    }`
    )
  )
  gl.linkProgram(program)
  assert(gl.getProgramParameter(program, gl.LINK_STATUS), gl.getProgramInfoLog(program))
  gl.useProgram(program)
  messages.push('PASS full TAA shader and lookup functions compile and link')

  const getUniformLocation = (name) => gl.getUniformLocation(program, name)
  const size = 8
  const createFilledPixels = (values, Type = Uint8Array) => {
    const data = new Type(size * size * 4)

    for (let index = 0; index < data.length; index += 4) {
      data.set(values, index)
    }

    return data
  }

  const put = (data, x, y, values) => data.set(values, (y * size + x) * 4)

  const encodeMetadata = (owner, depth) => {
    const encoded = Math.round(depth * 65535)

    return [owner % 256, Math.floor(owner / 256), encoded % 256, Math.floor(encoded / 256)]
  }
  const inputs = [
    'currentTexture',
    'historyTexture',
    'historyMetadataTexture',
    'motionVectorTexture',
    'depthTexture',
    'historyLuminanceTexture'
  ].map((name, unit) => {
    const texture = gl.createTexture()

    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    const filter = name === 'historyTexture' ? gl.LINEAR : gl.NEAREST

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(getUniformLocation(name), unit)

    return { texture, unit }
  })
  const upload = (unit, data) => {
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, inputs[unit].texture)

    const floating = data instanceof Float32Array

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      floating ? gl.RGBA32F : gl.RGBA8,
      size,
      size,
      0,
      gl.RGBA,
      floating ? gl.FLOAT : gl.UNSIGNED_BYTE,
      data
    )
  }
  const target = gl.createFramebuffer()

  gl.bindFramebuffer(gl.FRAMEBUFFER, target)

  for (let index = 0; index < 3; index++) {
    const texture = gl.createTexture()

    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      index === 2 ? gl.RGBA8 : gl.RGBA32F,
      size,
      size,
      0,
      gl.RGBA,
      index === 2 ? gl.UNSIGNED_BYTE : gl.FLOAT,
      null
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, texture, 0)
  }

  gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2])
  assert(gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE, 'Incomplete target')
  gl.viewport(0, 0, size, size)

  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

  for (const name of [
    'currentViewProjectionMatrix',
    'previousViewProjectionMatrix',
    'camera.projectionMatrix',
    'camera.reconstructionMatrix'
  ]) {
    gl.uniformMatrix4fv(getUniformLocation(name), false, identity)
  }

  gl.uniform2f(getUniformLocation('camera.clipPlanes'), 1, 100)
  gl.uniform1i(getUniformLocation('historyLength'), 32)
  gl.uniform1i(getUniformLocation('isHistoryValid'), 1)
  gl.uniform1f(getUniformLocation('testOwner'), 2)
  gl.uniform1f(getUniformLocation('testDepth'), 0)

  const reset = () => {
    upload(0, createFilledPixels([0, 0, 0, 255]))
    upload(1, createFilledPixels([0, 0, 0, 255]))
    upload(2, createFilledPixels(encodeMetadata(2, 0)))
    upload(3, createFilledPixels([0, 0, 0, 2], Float32Array))
    upload(4, createFilledPixels([0, 0, 0, 255]))
    upload(5, createFilledPixels([0, 0, 0, 0]))
    gl.uniform1i(getUniformLocation('isHistoryValid'), 1)
    gl.uniform2f(getUniformLocation('testTextureCoordinates'), 3.75 / size, 3.5 / size)
  }

  const draw = (mode = 0, x = 3, y = 3) => {
    gl.uniform1i(getUniformLocation('testMode'), mode)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    const pixel = new Float32Array(4)

    gl.readBuffer(gl.COLOR_ATTACHMENT0)
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.FLOAT, pixel)
    assert(gl.getError() === gl.NO_ERROR, 'WebGL error')

    return pixel
  }

  const test = (name, run) => {
    reset()
    run()
    messages.push(`PASS ${name}`)
  }

  test('stationary subpixel highlights converge without retaining a vanished highlight', () => {
    // Isolate shading variation: fixed owner, exact matching depth, zero motion.
    // Alternating sample locations represent a sharp highlight sampled by jitter.
    let history = createFilledPixels([0, 0, 0, 1], Float32Array)
    let luminanceHistory = createFilledPixels([0, 0, 0, 0])

    const samples = []

    for (let frame = 0; frame < 48; frame++) {
      const currentPixels = createFilledPixels([0, 0, 0, 1], Float32Array)

      put(currentPixels, frame % 2 === 0 ? 3 : 4, 3, [32, 32, 32, 1])
      upload(0, currentPixels)
      upload(1, history)
      upload(5, luminanceHistory)
      gl.uniform1i(getUniformLocation('isHistoryValid'), frame > 0 ? 1 : 0)

      const resolvedLuminance = draw()[0]

      samples.push(resolvedLuminance)

      history = new Float32Array(size * size * 4)

      gl.readPixels(0, 0, size, size, gl.RGBA, gl.FLOAT, history)
      gl.readBuffer(gl.COLOR_ATTACHMENT2)

      luminanceHistory = new Uint8Array(size * size * 4)

      gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, luminanceHistory)
    }

    const steady = samples.slice(-8)

    assert(Math.max(...steady) - Math.min(...steady) < 4, `highlight still flickers: ${steady}`)
    assert(
      steady.every((value) => value > 13 && value < 19),
      `highlight lost energy: ${steady}`
    )
    upload(0, createFilledPixels([0, 0, 0, 255]))
    upload(1, history)
    upload(5, luminanceHistory)
    assertNear(draw()[0], 0, 'vanished highlight is removed immediately')
    messages.push(
      `Stabilized highlight range: ${Math.min(...steady).toFixed(2)}–${Math.max(...steady).toFixed(2)} (previously 0–32)`
    )
  })
  test('recurring luminance cannot bypass owner, depth, motion or material rejection', () => {
    const encoded = Math.round((Math.log2(33) / 16) * 255)
    const prepareRecurring = () => {
      const currentPixels = createFilledPixels([0, 0, 0, 1], Float32Array)

      put(currentPixels, 3, 3, [32, 32, 32, 1])
      upload(0, currentPixels)
      upload(1, createFilledPixels([0, 0, 0, 1], Float32Array))
      upload(5, createFilledPixels([0, encoded, 0, encoded]))
    }

    prepareRecurring()
    assert(draw()[0] < 20, 'valid recurring history is stabilized')
    upload(2, createFilledPixels(encodeMetadata(1, 0)))
    assertNear(draw()[0], 32, 'different owner rejects recurring history')
    upload(2, createFilledPixels(encodeMetadata(2, 0.2)))
    assertNear(draw()[0], 32, 'different depth rejects recurring history')
    upload(2, createFilledPixels(encodeMetadata(2, 0)))
    upload(3, createFilledPixels([0, 0, 0, 2.5], Float32Array))
    assertNear(draw()[0], 32, 'explicit material reactivity disables protection', 0.2)
    upload(3, createFilledPixels([3 / size, 0, 0, 2], Float32Array))
    assertNear(draw()[0], 32, 'fast motion disables protection', 0.2)
    upload(3, createFilledPixels([0, 0, 0, 2], Float32Array))
    gl.uniform1i(getUniformLocation('isHistoryValid'), 0)
    assertNear(draw()[0], 32, 'reset ignores recurring history')
  })
  test('HDR history confidence is invariant to radiance scale', () => {
    const resolve = (scale) => {
      const colors = createFilledPixels([scale, scale, scale, 1], Float32Array)

      for (let y = 2; y <= 4; y++) {
        for (let x = 2; x <= 4; x++) {
          const value = scale * ((x + y) % 2 ? 0.5 : 1.5)

          put(colors, x, y, [value, value, value, 1])
        }
      }

      put(colors, 3, 3, [scale, scale, scale, 1])
      upload(0, colors)
      upload(1, createFilledPixels([0.9 * scale, 0.9 * scale, 0.9 * scale, 1], Float32Array))
      upload(3, createFilledPixels([1 / size, 0, 0, 2], Float32Array))

      return draw()[0]
    }
    const standard = resolve(1)

    assert(standard > 0.9 && standard < 0.999, 'matching moving detail accumulates history')
    assertNear(resolve(100) / 100, standard, 'HDR relative history weight')
  })
  test('bilinear lookup rejects a different owner before filtering', () => {
    const colors = createFilledPixels([0, 0, 0, 255])
    const owners = createFilledPixels(encodeMetadata(2, 0))

    put(colors, 4, 3, [255, 255, 255, 255])
    put(owners, 4, 3, encodeMetadata(1, 0))
    upload(1, colors)
    upload(2, owners)

    const result = draw(1)

    assertNear(result[0], 0, 'foreground leakage')
    assertNear(result[3], 1, 'valid background')
  })
  test('bilinear lookup rejects mismatched depth on the same owner', () => {
    const colors = createFilledPixels([0, 0, 0, 255])
    const depths = createFilledPixels(encodeMetadata(2, 0))

    put(colors, 4, 3, [255, 255, 255, 255])
    put(depths, 4, 3, encodeMetadata(2, 0.1))
    upload(1, colors)
    upload(2, depths)
    assertNear(draw(1)[0], 0, 'depth leakage')
  })
  test('valid bilinear taps retain their interpolation weights', () => {
    const colors = createFilledPixels([0, 0, 0, 255])

    put(colors, 4, 3, [255, 255, 255, 255])
    upload(1, colors)
    assertNear(draw(1)[0], 0.25, 'bilinear interpolation')
  })
  test('four-tap filtering renormalizes only surviving surface samples', () => {
    const colors = createFilledPixels([255, 255, 255, 255])
    const owners = createFilledPixels(encodeMetadata(1, 0))

    put(colors, 3, 3, [0, 0, 0, 255])
    put(owners, 3, 3, encodeMetadata(2, 0))
    put(owners, 4, 4, encodeMetadata(2, 0))
    upload(1, colors)
    upload(2, owners)
    gl.uniform2f(getUniformLocation('testTextureCoordinates'), 3.75 / size, 3.75 / size)
    assertNear(draw(1)[0], 0.1, 'renormalized diagonal weights')
  })
  test('viewport corner renormalizes the remaining valid taps', () => {
    upload(1, createFilledPixels([128, 128, 128, 255]))
    gl.uniform2f(getUniformLocation('testTextureCoordinates'), 0, 0)

    const result = draw(1)

    assertNear(result[0], 128 / 255, 'corner brightness')
    assertNear(result[3], 1, 'corner validity')
  })
  test('no matching history returns invalid and full resolve uses current color', () => {
    upload(0, createFilledPixels([64, 64, 64, 255]))
    upload(1, createFilledPixels([255, 255, 255, 255]))
    upload(2, createFilledPixels(encodeMetadata(1, 0)))
    assertNear(draw(1)[3], 0, 'bilinear validity')
    assertNear(draw(2)[3], 0, 'fallback validity')
    assertNear(draw()[0], 64 / 255, 'current frame fallback')
  })
  test('static recovery rejects same-owner history at a different depth', () => {
    upload(0, createFilledPixels([64, 64, 64, 255]))
    upload(1, createFilledPixels([255, 255, 255, 255]))
    upload(2, createFilledPixels(encodeMetadata(2, 0.1)))
    assertNear(draw(1)[3], 0, 'bilinear depth rejection')
    assertNear(draw(2)[3], 0, 'fallback depth rejection')
    assertNear(draw()[0], 64 / 255, 'disoccluded current color')
  })
  test('static edge recovery fetches only an ownership and depth matched texel', () => {
    const colors = createFilledPixels([255, 255, 255, 255])
    const owners = createFilledPixels(encodeMetadata(1, 0))

    put(colors, 2, 3, [64, 64, 64, 255])
    put(owners, 2, 3, encodeMetadata(2, 0))
    put(owners, 3, 3, encodeMetadata(2, 0.1))
    upload(1, colors)
    upload(2, owners)

    const result = draw(2)

    assertNear(result[0], 64 / 255, 'edge recovery color')
    assertNear(result[3], 1, 'edge recovery validity')
  })
  test('stationary black neighborhood removes contaminated gray history immediately', () => {
    upload(1, createFilledPixels([102, 102, 102, 255]))
    assertNear(draw()[0], 0, 'stale stationary color')
  })
  test('stationary appearance changes reduce history even inside a broad neighborhood', () => {
    // Eight gray neighbors and a black center permit 0.3 history inside the
    // variance box, while its difference from the center exceeds local detail.
    const colors = createFilledPixels([102, 102, 102, 255])

    put(colors, 3, 3, [0, 0, 0, 255])
    upload(0, colors)
    upload(1, createFilledPixels([77, 77, 77, 255]))
    assert(draw()[0] < 0.05, 'stationary appearance change retained too much history')
  })
  test('stationary high contrast subpixel detail still accumulates', () => {
    const colors = createFilledPixels([0, 0, 0, 255])

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const value = (x + y) % 2 ? 255 : 0

        put(colors, x, y, [value, value, value, 255])
      }
    }

    upload(0, colors)
    upload(1, createFilledPixels([128, 128, 128, 255]))

    const result = draw()[0]

    assert(result > 0.45 && result < 0.55, `static detail lost accumulation: ${result}`)
  })
  test('history reset and offscreen reprojection use the current frame', () => {
    upload(0, createFilledPixels([64, 64, 64, 255]))
    upload(1, createFilledPixels([255, 255, 255, 255]))
    gl.uniform1i(getUniformLocation('isHistoryValid'), 0)
    assertNear(draw()[0], 64 / 255, 'history reset')
    gl.uniform1i(getUniformLocation('isHistoryValid'), 1)
    upload(3, createFilledPixels([2, 0, 0, 2], Float32Array))
    assertNear(draw()[0], 64 / 255, 'offscreen history')
  })
  test('moving silhouette exposes a clean stationary background over eight frames', () => {
    let previousX = 0
    let previousColors = createFilledPixels([0, 0, 0, 255])
    let previousMetadata = createFilledPixels(encodeMetadata(2, 0))

    for (let y = 0; y < size; y++) {
      put(previousColors, previousX, y, [255, 255, 255, 255])
      put(previousMetadata, previousX, y, encodeMetadata(1, 0))
    }

    for (const currentX of [1, 2, 3, 4, 5, 4, 3, 2]) {
      const colors = createFilledPixels([0, 0, 0, 255])
      const motion = createFilledPixels([0, 0, 0, 2], Float32Array)

      for (let y = 0; y < size; y++) {
        put(colors, currentX, y, [255, 255, 255, 255])
        put(motion, currentX, y, [(currentX - previousX) / size, 0, 0, 1])
      }

      upload(0, colors)
      upload(1, previousColors)
      upload(2, previousMetadata)
      upload(3, motion)
      assertNear(draw(0, previousX, 3)[0], 0, 'exposed background')

      // Variance clipping can slightly soften a one-pixel silhouette; it must
      // stay bright while the exposed background has no residual contribution.
      assertNear(draw(0, currentX, 3)[0], 1, 'moving silhouette', 0.05)

      const pixels = new Float32Array(size * size * 4)

      gl.readPixels(0, 0, size, size, gl.RGBA, gl.FLOAT, pixels)

      previousColors = Uint8Array.from(pixels, (value) => Math.round(Math.max(0, Math.min(1, value)) * 255))

      gl.readBuffer(gl.COLOR_ATTACHMENT1)
      gl.readPixels(0, 0, size, size, gl.RGBA, gl.FLOAT, pixels)

      previousMetadata = Uint8Array.from(pixels, (value) => Math.round(value * 255))
      previousX = currentX
    }
  })

  results.textContent = messages.join('\n')
  results.dataset.status = 'passed'
} catch (error) {
  results.textContent = [...messages, `FAIL ${error.stack ?? error}`].join('\n')
  results.dataset.status = 'failed'
}
