const results = document.querySelector('#results')
const messages = []
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const assertNear = (actual, expected, label, tolerance = 0.003) =>
  assert(Math.abs(actual - expected) <= tolerance, `${label}: expected ${expected}, got ${actual}`)

const createFilledPixels = (width, height, pixel, isByteTexture = false) => {
  const data = isByteTexture ? new Uint8Array(width * height * 4) : new Float32Array(width * height * 4)

  for (let offset = 0; offset < data.length; offset += 4) {
    data.set(pixel, offset)
  }

  return data
}

const put = (data, width, x, y, pixel) => data.set(pixel, (y * width + x) * 4)

const encodeMetadata = (owner, depth) => {
  const encoded = Math.round(depth * 65535)

  return [owner % 256, Math.floor(owner / 256), encoded % 256, Math.floor(encoded / 256)]
}

// Inverse of perspective depth reconstruction for near=1, far=100.
const encodePerspectiveDepth = (distance) => (100 - 100 / distance) / 99

try {
  const gl = document.querySelector('#canvas').getContext('webgl2')

  assert(gl && gl.getExtension('EXT_color_buffer_float'), 'WebGL2 float targets unavailable')
  gl.getExtension('OES_texture_float_linear')

  const load = async (file) => {
    const response = await fetch(`/graphics/rendering/shaders/${file}`)

    assert(response.ok, `Cannot load ${file}`)

    return response.text()
  }
  const headers = (
    await Promise.all(
      [
        'common/definitions.glsl',
        'common/uniforms.glsl',
        'utilities/reconstruct-depth.glsl',
        'utilities/reconstruct-position.glsl',
        'utilities/octahedral-normal.glsl',
        'effects/tone-mapping.glsl',
        'effects/gamma-correction.glsl',
        'effects/volumetric-upsampling.glsl',
        'effects/physically-based-rendering.glsl'
      ].map(load)
    )
  ).join('\n')
  const compile = (type, source) => {
    const shader = gl.createShader(type)

    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    assert(gl.getShaderParameter(shader, gl.COMPILE_STATUS), gl.getShaderInfoLog(shader))

    return shader
  }
  const vertex = compile(
    gl.VERTEX_SHADER,
    `#version 300 es
    void main() {
      vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
      gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
    }`
  )
  const createShaderFixture = async (file, width = 8, height = 8, wrapper = '', isScalar = false) => {
    const source = await load(file)
    const program = gl.createProgram()

    gl.attachShader(program, vertex)

    const fragment = compile(
      gl.FRAGMENT_SHADER,
      `${headers}\n${
        wrapper
          ? `#define main productionMain\n${source}\n#undef main\nuniform vec2 testTextureCoordinates;\nvoid main() { ${wrapper} }`
          : source
      }`
    )

    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    assert(gl.getProgramParameter(program, gl.LINK_STATUS), `${file}: ${gl.getProgramInfoLog(program)}`)
    gl.useProgram(program)

    const getUniformLocation = (name) => gl.getUniformLocation(program, name)

    const setFloatUniform = (name, value) => gl.uniform1f(getUniformLocation(name), value)

    const setIntegerUniform = (name, value) => gl.uniform1i(getUniformLocation(name), value)

    const setVector2Uniform = (name, x, y) => gl.uniform2f(getUniformLocation(name), x, y)
    const textures = new Map()

    for (let index = 0; index < gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); index++) {
      const uniform = gl.getActiveUniform(program, index)

      if (uniform.type !== gl.SAMPLER_2D && uniform.type !== gl.SAMPLER_CUBE) {
        continue
      }

      const unit = textures.size
      const target = uniform.type === gl.SAMPLER_CUBE ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D
      const texture = gl.createTexture()

      textures.set(uniform.name, { texture, target, unit })
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(target, texture)
      gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

      for (let face = 0; face < (target === gl.TEXTURE_CUBE_MAP ? 6 : 1); face++) {
        gl.texImage2D(
          target === gl.TEXTURE_CUBE_MAP ? gl.TEXTURE_CUBE_MAP_POSITIVE_X + face : target,
          0,
          gl.RGBA8,
          1,
          1,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          new Uint8Array([0, 0, 0, 255])
        )
      }

      setIntegerUniform(uniform.name, unit)
    }

    const upload = (name, width, height, data, isLinear = false) => {
      const entry = textures.get(name)

      assert(entry, `Inactive sampler ${name} in ${file}`)
      gl.activeTexture(gl.TEXTURE0 + entry.unit)
      gl.bindTexture(entry.target, entry.texture)
      gl.texParameteri(entry.target, gl.TEXTURE_MIN_FILTER, isLinear ? gl.LINEAR : gl.NEAREST)
      gl.texParameteri(entry.target, gl.TEXTURE_MAG_FILTER, isLinear ? gl.LINEAR : gl.NEAREST)

      const isByteTexture = data instanceof Uint8Array

      gl.texImage2D(
        entry.target,
        0,
        isByteTexture ? gl.RGBA8 : gl.RGBA32F,
        width,
        height,
        0,
        gl.RGBA,
        isByteTexture ? gl.UNSIGNED_BYTE : gl.FLOAT,
        data
      )
    }
    const target = gl.createFramebuffer()

    gl.bindFramebuffer(gl.FRAMEBUFFER, target)

    const outputs = []

    for (let index = 0; index < 2; index++) {
      const texture = gl.createTexture()

      outputs.push(texture)
      gl.activeTexture(gl.TEXTURE0 + textures.size)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        isScalar ? gl.R16F : gl.RGBA16F,
        width,
        height,
        0,
        isScalar ? gl.RED : gl.RGBA,
        gl.HALF_FLOAT,
        null
      )
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, texture, 0)
    }

    const hasSecondOutput = ['foregroundLayer', 'outMetadata'].some(
      (name) => gl.getFragDataLocation(program, name) === 1
    )

    gl.drawBuffers(hasSecondOutput ? [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1] : [gl.COLOR_ATTACHMENT0])
    assert(gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE, 'Incomplete target')
    gl.viewport(0, 0, width, height)
    setVector2Uniform('camera.clipPlanes', 1, 100)

    const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

    for (const name of [
      'camera.projectionMatrix',
      'camera.reconstructionMatrix',
      'currentViewProjectionMatrix',
      'previousViewProjectionMatrix'
    ]) {
      gl.uniformMatrix4fv(getUniformLocation(name), false, identity)
    }

    const draw = (x = 3, y = 3, attachment = 0) => {
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      gl.readBuffer(gl.COLOR_ATTACHMENT0 + attachment)

      const pixel = new Float32Array(4)

      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.FLOAT, pixel)

      const error = gl.getError()

      assert(error === gl.NO_ERROR, `WebGL error ${error} in ${file}`)

      return pixel
    }

    const dispose = () => {
      for (const { texture } of textures.values()) {
        gl.deleteTexture(texture)
      }

      for (const texture of outputs) {
        gl.deleteTexture(texture)
      }

      gl.deleteFramebuffer(target)
      gl.deleteProgram(program)
      gl.deleteShader(fragment)
    }

    const setMatrix4Uniform = (name, value) => gl.uniformMatrix4fv(getUniformLocation(name), false, value)

    return { setFloatUniform, setIntegerUniform, setVector2Uniform, setMatrix4Uniform, upload, draw, dispose }
  }

  const test = async (name, run) => {
    await run()
    messages.push(`PASS ${name}`)
  }

  await test('GGX filtering preserves flat roughness and filters in microfacet variance space', async () => {
    const testContext = await createShaderFixture(
      'composite.fragment.glsl',
      8,
      8,
      `
      vec3 normal = normalize(vec3((gl_FragCoord.xy - vec2(3.5)) * 0.01, 1.0));
      fragmentColor = vec4(calculateSpecularAntialiasingRoughness(vec3(0.0, 0.0, 1.0), 0.04),
        calculateSpecularAntialiasingRoughness(normal, 0.04), calculateSpecularAntialiasingRoughness(normal, 1.0), 1.0);`
    )
    const pixel = testContext.draw()

    assertNear(pixel[0], 0.04, 'flat-surface roughness')
    assertNear(pixel[1], Math.pow(0.04 ** 4 + 0.0001, 0.25), 'filtered perceptual roughness')
    assertNear(pixel[2], 1, 'roughness upper bound')
    testContext.dispose()
  })

  await test('GGX highlight intensity varies less across the eight projection-jitter samples', async () => {
    const testContext = await createShaderFixture(
      'composite.fragment.glsl',
      8,
      8,
      `
      vec3 normal = normalize(vec3((gl_FragCoord.xy - vec2(3.5) + testTextureCoordinates) * 0.04, 1.0));
      float filtered = calculateSpecularAntialiasingRoughness(normal, 0.04);
      fragmentColor = vec4(0.01 * calculateGgxDistribution(normal.z, filtered), 0.01 * calculateGgxDistribution(normal.z, 0.04), filtered, 1.0);`
    )
    const calculateHalton = (index, base) => {
      let result = 0,
        fraction = 1

      while (index > 0) {
        fraction /= base
        result += fraction * (index % base)
        index = Math.floor(index / base)
      }

      return result
    }
    const filtered = [],
      unfiltered = []

    for (let index = 1; index <= 8; index++) {
      testContext.setVector2Uniform(
        'testTextureCoordinates',
        calculateHalton(index, 2) - 0.5,
        calculateHalton(index, 3) - 0.5
      )

      const pixel = testContext.draw()

      filtered.push(pixel[0])
      unfiltered.push(pixel[1])
    }

    const calculateRelativeRange = (values) =>
      (Math.max(...values) - Math.min(...values)) / (values.reduce((sum, value) => sum + value, 0) / values.length)

    assert(
      calculateRelativeRange(filtered) < 0.5 * calculateRelativeRange(unfiltered),
      'GGX filter failed to reduce jitter variation'
    )
    testContext.dispose()
  })

  await test('object-only blur disables camera fallback for geometry and sky', async () => {
    const testContext = await createShaderFixture(
      'motion-blur.fragment.glsl',
      8,
      8,
      `
      bool isValid;
      vec2 velocity = calculateFallbackVelocity(vec2(0.5), testTextureCoordinates.y, isValid);
      fragmentColor = vec4(velocity, isValid ? 1.0 : 0.0, 1.0);`
    )
    const projection = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -101 / 99, -1, 0, 0, -200 / 99, 0]
    const inverse = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -99 / 200, 0, 0, -1, 101 / 200]
    const cosine = Math.cos(0.2),
      sine = Math.sin(0.2)
    const rotation = [cosine, 0, -sine, 0, 0, 1, 0, 0, sine, 0, cosine, 0, 0, 0, 0, 1]
    const previousViewProjection = Array.from({ length: 16 }, (_, index) => {
      const row = index % 4,
        column = Math.floor(index / 4)

      return [0, 1, 2, 3].reduce(
        (sum, sampleIndex) => sum + projection[sampleIndex * 4 + row] * rotation[column * 4 + sampleIndex],
        0
      )
    })

    testContext.setMatrix4Uniform('camera.projectionMatrix', projection)
    testContext.setMatrix4Uniform('camera.reconstructionMatrix', inverse)
    testContext.setMatrix4Uniform('currentViewProjectionMatrix', projection)
    testContext.setMatrix4Uniform('previousViewProjectionMatrix', previousViewProjection)

    for (const rawDepth of [0.5, 1]) {
      testContext.setVector2Uniform('testTextureCoordinates', 0, rawDepth)
      testContext.setIntegerUniform('isCameraBlurEnabled', 1)

      const enabledResult = testContext.draw()

      assert(Math.abs(enabledResult[0]) > 0.05 && enabledResult[2] === 1, 'camera rotation produces fallback motion')
      testContext.setIntegerUniform('isCameraBlurEnabled', 0)

      const disabledResult = testContext.draw()

      assertNear(disabledResult[0], 0, 'object-only fallback X')
      assertNear(disabledResult[1], 0, 'object-only fallback Y')
      assertNear(disabledResult[2], 0, 'camera fallback is invalid in object-only mode')
    }

    testContext.dispose()
  })

  await test('motion tile ranks pixel speeds on a rectangular viewport', async () => {
    const testContext = await createShaderFixture('motion-blur-tile.fragment.glsl', 2, 1)
    const motion = createFilledPixels(32, 16, [0, 0, 0, 0])

    put(motion, 32, 0, 0, [20 / 32, 0, 0, 1])
    put(motion, 32, 1, 0, [0, 15 / 16, 0, 1])
    testContext.upload('motionVectorTexture', 32, 16, motion)
    assertNear(testContext.draw(0, 0)[0], 20 / 32, 'dominant horizontal velocity')
    testContext.dispose()
  })

  await test('neighbor dilation reaches two tiles only for large blur footprints', async () => {
    const testContext = await createShaderFixture('motion-blur-neighbor.fragment.glsl', 3, 1)

    testContext.setVector2Uniform('motionResolution', 48, 16)

    const motion = createFilledPixels(3, 1, [0, 0, 0, 0])

    put(motion, 3, 2, 0, [0.5, 0, 0, 1])
    testContext.upload('tileVelocityTexture', 3, 1, motion)
    testContext.setFloatUniform('maximumRadius', 64)
    assertNear(testContext.draw(0, 0)[0], 0.5, 'two-tile coverage')
    testContext.setFloatUniform('maximumRadius', 32)
    assertNear(testContext.draw(0, 0)[0], 0, 'one-tile coverage')
    testContext.dispose()
  })

  await test('neighbor maximum and resolve both rank speeds in pixels', async () => {
    const neighbor = await createShaderFixture('motion-blur-neighbor.fragment.glsl', 3, 1)

    neighbor.setVector2Uniform('motionResolution', 48, 16)
    neighbor.setFloatUniform('maximumRadius', 32)

    const tiles = createFilledPixels(3, 1, [0, 0, 0, 0])

    put(tiles, 3, 0, 0, [20 / 48, 0, 0, 1])
    put(tiles, 3, 1, 0, [0, 15 / 16, 0, 1])
    neighbor.upload('tileVelocityTexture', 3, 1, tiles)
    assertNear(neighbor.draw(0, 0)[0], 20 / 48, 'neighbor dominant velocity')
    neighbor.dispose()

    const testContext = await createShaderFixture('motion-blur.fragment.glsl', 64, 32)
    const colors = createFilledPixels(64, 32, [0, 0, 0, 1])

    for (let x = 0; x < 64; x++) {
      if (x !== 31) {
        put(colors, 64, x, 15, [1, 1, 1, 1])
      }
    }

    testContext.upload('currentTexture', 64, 32, colors, true)
    testContext.upload('motionVectorTexture', 64, 32, createFilledPixels(64, 32, [20 / 64, 0, 0, 1]))
    testContext.upload('depthTexture', 64, 32, createFilledPixels(64, 32, [0, 0, 0, 1]))
    testContext.upload('neighborVelocityTexture', 4, 2, createFilledPixels(4, 2, [0, 15 / 32, 0, 1]))
    testContext.setFloatUniform('shutterAngle', 360)
    testContext.setFloatUniform('maximumRadius', 32)
    testContext.setIntegerUniform('maximumSamples', 24)

    const unitRadiance = testContext.draw(31, 15)[0]

    assert(unitRadiance > 0.7, 'resolve chose slower vertical neighbor')
    testContext.setIntegerUniform('isCameraBlurEnabled', 1)
    assertNear(testContext.draw(31, 15)[0], unitRadiance, 'moving surfaces blur equally with either camera setting')

    for (let index = 0; index < colors.length; index += 4) {
      colors[index] *= 16
      colors[index + 1] *= 16
      colors[index + 2] *= 16
    }

    testContext.upload('currentTexture', 64, 32, colors, true)

    const blurredRadiance = testContext.draw(31, 15)[0]

    assertNear(blurredRadiance, unitRadiance * 16, 'HDR motion blur retains highlight energy', 0.02)
    testContext.dispose()

    const present = await createShaderFixture('present.fragment.glsl')

    present.upload(
      'baseTexture',
      8,
      8,
      createFilledPixels(8, 8, [blurredRadiance, blurredRadiance, blurredRadiance, 1])
    )
    present.setIntegerUniform('isToneMappingEnabled', 1)
    present.setIntegerUniform('isGammaCorrectionEnabled', 1)

    const mapped = Math.min(
      1,
      (blurredRadiance * (2.51 * blurredRadiance + 0.03)) / (blurredRadiance * (2.43 * blurredRadiance + 0.59) + 0.14)
    )

    assertNear(present.draw()[0], Math.pow(mapped, 1 / 2.2), 'tone mapping follows HDR blur')
    present.setIntegerUniform('isToneMappingEnabled', 0)
    present.setIntegerUniform('isGammaCorrectionEnabled', 0)
    assertNear(present.draw()[0], blurredRadiance, 'debug presentation bypasses conversion', 0.02)
    present.dispose()
  })

  await test('odd-sized viewport selects the actual 16-pixel motion tile', async () => {
    const testContext = await createShaderFixture('motion-blur.fragment.glsl', 33, 8)
    const colors = createFilledPixels(33, 8, [1, 1, 1, 1])

    put(colors, 33, 15, 3, [0, 0, 0, 1])

    const motion = createFilledPixels(33, 8, [8 / 33, 0, 0, 1])

    put(motion, 33, 15, 3, [0, 0, 0, 1])
    testContext.upload('currentTexture', 33, 8, colors, true)
    testContext.upload('motionVectorTexture', 33, 8, motion)
    testContext.upload('depthTexture', 33, 8, createFilledPixels(33, 8, [0, 0, 0, 1]))

    const neighbors = createFilledPixels(3, 1, [8 / 33, 0, 0, 1])

    put(neighbors, 3, 0, 0, [0, 0, 0, 0])
    testContext.upload('neighborVelocityTexture', 3, 1, neighbors)
    testContext.setFloatUniform('shutterAngle', 360)
    testContext.setFloatUniform('maximumRadius', 32)
    testContext.setIntegerUniform('maximumSamples', 24)
    assertNear(testContext.draw(15, 3)[0], 0, 'pixel 15 belongs to tile zero')
    testContext.dispose()
  })

  const createAmbientOcclusionFixture = async () => {
    const testContext = await createShaderFixture('ambient-occlusion-temporal.fragment.glsl')

    testContext.setVector2Uniform('ambientOcclusionResolution', 8, 8)
    testContext.setIntegerUniform('isHistoryValid', 1)
    testContext.setFloatUniform('temporalStability', 0.9)

    const visibility = createFilledPixels(8, 8, [0.5, 0, 0, 1])

    put(visibility, 8, 2, 3, [0, 0, 0, 1])
    put(visibility, 8, 3, 2, [1, 0, 0, 1])
    testContext.upload('currentAmbientOcclusionTexture', 8, 8, visibility)
    testContext.upload('depthTexture', 8, 8, createFilledPixels(8, 8, [0, 0, 0, 1]))
    testContext.upload('normalTexture', 8, 8, createFilledPixels(8, 8, [0.5, 0.5, 0, 1]))
    testContext.upload('motionVectorTexture', 8, 8, createFilledPixels(8, 8, [-0.25 / 8, 0, 0, 2]))
    testContext.upload('historyTexture', 8, 8, createFilledPixels(8, 8, [0.5, 0, 0.5, 0.5]), true)
    testContext.upload('historyMetadataTexture', 8, 8, createFilledPixels(8, 8, encodeMetadata(2, 0), true))

    return testContext
  }

  await test('AO rejects history from another owner before interpolation', async () => {
    const testContext = await createAmbientOcclusionFixture()
    const history = createFilledPixels(8, 8, [0.5, 0, 0.5, 0.5])

    put(history, 8, 4, 3, [0, 0, 0.5, 0.5])

    const owners = createFilledPixels(8, 8, encodeMetadata(2, 0), true)

    put(owners, 8, 4, 3, encodeMetadata(1, 0))
    testContext.upload('historyTexture', 8, 8, history, true)
    testContext.upload('historyMetadataTexture', 8, 8, owners)
    assertNear(testContext.draw()[0], 0.5, 'AO owner leakage')
    testContext.dispose()
  })

  await test('AO rejects sub-eight-bit depth changes and preserves 16-bit metadata', async () => {
    const testContext = await createAmbientOcclusionFixture()
    const currentPixels = createFilledPixels(8, 8, [0.5, 0, 0, 1])

    put(currentPixels, 8, 2, 3, [0.4, 0, 0, 1])
    testContext.upload('currentAmbientOcclusionTexture', 8, 8, currentPixels)
    testContext.upload('historyTexture', 8, 8, createFilledPixels(8, 8, [0.4, 0, 0.5, 0.5]))
    testContext.upload('historyMetadataTexture', 8, 8, createFilledPixels(8, 8, encodeMetadata(2, 0.001), true))
    assertNear(testContext.draw()[0], 0.5, 'depth rejection')

    const motion = createFilledPixels(8, 8, [0, 0, 0, 65535])

    testContext.upload('motionVectorTexture', 8, 8, motion)
    testContext.upload('depthTexture', 8, 8, createFilledPixels(8, 8, [encodePerspectiveDepth(10), 0, 0, 1]))

    const encoded = testContext.draw(3, 3, 1)

    assertNear(encoded[0], 1, 'owner low byte')
    assertNear(encoded[1], 1, 'owner high byte')
    assertNear((Math.round(encoded[2] * 255) + Math.round(encoded[3] * 255) * 256) / 65535, 0.5, 'depth encoding')
    testContext.dispose()
  })

  await test('AO reacts to a changed occluder on stationary geometry', async () => {
    const testContext = await createAmbientOcclusionFixture()

    testContext.upload('motionVectorTexture', 8, 8, createFilledPixels(8, 8, [0, 0, 0, 2]))

    const currentPixels = createFilledPixels(8, 8, [0.6, 0, 0, 1])

    put(currentPixels, 8, 3, 3, [1, 0, 0, 1])
    testContext.upload('currentAmbientOcclusionTexture', 8, 8, currentPixels)
    testContext.upload('historyTexture', 8, 8, createFilledPixels(8, 8, [0.7, 0, 0.5, 0.5]))
    assert(testContext.draw()[0] > 0.95, 'occluder history inside neighborhood bounds retained')
    testContext.dispose()
  })

  await test('AO rejects mismatched normals while retaining stable noisy history', async () => {
    const testContext = await createAmbientOcclusionFixture()

    testContext.upload('motionVectorTexture', 8, 8, createFilledPixels(8, 8, [0, 0, 0, 2]))
    testContext.upload('historyTexture', 8, 8, createFilledPixels(8, 8, [0.4, 0, 0.5, 0.5]))
    assertNear(testContext.draw()[0], 0.41, 'stable history accumulation')
    testContext.upload('historyTexture', 8, 8, createFilledPixels(8, 8, [0.4, 0, 1, 0.5]))
    assertNear(testContext.draw()[0], 0.5, 'normal rejection')
    testContext.dispose()
  })

  await test('DOF background upsampling uses visible and peeled depth instead of a mixed guide', async () => {
    const testContext = await createShaderFixture(
      'composite.fragment.glsl',
      8,
      8,
      'fragmentColor = vec4(sampleDepthOfFieldBackground(testTextureCoordinates), 1.0);'
    )

    testContext.setVector2Uniform('testTextureCoordinates', 3.75 / 8, 3.5 / 8)
    testContext.upload('depthTexture', 8, 8, createFilledPixels(8, 8, [0, 0, 0, 1]))
    testContext.upload('sceneTexture', 8, 8, createFilledPixels(8, 8, [0.2, 0.2, 0.2, 1]))
    testContext.setIntegerUniform('isDepthOfFieldOverridden', 1)
    testContext.setFloatUniform('depthOfFieldFocusDistance', 1)
    testContext.setFloatUniform('depthOfFieldFocalLength', 50)
    testContext.setFloatUniform('depthOfFieldSensorHeight', 24)
    testContext.setFloatUniform('depthOfFieldFStop', 1)
    testContext.setFloatUniform('depthOfFieldMaximumBlurRadius', 40)

    const layers = createFilledPixels(8, 8, [0, 0, 0, 0.01])

    put(layers, 8, 4, 3, [1, 1, 1, 1])
    testContext.upload('depthOfFieldBackgroundTexture', 8, 8, layers, true)
    testContext.upload('depthOfFieldBackingDepthTexture', 8, 8, createFilledPixels(8, 8, [1, 0, 0, 1]))
    assertNear(testContext.draw()[0], 0, 'background upsampling leakage')
    testContext.setFloatUniform('depthOfFieldFocusDistance', 10)
    testContext.setFloatUniform('depthOfFieldFocalLength', 500)
    assertNear(testContext.draw()[0], 1, 'peeled depth guides foreground backing')
    testContext.setFloatUniform('depthOfFieldFocusDistance', 1)
    testContext.upload('depthOfFieldBackgroundTexture', 8, 8, createFilledPixels(8, 8, [1, 1, 1, 1]), true)
    assertNear(testContext.draw()[0], 0.2, 'no compatible coarse sample uses current scene')
    testContext.dispose()
  })

  await test('DOF gather rejects same-depth colors owned by another surface', async () => {
    const testContext = await createShaderFixture(
      'depth-of-field-layers.fragment.glsl',
      8,
      8,
      'backgroundLayer = vec4(sampleScene(testTextureCoordinates), 1.0); foregroundLayer = vec4(0.0);'
    )

    testContext.setVector2Uniform('testTextureCoordinates', 3.75 / 8, 3.5 / 8)
    testContext.upload('depthTexture', 8, 8, createFilledPixels(8, 8, [0, 0, 0, 1]))
    testContext.upload('sceneTexture', 8, 8, createFilledPixels(8, 8, [0.2, 0.2, 0.2, 1]))

    const colors = createFilledPixels(8, 8, [0, 0, 0, 1])

    put(colors, 8, 4, 3, [1, 1, 1, 1])

    const owners = createFilledPixels(8, 8, [1, 0, 0, 1])

    put(owners, 8, 4, 3, [0.5, 0, 0, 1])
    testContext.upload('prefilteredSceneTexture', 8, 8, colors, true)
    testContext.upload('surfaceOwnershipTexture', 8, 8, owners)
    assertNear(testContext.draw()[0], 0, 'same-depth ownership leakage')

    const thinOwner = createFilledPixels(8, 8, [1, 0, 0, 1])

    put(thinOwner, 8, 2, 3, [0.5, 0, 0, 1])
    testContext.upload('surfaceOwnershipTexture', 8, 8, thinOwner)
    testContext.upload('prefilteredSceneTexture', 4, 4, createFilledPixels(4, 4, [1, 1, 1, 1]), true)
    testContext.setVector2Uniform('testTextureCoordinates', 2.5 / 8, 3.5 / 8)
    assertNear(testContext.draw()[0], 0.2, 'thin surface uses its full-resolution source')
    testContext.dispose()
  })

  await test('DOF prefilter excludes a different owner even at the same depth', async () => {
    const testContext = await createShaderFixture('depth-of-field-prefilter.fragment.glsl', 4, 4)

    testContext.setVector2Uniform('destinationSize', 4, 4)

    const colors = createFilledPixels(8, 8, [0, 0, 0, 1])

    put(colors, 8, 6, 6, [1, 1, 1, 1])

    const owners = createFilledPixels(8, 8, [1, 0, 0, 1])

    put(owners, 8, 6, 6, [0.5, 0, 0, 1])
    testContext.upload('sceneTexture', 8, 8, colors)
    testContext.upload('surfaceOwnershipTexture', 8, 8, owners)
    testContext.upload('depthTexture', 8, 8, createFilledPixels(8, 8, [0, 0, 0, 1]))
    assertNear(testContext.draw()[0], 0, 'prefilter ownership leakage')
    testContext.dispose()
  })

  await test('DOF radius survives the R16F scalar target', async () => {
    const testContext = await createShaderFixture('depth-of-field-dilate.fragment.glsl', 4, 4, '', true)

    testContext.setVector2Uniform('destinationSize', 4, 4)
    testContext.setVector2Uniform('dilationDirection', 1, 0)
    testContext.setIntegerUniform('isSourceDepth', 0)
    testContext.setFloatUniform('depthOfFieldMaximumBlurRadius', 40)
    testContext.upload('foregroundRadiusTexture', 4, 4, createFilledPixels(4, 4, [17.25, 0, 0, 1]))
    assertNear(testContext.draw()[0], 17.25, 'radius in pixels')
    testContext.dispose()
  })

  await test('linear scene resolve retains HDR before optical processing', async () => {
    const testContext = await createShaderFixture('composite.fragment.glsl')

    testContext.upload('sceneTexture', 8, 8, createFilledPixels(8, 8, [32, 8, 2, 1]))
    testContext.upload('depthTexture', 8, 8, createFilledPixels(8, 8, [0, 0, 0, 1]))
    assertNear(testContext.draw()[0], 32, 'HDR highlight')
    testContext.dispose()
  })

  await test('volumetric depth snapshot captures the integration texel on odd dimensions', async () => {
    const testContext = await createShaderFixture('volumetric-depth.fragment.glsl', 3, 1)

    testContext.setVector2Uniform('destinationSize', 3, 1)

    const depths = createFilledPixels(5, 1, [0, 0, 0, 1])

    put(depths, 5, 2, 0, [0.75, 0, 0, 1])
    testContext.upload('depthTexture', 5, 1, depths)
    assertNear(testContext.draw(1, 0)[0], 0.75, 'snapshot source coordinate')
    testContext.dispose()
  })

  await test('volume reconstruction rejects incompatible ray endpoints before filtering light', async () => {
    const testContext = await createShaderFixture(
      'volumetric-composite.fragment.glsl',
      8,
      8,
      'outColor = vec4(sampleVolumetricLighting(testTextureCoordinates, depthTexture), 1.0);'
    )

    testContext.setIntegerUniform('isVolumetricLightingEnabled', 1)
    testContext.setVector2Uniform('testTextureCoordinates', 3.75 / 8, 3.5 / 8)

    const colors = createFilledPixels(8, 8, [0, 0, 0, 1])

    put(colors, 8, 4, 3, [1, 1, 1, 1])

    const endpoints = createFilledPixels(8, 8, [0, 0, 0, 1])

    put(endpoints, 8, 4, 3, [1, 0, 0, 1])
    testContext.upload('volumetricTexture', 8, 8, colors, true)
    testContext.upload('volumetricDepthTexture', 8, 8, endpoints)
    testContext.upload('depthTexture', 8, 8, createFilledPixels(8, 8, [0, 0, 0, 1]))
    assertNear(testContext.draw()[0], 0, 'sky light leakage')
    testContext.upload('volumetricDepthTexture', 8, 8, createFilledPixels(8, 8, [0, 0, 0, 1]))
    assertNear(testContext.draw()[0], 0.25, 'valid light interpolation')
    testContext.upload('depthTexture', 8, 8, createFilledPixels(8, 8, [encodePerspectiveDepth(10), 0, 0, 1]))
    assertNear(testContext.draw()[0], 0, 'changed receiver does not validate stale endpoints')
    testContext.dispose()
  })

  await test('composite and bloom retain the opaque volume guide after glass writes scene depth', async () => {
    const composite = await createShaderFixture('composite.fragment.glsl')

    composite.upload('sceneTexture', 8, 8, createFilledPixels(8, 8, [0.2, 0.2, 0.2, 1]))
    composite.upload('depthTexture', 8, 8, createFilledPixels(8, 8, [0, 0, 0, 1]))
    composite.upload(
      'volumetricSceneDepthTexture',
      8,
      8,
      createFilledPixels(8, 8, [encodePerspectiveDepth(10), 0, 0, 1])
    )
    composite.upload('volumetricDepthTexture', 4, 4, createFilledPixels(4, 4, [encodePerspectiveDepth(10), 0, 0, 1]))
    composite.upload('volumetricTexture', 4, 4, createFilledPixels(4, 4, [0.4, 0.4, 0.4, 1]))
    composite.setIntegerUniform('isVolumetricLightingEnabled', 1)
    assertNear(composite.draw()[0], 0.6, 'composite restores volume behind glass')
    composite.dispose()

    const bloom = await createShaderFixture('bloom-extract.fragment.glsl')

    bloom.setVector2Uniform('destinationSize', 8, 8)
    bloom.upload('baseTexture', 8, 8, createFilledPixels(8, 8, [0, 0, 0, 1]))
    bloom.upload('depthTexture', 8, 8, createFilledPixels(8, 8, [0, 0, 0, 1]))
    bloom.upload('volumetricSceneDepthTexture', 8, 8, createFilledPixels(8, 8, [encodePerspectiveDepth(10), 0, 0, 1]))
    bloom.upload('volumetricDepthTexture', 4, 4, createFilledPixels(4, 4, [encodePerspectiveDepth(10), 0, 0, 1]))
    bloom.upload('volumetricTexture', 4, 4, createFilledPixels(4, 4, [0.4, 0.4, 0.4, 1]))
    bloom.setIntegerUniform('isVolumetricLightingEnabled', 1)
    assertNear(bloom.draw()[0], 0.4, 'bloom restores volume behind glass')
    bloom.dispose()
  })

  results.textContent = messages.join('\n')
  results.dataset.status = 'passed'
} catch (error) {
  results.textContent = [...messages, `FAIL ${error.stack ?? error}`].join('\n')
  results.dataset.status = 'failed'
}
