const results = document.querySelector('#results')
const messages = []
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const dot = (actualValue, expectedValue) =>
  actualValue.reduce((sum, value, index) => sum + value * expectedValue[index], 0)

const normalizeVector = (vector) => vector.map((value) => value / Math.hypot(...vector))

const load = async (name) => {
  const response = await fetch(`/graphics/rendering/shaders/${name}`)

  assert(response.ok, `Could not load ${name}`)

  return response.text()
}

try {
  const gl = document.querySelector('#canvas').getContext('webgl2')

  assert(gl, 'WebGL2 unavailable')
  assert(gl.getExtension('EXT_color_buffer_float'), 'Float targets unavailable')

  const compile = (type, source) => {
    const shader = gl.createShader(type)

    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    assert(gl.getShaderParameter(shader, gl.COMPILE_STATUS), gl.getShaderInfoLog(shader))

    return shader
  }

  const createProgram = (vertexSource, fragmentSource) => {
    const value = gl.createProgram()
    const vertex = compile(gl.VERTEX_SHADER, vertexSource)
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource)

    gl.attachShader(value, vertex)
    gl.attachShader(value, fragment)
    gl.linkProgram(value)
    assert(gl.getProgramParameter(value, gl.LINK_STATUS), gl.getProgramInfoLog(value))
    gl.deleteShader(vertex)
    gl.deleteShader(fragment)

    return value
  }
  const cone = await load('effects/volumetric-cone.glsl')
  const vertex = `#version 300 es
    void main() {
      vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
      gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
    }`
  const coneProgram = createProgram(
    vertex,
    `#version 300 es
    precision highp float;
    ${cone}
    uniform vec3 origin, direction, axis;
    uniform float cosine, segmentStart, segmentEnd;
    out vec4 value;
    void main() {
      float start = segmentStart, end = segmentEnd;
      bool hit = clipVolumetricCone(origin, direction, axis, cosine, start, end);
      value = vec4(start, end, hit ? 1.0 : 0.0, 1.0);
    }`
  )
  const texture = gl.createTexture()

  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 1, 1, 0, gl.RGBA, gl.FLOAT, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)

  const target = gl.createFramebuffer()

  gl.bindFramebuffer(gl.FRAMEBUFFER, target)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  assert(gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE, 'Incomplete target')
  gl.useProgram(coneProgram)

  const intersect = ({ origin, direction, axis = [0, 0, 1], cosine = Math.SQRT1_2, start = 0, end = 10 }) => {
    for (const [name, value] of Object.entries({ origin, direction, axis })) {
      gl.uniform3fv(gl.getUniformLocation(coneProgram, name), value)
    }

    for (const [name, value] of Object.entries({ cosine, segmentStart: start, segmentEnd: end })) {
      gl.uniform1f(gl.getUniformLocation(coneProgram, name), value)
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3)

    const pixel = new Float32Array(4)

    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, pixel)

    return pixel
  }
  const cases = [
    { name: 'through apex', origin: [0, 0, -2], direction: [0, 0, 1], expected: [2, 10] },
    { name: 'camera inside', origin: [0, 0, 2], direction: [1, 0, 0], expected: [0, 2] },
    { name: 'camera inside facing apex', origin: [0, 0, 2], direction: [0, 0, -1], expected: [0, 2] },
    { name: 'transverse', origin: [-4, 0, 2], direction: [1, 0, 0], expected: [2, 6] },
    { name: 'back cone rejected', origin: [-4, 0, -2], direction: [1, 0, 0], expected: null },
    { name: 'scene clips exit', origin: [-4, 0, 2], direction: [1, 0, 0], end: 3, expected: [2, 3] },
    { name: 'scene before entry', origin: [-4, 0, 2], direction: [1, 0, 0], end: 1, expected: null },
    { name: 'near plane inside cone', origin: [-4, 0, 2], direction: [1, 0, 0], start: 3, expected: [3, 6] },
    { name: 'parallel to edge', origin: [1, 0, 2], direction: normalizeVector([1, 0, 1]), expected: [0, 10] },
    { name: 'outside edge parallel', origin: [3, 0, 2], direction: normalizeVector([1, 0, 1]), expected: null },
    { name: 'wide cone fallback', origin: [10, 0, -2], direction: [1, 0, 0], cosine: 0, expected: [0, 10] }
  ]

  for (const test of cases) {
    const [start, end, hit] = intersect(test)

    assert(Boolean(hit) === Boolean(test.expected), `${test.name}: hit=${hit}`)

    if (test.expected) {
      assert(
        Math.abs(start - test.expected[0]) < 0.001 && Math.abs(end - test.expected[1]) < 0.001,
        `${test.name}: interval ${start}, ${end}`
      )
    }

    messages.push(`PASS ${test.name}`)
  }

  let seed = 7319

  const generateRandom = () => {
    seed = (1664525 * seed + 1013904223) >>> 0

    return seed / 4294967296
  }

  for (let index = 0; index < 250; index++) {
    const test = {
      origin: [generateRandom() * 12 - 6, generateRandom() * 12 - 6, generateRandom() * 12 - 6],
      direction: normalizeVector([generateRandom() - 0.5, generateRandom() - 0.5, generateRandom() - 0.5]),
      axis: normalizeVector([generateRandom() - 0.5, generateRandom() - 0.5, generateRandom() - 0.5]),
      cosine: Math.cos(((5 + generateRandom() * 80) * Math.PI) / 180)
    }
    const [start, end, hit] = intersect(test)

    for (let secondIndex = 0; secondIndex < 1000; secondIndex++) {
      const testContext = (secondIndex + 0.5) / 100
      const position = test.origin.map((value, index) => value + test.direction[index] * testContext)
      const distance = Math.hypot(...position)
      const margin = dot(position, test.axis) - test.cosine * distance

      if (Math.abs(margin) < 0.002) {
        continue
      }

      const expected = margin >= 0
      const actual = hit > 0 && testContext >= start && testContext <= end

      assert(
        actual === expected,
        `Random ray ${index} at ${testContext}: expected ${expected}, interval ${start},${end},${hit}`
      )
    }
  }

  messages.push('PASS 250 randomized rays against direct cone membership (250,000 samples)')

  const definitions = await load('common/definitions.glsl')
  const uniforms = await load('common/uniforms.glsl')
  const reconstruct = await load('utilities/reconstruct-position.glsl')
  const volumeSource = `${definitions}\n${uniforms}\n${await load('effects/shadow-mapping.glsl')}\n${reconstruct}\n${cone}\n${await load('volumetric-light.fragment.glsl')}`
  const volumeProgram = createProgram(vertex, volumeSource)

  messages.push('PASS full volumetric fragment shader compiles and links')
  gl.useProgram(volumeProgram)

  const getUniformLocation = (name) => gl.getUniformLocation(volumeProgram, name)

  const setScalarUniform = (name, value) => gl.uniform1f(getUniformLocation(name), value)
  const inputTextures = []

  for (const [unit, name] of ['depthTexture', 'shadowTexture', 'noiseTexture'].entries()) {
    const input = gl.createTexture()

    inputTextures.push(input)
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, input)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 1, 1, 0, gl.RGBA, gl.FLOAT, new Float32Array([1, 1, 1, 1]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.uniform1i(getUniformLocation(name), unit)
  }

  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

  gl.uniformMatrix4fv(getUniformLocation('camera.reconstructionMatrix'), false, identity)
  gl.uniformMatrix4fv(getUniformLocation('light.textureMatrix'), false, identity)
  gl.uniform3f(getUniformLocation('light.translation'), 0, 0, -1)
  gl.uniform3f(getUniformLocation('light.direction'), 0, 0, -1)
  gl.uniform3f(getUniformLocation('light.color'), 1, 1, 1)
  gl.uniform2f(getUniformLocation('volumetricResolution'), 1, 1)
  gl.uniform1i(getUniformLocation('areShadowsEnabled'), 0)

  for (const [name, value] of Object.entries({
    'light.range': 4,
    'light.coneAngle': 45,
    'light.coneFalloff': 0,
    'light.intensity': 1,
    'light.volumetricIntensity': 0.2,
    'light.volumetricDensity': 0.1,
    'light.volumetricNoiseStrength': 0,
    'light.volumetricNoiseScale': 1.5,
    'light.volumetricNoiseSpeed': 0.002,
    volumetricIntensityMultiplier: 1
  })) {
    setScalarUniform(name, value)
  }

  const drawVolume = (samples) => {
    gl.uniform1i(getUniformLocation('volumetricSampleCount'), samples)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    const pixel = new Float32Array(4)

    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, pixel)
    assert(pixel.every(Number.isFinite), 'Non-finite volume output')

    return pixel
  }
  const medium = drawVolume(24)

  assert(medium[0] > 0 && medium[3] === 1, 'Volume must have RGB and additive alpha one')

  for (const samples of [16, 48]) {
    assert(Math.abs(drawVolume(samples)[0] / medium[0] - 1) < 0.03, 'Sample count changed energy excessively')
  }

  gl.uniform4f(getUniformLocation('clipPlane'), 0, 0, 1, 0)

  const clipped = drawVolume(24)[0]

  assert(clipped > 0 && clipped < medium[0], 'Mirror plane must clip the virtual-camera side of the ray')
  gl.uniform4f(getUniformLocation('clipPlane'), 0, 0, 1, -2)
  assert(drawVolume(24)[0] === 0, 'Mirror plane beyond the ray must reject all scattering')
  gl.uniform4f(getUniformLocation('clipPlane'), 1, 0, 0, -1)
  assert(drawVolume(24)[0] === 0, 'Parallel ray outside mirror half-space must be rejected')
  gl.uniform4f(getUniformLocation('clipPlane'), 0, 0, 0, 0)
  assert(drawVolume(24)[0] === medium[0], 'Main view must reset mirror clipping')
  messages.push('PASS mirror-plane clipping, parallel rejection, and main-view reset')
  setScalarUniform('elapsedTime', 1000)
  assert(drawVolume(24)[0] === medium[0], 'Disabled noise must not depend on animation time')
  setScalarUniform('volumetricIntensityMultiplier', 0)
  assert(drawVolume(24)[0] === 0, 'Zero multiplier must disable scattering')
  setScalarUniform('volumetricIntensityMultiplier', 1)
  setScalarUniform('light.volumetricIntensity', 0)
  assert(drawVolume(24)[0] === 0, 'Non-opted-in light must not scatter')
  setScalarUniform('light.volumetricIntensity', 0.2)
  gl.getExtension('EXT_float_blend')
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
  assert(Math.abs(drawVolume(24)[0] - medium[0]) < 1e-6, 'Additive blend suppressed volume contribution')
  gl.disable(gl.BLEND)
  setScalarUniform('light.volumetricNoiseStrength', 0.8)
  gl.uniform1i(getUniformLocation('light.isDirectional'), 1)
  setScalarUniform('light.range', 0)
  setScalarUniform('light.volumetricNoiseStrength', 0)

  const directionalVolume = drawVolume(24)[0]

  assert(directionalVolume > 0, 'Directional volume ignores zero radius')
  gl.uniform3f(getUniformLocation('light.translation'), 1000, 1000, 1000)
  assert(Math.abs(drawVolume(24)[0] - directionalVolume) < 1e-6, 'Directional volume ignores light position')
  messages.push('PASS directional volumetric illumination is independent of position and radius')
  gl.uniform1i(getUniformLocation('light.isDirectional'), 0)
  gl.uniform1i(getUniformLocation('light.isPoint'), 1)
  gl.uniform3f(getUniformLocation('light.translation'), 0, 0, 2)
  gl.uniform3f(getUniformLocation('light.direction'), 1, 0, 0)
  gl.uniform2f(getUniformLocation('light.clipPlanes'), 0.1, 10)
  setScalarUniform('light.range', 4)
  setScalarUniform('light.coneAngle', 0)

  const pointVolume = drawVolume(24)[0]

  assert(pointVolume > 0, 'Point volume ignores the cone')
  gl.uniform3f(getUniformLocation('light.direction'), 0, 1, 0)
  assert(Math.abs(drawVolume(24)[0] - pointVolume) < 1e-6, 'Point volume ignores rotation')
  setScalarUniform('light.range', 0.5)
  assert(drawVolume(24)[0] === 0, 'Point volume stays within its spherical range')
  setScalarUniform('light.range', 4)
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, inputTextures[1])
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 3, 2, 0, gl.RGBA, gl.FLOAT, new Float32Array(24))
  gl.uniform1i(getUniformLocation('areShadowsEnabled'), 1)
  assert(drawVolume(24)[0] === 0, 'Point volume samples the shadow atlas')
  gl.uniform1i(getUniformLocation('areShadowsEnabled'), 0)
  assert(Math.abs(drawVolume(24)[0] - pointVolume) < 1e-6, 'Disabling shadows restores point volume')
  messages.push('PASS point volumetric range, rotation/cone independence, atlas shadows, and shadows toggle')
  gl.uniform1i(getUniformLocation('light.isPoint'), 0)
  gl.uniform3f(getUniformLocation('light.direction'), 0, 0, -1)
  setScalarUniform('light.coneAngle', 45)
  gl.uniform3f(getUniformLocation('light.translation'), 0, 0, -1)
  setScalarUniform('light.range', 4)
  setScalarUniform('light.volumetricNoiseStrength', 0.8)
  setScalarUniform('light.volumetricNoiseSpeed', 0)

  const frozen = drawVolume(24)[0]

  setScalarUniform('elapsedTime', 2000)
  assert(drawVolume(24)[0] === frozen, 'Zero noise speed must freeze the noise')
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, inputTextures[0])
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 1, 1, gl.RGBA, gl.FLOAT, new Float32Array([0, 0, 0, 1]))
  assert(drawVolume(24)[0] === 0, 'Foreground depth must stop scattering')
  messages.push('PASS sample-count energy, disabled/frozen noise, zero intensity, additive alpha, and depth clipping')
  inputTextures.forEach((input) => gl.deleteTexture(input))
  gl.deleteProgram(volumeProgram)

  const upsampling = await load('effects/volumetric-upsampling.glsl')
  const physicallyBasedRendering = await load('effects/physically-based-rendering.glsl')
  const depthReconstruction = await load('utilities/reconstruct-depth.glsl')
  const materialGraph = `
    struct MaterialContext { vec2 textureCoordinates; vec3 position; vec3 worldPosition; vec3 objectPosition; vec3 geometricNormal; vec3 tangent; vec3 bitangent; };
    struct MaterialGlossyClosure { vec3 color; float roughness; vec3 tangentNormal; float weight; };
    struct MaterialSample { vec3 baseColor; float alpha; vec3 tangentNormal; float metallic; float roughness; float occlusion; vec3 emission; float transmission; float indexOfRefraction; float specularLevel; float transmissionDepth; float subsurfaceWeight; float subsurfaceScale; vec3 absorptionColor; float absorptionDensity; float principledWeight; int glossyCount; MaterialGlossyClosure glossy[4]; };
    uniform bool isMaterialAlphaMasked;
    uniform bool isMaterialAlphaBlended;
    uniform float materialTemporalReactive;
    uniform float materialAlphaCutoff;
    uniform float materialTransmissionDepth;
    uniform float materialTransmissionEdgeFade;
    uniform bool isMaterialDoubleSided;
    uniform bool isFrontFaceReversed;
    float luzCalculateMaterialFaceSign() {
      bool isLogicalFrontFacing = isFrontFaceReversed ? !gl_FrontFacing : gl_FrontFacing;
      return isMaterialDoubleSided && !isLogicalFrontFacing ? -1.0 : 1.0;
    }
    mat3 luzCalculateMaterialTangentBasis(MaterialContext context) {
      vec3 normal = normalize(context.geometricNormal);
      vec3 tangent = normalize(context.tangent - normal * dot(normal, context.tangent));
      float handedness = dot(cross(normal, tangent), context.bitangent) < 0.0 ? -1.0 : 1.0;
      return mat3(tangent, normalize(cross(normal, tangent)) * handedness, normal);
    }
    vec3 luzCalculateMaterialWorldNormal(MaterialContext context, vec3 tangentNormal) {
      vec3 fallbackNormal = normalize(context.geometricNormal) * luzCalculateMaterialFaceSign();
      if (dot(tangentNormal, tangentNormal) < 1e-10) return fallbackNormal;
      mat3 basis = luzCalculateMaterialTangentBasis(context);
      return normalize(mat3(basis[0], basis[1] * luzCalculateMaterialFaceSign(), basis[2] * luzCalculateMaterialFaceSign()) * tangentNormal);
    }
    uniform vec3 graphBaseColor;
    uniform float graphAlpha, graphMetallic, graphRoughness, graphOcclusion, graphTransmission, graphIndexOfRefraction;
    uniform vec3 graphNormal, graphEmission;
    MaterialSample evaluateMaterial(MaterialContext context) {
      MaterialSample evaluated;
      evaluated.baseColor = graphBaseColor; evaluated.alpha = graphAlpha; evaluated.tangentNormal = graphNormal;
      evaluated.metallic = graphMetallic; evaluated.roughness = graphRoughness; evaluated.occlusion = graphOcclusion;
      evaluated.emission = graphEmission; evaluated.transmission = graphTransmission;
      evaluated.indexOfRefraction = graphIndexOfRefraction; evaluated.transmissionDepth = materialTransmissionDepth;
      evaluated.specularLevel = 0.5;
      evaluated.subsurfaceWeight = 0.0;
      evaluated.subsurfaceScale = 0.01;
      evaluated.absorptionColor = vec3(1.0);
      evaluated.absorptionDensity = 0.0;
      evaluated.principledWeight = 1.0;
      evaluated.glossyCount = 1;
      evaluated.glossy[0].color = vec3(0.8, 0.9, 1.0);
      evaluated.glossy[0].roughness = 0.08;
      evaluated.glossy[0].tangentNormal = vec3(0.0, 0.0, 1.0);
      evaluated.glossy[0].weight = 0.0;
      return evaluated;
    }
  `
  const attributes = await load('common/attributes.glsl')
  const normalReconstruction = await load('utilities/reconstruct-normal.glsl')
  const octahedralNormal = await load('utilities/octahedral-normal.glsl')
  const toneMapping = await load('effects/tone-mapping.glsl')
  const gammaCorrection = await load('effects/gamma-correction.glsl')
  const shadows = await load('effects/shadow-mapping.glsl')
  const coneHelpers = await load('effects/volumetric-cone.glsl')
  const materialVertexHeader = `${definitions}\n${attributes}\n${uniforms}\n`
  const materialFragmentHeader = `${definitions}\n${attributes}\n${uniforms}\n${reconstruct}\n${normalReconstruction}\n${depthReconstruction}\n${octahedralNormal}\n${toneMapping}\n${gammaCorrection}\n${shadows}\n${upsampling}\n${coneHelpers}\n${physicallyBasedRendering}\n${materialGraph}\n`
  const sceneVertexSource = materialVertexHeader + (await load('scene.vertex.glsl'))
  const depthVertexSource = materialVertexHeader + (await load('depth.vertex.glsl'))
  const motionVectorVertexSource = materialVertexHeader + (await load('motion-vectors.vertex.glsl'))
  const materialStages = [
    ['ambient', sceneVertexSource, 'ambient.fragment.glsl'],
    ['lighting', sceneVertexSource, 'physically-based-lighting.fragment.glsl'],
    ['transparent', sceneVertexSource, 'scene.fragment.glsl'],
    ['transmission', sceneVertexSource, 'transmission.fragment.glsl'],
    ['depth-of-field surface', sceneVertexSource, 'depth-of-field-surface.fragment.glsl'],
    ['ambient-occlusion normal', sceneVertexSource, 'ambient-occlusion-normal.fragment.glsl'],
    ['motion vector', motionVectorVertexSource, 'motion-vectors.fragment.glsl'],
    ['depth', depthVertexSource, 'depth.fragment.glsl'],
    ['shadow', depthVertexSource, 'depth.fragment.glsl']
  ]

  for (const [name, vertexSource, fragmentPath] of materialStages) {
    const stageProgram = createProgram(vertexSource, materialFragmentHeader + (await load(fragmentPath)))

    gl.deleteProgram(stageProgram)
    messages.push(`PASS ${name} material graph shader compiles`)
  }

  // Ambient inherits shared volume samplers that the linker removes.
  // Six material maps used to make the declaration-based preflight reject it.
  const materialMaps = Array.from({ length: 6 }, (_, index) => `testMaterialMap${index}`)
  const texturedGraph =
    materialMaps.map((name) => `uniform sampler2D ${name};`).join('\n') +
    materialGraph.replace(
      'evaluated.baseColor = graphBaseColor;',
      `evaluated.baseColor = ${materialMaps.map((name) => `texture(${name}, context.textureCoordinates).rgb`).join(' + ')};`
    )
  const texturedAmbientSource =
    materialFragmentHeader.replace(materialGraph, texturedGraph) + (await load('ambient.fragment.glsl'))

  assert(
    (texturedAmbientSource.match(/uniform\s+sampler(?:2D|Cube)\s+\w+/g) ?? []).length === 17,
    'Ambient regression must reproduce 17 declared samplers'
  )

  const texturedAmbientProgram = createProgram(sceneVertexSource, texturedAmbientSource)

  let ambientSamplers = 0

  for (let index = 0; index < gl.getProgramParameter(texturedAmbientProgram, gl.ACTIVE_UNIFORMS); index++) {
    const uniform = gl.getActiveUniform(texturedAmbientProgram, index)

    if (uniform.type === gl.SAMPLER_2D || uniform.type === gl.SAMPLER_CUBE) {
      ambientSamplers += uniform.size
    }
  }

  assert(ambientSamplers <= 16, `Ambient uses ${ambientSamplers} active samplers`)

  for (const name of materialMaps) {
    assert(gl.getUniformLocation(texturedAmbientProgram, name) !== null, `Material map ${name} must remain active`)
  }

  for (const name of ['volumetricTexture', 'volumetricDepthTexture', 'volumetricSceneDepthTexture']) {
    assert(gl.getUniformLocation(texturedAmbientProgram, name) === null, `Unused ${name} must be eliminated`)
  }

  gl.deleteProgram(texturedAmbientProgram)
  messages.push(
    `PASS textured ambient links within 16 units (${ambientSamplers} active samplers) despite unused shared declarations`
  )

  // Relying on the driver must still reject genuinely excessive sampler usage.
  const samplerLimit = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)

  for (const count of [samplerLimit, samplerLimit + 1]) {
    const names = Array.from({ length: count }, (_, index) => `limitTexture${index}`)
    const fragmentShader = compile(
      gl.FRAGMENT_SHADER,
      `#version 300 es
      precision highp float;
      ${names.map((name) => `uniform sampler2D ${name};`).join('\n')}
      out vec4 outColor;
      void main() { outColor = ${names.map((name) => `texture(${name}, vec2(0.5))`).join(' + ')}; }`
    )
    const vertexShader = compile(gl.VERTEX_SHADER, vertex)
    const limitProgram = gl.createProgram()

    gl.attachShader(limitProgram, vertexShader)
    gl.attachShader(limitProgram, fragmentShader)
    gl.linkProgram(limitProgram)
    assert(
      gl.getProgramParameter(limitProgram, gl.LINK_STATUS) === count <= samplerLimit,
      `Driver must enforce the ${samplerLimit}-sampler limit for ${count} active textures`
    )
    gl.deleteProgram(limitProgram)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
  }

  messages.push(`PASS WebGL accepts ${samplerLimit} active samplers and rejects ${samplerLimit + 1}`)

  for (const fragmentPath of [
    'ambient-occlusion.fragment.glsl',
    'ambient-occlusion-temporal.fragment.glsl',
    'ambient-occlusion-blur.fragment.glsl',
    'ambient-occlusion-upsample.fragment.glsl'
  ]) {
    const stageProgram = createProgram(vertex, materialFragmentHeader + (await load(fragmentPath)))

    gl.deleteProgram(stageProgram)
    messages.push(`PASS ${fragmentPath} compiles`)
  }

  for (const [name, internalFormat, dataFormat] of [
    ['R8 ambient-occlusion visibility', gl.R8, gl.RED],
    ['RG8 octahedral normals', gl.RG8, gl.RG]
  ]) {
    const compactTexture = gl.createTexture()

    gl.bindTexture(gl.TEXTURE_2D, compactTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 2, 2, 0, dataFormat, gl.UNSIGNED_BYTE, null)

    const compactTarget = gl.createFramebuffer()

    gl.bindFramebuffer(gl.FRAMEBUFFER, compactTarget)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, compactTexture, 0)
    assert(gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE, `${name} target is incomplete`)
    gl.deleteFramebuffer(compactTarget)
    gl.deleteTexture(compactTexture)
    messages.push(`PASS ${name} target is framebuffer complete`)
  }

  const depthPeelProgram = createProgram(
    vertex,
    `#version 300 es
    precision highp float;
    uniform bool isDepthPeelingEnabled;
    uniform sampler2D depthPeelTexture;
    uniform vec2 depthPeelViewportSize;
    out vec4 value;
    void main() {
      if (isDepthPeelingEnabled) {
        vec2 coordinates = gl_FragCoord.xy / max(depthPeelViewportSize, vec2(1.0));
        float frontDepth = texture(depthPeelTexture, coordinates).r;
        if (frontDepth >= 1.0 - 1e-6 || gl_FragCoord.z <= frontDepth + 1e-6) discard;
      }
      value = vec4(1.0);
    }
  `
  )
  const depthPeelInput = gl.createTexture()

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, depthPeelInput)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 1, 1, 0, gl.RGBA, gl.FLOAT, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.bindFramebuffer(gl.FRAMEBUFFER, target)
  gl.drawBuffers([gl.COLOR_ATTACHMENT0])
  gl.useProgram(depthPeelProgram)
  gl.uniform1i(gl.getUniformLocation(depthPeelProgram, 'isDepthPeelingEnabled'), 1)
  gl.uniform1i(gl.getUniformLocation(depthPeelProgram, 'depthPeelTexture'), 0)
  gl.uniform2f(gl.getUniformLocation(depthPeelProgram, 'depthPeelViewportSize'), 1, 1)

  const drawDepthPeel = (frontDepth) => {
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, depthPeelInput)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 1, 1, gl.RGBA, gl.FLOAT, new Float32Array([frontDepth, 0, 0, 1]))
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    const pixel = new Float32Array(4)

    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, pixel)

    return pixel[0]
  }

  assert(drawDepthPeel(0.25) === 1, 'Fragment behind the first depth layer was rejected')
  assert(drawDepthPeel(0.75) === 0, 'Fragment in front of the first depth layer was retained')
  assert(drawDepthPeel(1) === 0, 'Cleared first-layer depth produced a synthetic second layer')
  gl.deleteTexture(depthPeelInput)
  gl.deleteProgram(depthPeelProgram)
  messages.push('PASS depth peeling rejects the visible layer and retains the next surface')

  const compositeProgram = createProgram(
    materialVertexHeader + (await load('composite.vertex.glsl')),
    materialFragmentHeader + (await load('composite.fragment.glsl'))
  )

  gl.deleteProgram(compositeProgram)
  messages.push('PASS depth-of-field composite shader compiles')

  const temporalAntialiasingProgram = createProgram(
    materialVertexHeader + (await load('composite.vertex.glsl')),
    materialFragmentHeader + (await load('temporal-antialiasing.fragment.glsl'))
  )

  gl.deleteProgram(temporalAntialiasingProgram)
  messages.push('PASS temporal antialiasing shader compiles')

  for (const [name, fragmentPath] of [
    ['motion blur tile-max', 'motion-blur-tile.fragment.glsl'],
    ['motion blur neighbor-max', 'motion-blur-neighbor.fragment.glsl'],
    ['motion blur resolve', 'motion-blur.fragment.glsl']
  ]) {
    const motionBlurProgram = createProgram(
      materialVertexHeader + (await load('composite.vertex.glsl')),
      materialFragmentHeader + (await load(fragmentPath))
    )

    gl.deleteProgram(motionBlurProgram)
    messages.push(`PASS ${name} shader compiles`)
  }

  const motionBlurProgram = createProgram(vertex, materialFragmentHeader + (await load('motion-blur.fragment.glsl')))
  const motionBlurInputs = []
  const createMotionBlurInput = (unit, name, width, values) => {
    const input = gl.createTexture()

    motionBlurInputs.push(input)
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, input)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, 1, 0, gl.RGBA, gl.FLOAT, values)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.uniform1i(gl.getUniformLocation(motionBlurProgram, name), unit)

    return input
  }

  gl.useProgram(motionBlurProgram)
  createMotionBlurInput(
    0,
    'currentTexture',
    5,
    new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1])
  )
  createMotionBlurInput(
    1,
    'motionVectorTexture',
    5,
    new Float32Array([0, 0, 1, 0, 0, 0, 1, 0, 0.4, 0, 0.5, 1, 0, 0, 1, 0, 0, 0, 1, 0])
  )
  createMotionBlurInput(2, 'neighborVelocityTexture', 1, new Float32Array([0.4, 0, 0.5, 1]))
  createMotionBlurInput(
    3,
    'depthTexture',
    5,
    new Float32Array([0.5, 0, 0, 1, 0.5, 0, 0, 1, 0.5, 0, 0, 1, 0.5, 0, 0, 1, 0.5, 0, 0, 1])
  )

  const motionBlurOutput = gl.createTexture()

  gl.activeTexture(gl.TEXTURE4)
  gl.bindTexture(gl.TEXTURE_2D, motionBlurOutput)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 5, 1, 0, gl.RGBA, gl.FLOAT, null)

  const motionBlurTarget = gl.createFramebuffer()

  gl.bindFramebuffer(gl.FRAMEBUFFER, motionBlurTarget)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, motionBlurOutput, 0)
  assert(gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE, 'Incomplete motion-blur target')
  gl.drawBuffers([gl.COLOR_ATTACHMENT0])
  gl.viewport(0, 0, 5, 1)
  gl.colorMask(true, true, true, true)
  gl.disable(gl.CULL_FACE)
  gl.disable(gl.BLEND)
  gl.disable(gl.DEPTH_TEST)
  gl.disable(gl.SCISSOR_TEST)
  gl.useProgram(motionBlurProgram)
  gl.uniform2f(gl.getUniformLocation(motionBlurProgram, 'camera.clipPlanes'), 0.1, 100)

  for (const name of [
    'camera.projectionMatrix',
    'camera.reconstructionMatrix',
    'currentViewProjectionMatrix',
    'previousViewProjectionMatrix'
  ]) {
    gl.uniformMatrix4fv(gl.getUniformLocation(motionBlurProgram, name), false, identity)
  }

  gl.uniform1f(gl.getUniformLocation(motionBlurProgram, 'maximumRadius'), 4)
  gl.uniform1i(gl.getUniformLocation(motionBlurProgram, 'maximumSamples'), 8)

  const drawMotionBlur = (shutterAngle) => {
    gl.uniform1f(gl.getUniformLocation(motionBlurProgram, 'shutterAngle'), shutterAngle)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    const pixels = new Float32Array(5 * 4)

    gl.readPixels(0, 0, 5, 1, gl.RGBA, gl.FLOAT, pixels)

    return pixels
  }
  const sharpMotion = drawMotionBlur(0)

  assert(
    sharpMotion[8] > 0.99 && sharpMotion[4] === 0,
    `Closed shutter changed the sharp input: ${Array.from(sharpMotion).join(',')}`
  )

  const blurredMotion = drawMotionBlur(360)

  assert(blurredMotion[8] > 0.5, 'Motion blur erased the moving surface')
  assert(blurredMotion[4] > 0.01 || blurredMotion[12] > 0.01, 'Motion blur did not spread over the silhouette')
  motionBlurInputs.forEach((input) => gl.deleteTexture(input))
  gl.deleteFramebuffer(motionBlurTarget)
  gl.deleteTexture(motionBlurOutput)
  gl.deleteProgram(motionBlurProgram)
  messages.push('PASS motion blur shutter and silhouette dilation')

  const presentProgram = createProgram(
    materialVertexHeader + (await load('composite.vertex.glsl')),
    materialFragmentHeader + (await load('present.fragment.glsl'))
  )

  gl.deleteProgram(presentProgram)
  messages.push('PASS temporal presentation shader compiles')

  const depthOfFieldDilationProgram = createProgram(
    materialVertexHeader + (await load('composite.vertex.glsl')),
    materialFragmentHeader + (await load('depth-of-field-dilate.fragment.glsl'))
  )

  gl.deleteProgram(depthOfFieldDilationProgram)
  messages.push('PASS depth-of-field foreground dilation shader compiles')

  const depthOfFieldPrefilterProgram = createProgram(
    vertex,
    materialFragmentHeader + (await load('depth-of-field-prefilter.fragment.glsl'))
  )

  gl.bindFramebuffer(gl.FRAMEBUFFER, target)
  gl.drawBuffers([gl.COLOR_ATTACHMENT0])
  gl.viewport(0, 0, 1, 1)
  gl.disable(gl.BLEND)
  gl.useProgram(depthOfFieldPrefilterProgram)

  const getDepthOfFieldPrefilterLocation = (name) => gl.getUniformLocation(depthOfFieldPrefilterProgram, name)
  const depthOfFieldPrefilterInputs = []
  const prefilterInputData = [
    new Float32Array([4, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]),
    new Float32Array([0.5, 0.5, 0.5, 1, 0.5, 0.5, 0.5, 1, 0.5, 0.5, 0.5, 1, 0.5, 0.5, 0.5, 1]),
    new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1])
  ]

  for (const [unit, name] of ['sceneTexture', 'depthTexture', 'skyTexture'].entries()) {
    const inputTexture = gl.createTexture()

    depthOfFieldPrefilterInputs.push(inputTexture)
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, inputTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 2, 2, 0, gl.RGBA, gl.FLOAT, prefilterInputData[unit])
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.uniform1i(getDepthOfFieldPrefilterLocation(name), unit)
  }

  const depthOfFieldPrefilterSkyCube = gl.createTexture()

  gl.activeTexture(gl.TEXTURE4)
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, depthOfFieldPrefilterSkyCube)

  for (let face = 0; face < 6; ++face) {
    gl.texImage2D(
      gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
      0,
      gl.RGBA32F,
      1,
      1,
      0,
      gl.RGBA,
      gl.FLOAT,
      new Float32Array([0, 0, 0, 1])
    )
  }

  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.uniform1i(getDepthOfFieldPrefilterLocation('skyCube'), 4)
  gl.uniformMatrix4fv(getDepthOfFieldPrefilterLocation('camera.reconstructionMatrix'), false, identity)
  gl.uniformMatrix4fv(getDepthOfFieldPrefilterLocation('camera.projectionMatrix'), false, identity)
  gl.uniform2f(getDepthOfFieldPrefilterLocation('camera.clipPlanes'), 0.1, 100)
  gl.uniform2f(getDepthOfFieldPrefilterLocation('destinationSize'), 1, 1)
  gl.uniform1i(getDepthOfFieldPrefilterLocation('isCubeSkyEnabled'), 0)
  gl.uniform1i(getDepthOfFieldPrefilterLocation('surfaceOwnershipTexture'), 2)
  gl.drawArrays(gl.TRIANGLES, 0, 3)

  const depthOfFieldPrefilterPixel = new Float32Array(4)

  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, depthOfFieldPrefilterPixel)
  assert(
    Math.abs(depthOfFieldPrefilterPixel[0] - 1) < 1e-6,
    `Depth-of-field prefilter lost HDR highlight energy (${[...depthOfFieldPrefilterPixel]}, GL ${gl.getError()})`
  )
  depthOfFieldPrefilterInputs.forEach((value) => gl.deleteTexture(value))
  gl.deleteTexture(depthOfFieldPrefilterSkyCube)
  gl.deleteProgram(depthOfFieldPrefilterProgram)
  messages.push('PASS depth-of-field HDR prefilter compiles and preserves small highlight energy')

  const depthOfFieldLayersProgram = createProgram(
    vertex,
    materialFragmentHeader + (await load('depth-of-field-layers.fragment.glsl'))
  )

  messages.push('PASS depth-of-field layer shader compiles')

  const depthOfFieldLayerTextures = [gl.createTexture(), gl.createTexture()]
  const depthOfFieldLayerTarget = gl.createFramebuffer()

  gl.bindFramebuffer(gl.FRAMEBUFFER, depthOfFieldLayerTarget)
  depthOfFieldLayerTextures.forEach((layerTexture, index) => {
    gl.bindTexture(gl.TEXTURE_2D, layerTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 1, 1, 0, gl.RGBA, gl.FLOAT, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, layerTexture, 0)
  })
  gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1])
  assert(
    gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE,
    'Depth-of-field multiple-render-target framebuffer is incomplete'
  )
  gl.useProgram(depthOfFieldLayersProgram)

  const getDepthOfFieldLayerLocation = (name) => gl.getUniformLocation(depthOfFieldLayersProgram, name)

  gl.uniform1i(getDepthOfFieldLayerLocation('skyCube'), 9)

  const depthOfFieldInputTextures = []
  const layerInputPixels = [
    [0.25, 0.5, 0.75, 1],
    [0.5, 0.5, 0.5, 1],
    [0, 0, 0, 1],
    [0.75, 0.5, 0.25, 1],
    [1, 1, 1, 1],
    [1 / 255, 0, 0, 1]
  ]

  for (const [unit, name] of [
    'prefilteredSceneTexture',
    'depthTexture',
    'foregroundRadiusTexture',
    'backingSceneTexture',
    'backingDepthTexture',
    'surfaceOwnershipTexture'
  ].entries()) {
    const inputTexture = gl.createTexture()

    depthOfFieldInputTextures.push(inputTexture)
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, inputTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 1, 1, 0, gl.RGBA, gl.FLOAT, new Float32Array(layerInputPixels[unit]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.uniform1i(getDepthOfFieldLayerLocation(name), unit)
  }

  gl.uniformMatrix4fv(getDepthOfFieldLayerLocation('camera.reconstructionMatrix'), false, identity)
  gl.uniformMatrix4fv(getDepthOfFieldLayerLocation('camera.projectionMatrix'), false, identity)
  gl.uniform2f(getDepthOfFieldLayerLocation('camera.clipPlanes'), 0.1, 100)
  gl.uniform1i(getDepthOfFieldLayerLocation('isDepthOfFieldOverridden'), 1)
  gl.uniform1f(getDepthOfFieldLayerLocation('depthOfFieldFocusDistance'), 1)
  gl.uniform1f(getDepthOfFieldLayerLocation('depthOfFieldFocalLength'), 50)
  gl.uniform1f(getDepthOfFieldLayerLocation('depthOfFieldSensorHeight'), 36)
  gl.uniform1f(getDepthOfFieldLayerLocation('depthOfFieldFStop'), 2.8)
  gl.uniform1f(getDepthOfFieldLayerLocation('depthOfFieldMaximumBlurRadius'), 0)
  gl.uniform1i(getDepthOfFieldLayerLocation('depthOfFieldMaximumSamples'), 12)
  gl.drawArrays(gl.TRIANGLES, 0, 3)

  const depthOfFieldLayerPixel = new Float32Array(4)

  gl.readBuffer(gl.COLOR_ATTACHMENT0)
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, depthOfFieldLayerPixel)
  assert(
    Math.abs(depthOfFieldLayerPixel[0] - 0.25) < 1e-6 && depthOfFieldLayerPixel[3] > 0 && depthOfFieldLayerPixel[3] < 1,
    'Focused scene color was not preserved in the depth-of-field background layer'
  )
  gl.readBuffer(gl.COLOR_ATTACHMENT1)
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, depthOfFieldLayerPixel)
  assert(
    depthOfFieldLayerPixel.every((value) => Math.abs(value) < 1e-6),
    'Focused scene unexpectedly contributed to the depth-of-field foreground layer'
  )

  const updateDepthOfFieldInput = (unit, pixel) => {
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, depthOfFieldInputTextures[unit])
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 1, 1, gl.RGBA, gl.FLOAT, new Float32Array(pixel))
  }

  updateDepthOfFieldInput(2, [6, 0, 0, 1])
  updateDepthOfFieldInput(3, [0.75, 0.5, 0.25, 1])
  updateDepthOfFieldInput(4, [0.9, 0.9, 0.9, 1])
  gl.uniform1f(getDepthOfFieldLayerLocation('depthOfFieldFocalLength'), 200)
  gl.uniform1f(getDepthOfFieldLayerLocation('depthOfFieldSensorHeight'), 1)
  gl.uniform1f(getDepthOfFieldLayerLocation('depthOfFieldFStop'), 0.7)
  gl.uniform1f(getDepthOfFieldLayerLocation('depthOfFieldMaximumBlurRadius'), 6)
  gl.uniform1i(getDepthOfFieldLayerLocation('depthOfFieldMaximumSamples'), 16)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  gl.readBuffer(gl.COLOR_ATTACHMENT0)
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, depthOfFieldLayerPixel)
  assert(
    Math.abs(depthOfFieldLayerPixel[0] - 0.75) < 1e-5,
    `Peeled backing geometry was not selected (${depthOfFieldLayerPixel[0]})`
  )
  updateDepthOfFieldInput(4, [1, 1, 1, 1])
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  gl.readBuffer(gl.COLOR_ATTACHMENT0)
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, depthOfFieldLayerPixel)
  assert(Math.abs(depthOfFieldLayerPixel[0] - 0.25) < 1e-5, 'Missing backing geometry fell through to synthetic sky')
  gl.readBuffer(gl.COLOR_ATTACHMENT1)
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, depthOfFieldLayerPixel)
  assert(Math.abs(depthOfFieldLayerPixel[3] - 1) < 1e-5, 'Foreground without backing evidence became transparent')
  messages.push('PASS depth-of-field layers use peeled geometry and never invent an unobserved sky backing')
  depthOfFieldInputTextures.forEach((value) => gl.deleteTexture(value))
  depthOfFieldLayerTextures.forEach((value) => gl.deleteTexture(value))
  gl.deleteFramebuffer(depthOfFieldLayerTarget)
  gl.deleteProgram(depthOfFieldLayersProgram)
  gl.bindFramebuffer(gl.FRAMEBUFFER, target)
  gl.drawBuffers([gl.COLOR_ATTACHMENT0])

  const glassVertex = `#version 300 es
    out vec2 v_coordinates;
    out vec3 v_normal, v_tangent, v_bitangent;
    out vec3 v_objectPosition;
    out vec4 v_cameraPosition, v_worldPosition;
    out float v_clipDistance;
    void main() {
      vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
      gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
      v_coordinates = vec2(0.5); v_normal = vec3(0,0,1);
      v_tangent = vec3(1,0,0); v_bitangent = vec3(0,1,0);
      v_objectPosition = vec3(0.5);
      v_cameraPosition = vec4(0,0,-1,1); v_worldPosition = vec4(0,0,0,1); v_clipDistance = 1.0;
    }`
  const headers = `${definitions}\n${uniforms}\n${reconstruct}\n${depthReconstruction}\n${upsampling}\n${physicallyBasedRendering}\n${materialGraph}\n`
  const ambientVertex = `#version 300 es
    out vec2 v_coordinates;
    out vec3 v_normal, v_tangent, v_bitangent;
    out vec4 v_cameraPosition, v_worldPosition;
    out vec3 v_objectPosition;
    out float v_clipDistance;
    void main() {
      vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
      gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
      v_coordinates = vec2(0.5); v_normal = vec3(0,0,1);
      v_tangent = vec3(1,0,0); v_bitangent = vec3(0,1,0);
      v_objectPosition = vec3(0.5);
      v_cameraPosition = vec4(0,0,-1,1); v_worldPosition = vec4(0,0,0,1); v_clipDistance = 1.0;
    }`
  const ambientProgram = createProgram(
    ambientVertex,
    `${definitions}\n${uniforms}\n${physicallyBasedRendering}\n${materialGraph}\n${await load('ambient.fragment.glsl')}`
  )

  messages.push('PASS full ambient reflection shader compiles with mapped normals and PBR visibility')
  gl.deleteProgram(ambientProgram)

  const glassProgram = createProgram(glassVertex, headers + (await load('transmission.fragment.glsl')))

  gl.useProgram(glassProgram)

  const getGlassLocation = (name) => gl.getUniformLocation(glassProgram, name)
  const glassTextures = []
  const setPixel = (unit, value) => {
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, glassTextures[unit])
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 1, 1, 0, gl.RGBA, gl.FLOAT, new Float32Array(value))
  }
  const samplers = [
    ['transmissionBackgroundTexture'],
    ['depthTexture'],
    ['volumetricTexture'],
    ['skyTexture'],
    [],
    ['transmissionSurfaceTexture'],
    ['reflectanceLookupTexture'],
    ['planarReflectionTexture'],
    ['blurredPlanarReflectionTexture'],
    ['volumetricDepthTexture']
  ]

  for (const [unit, names] of samplers.entries()) {
    glassTextures.push(gl.createTexture())
    setPixel(unit, [1, 1, 1, 1])
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    names.forEach((name) => gl.uniform1i(getGlassLocation(name), unit))
  }

  gl.uniform1i(getGlassLocation('skyCube'), 10)
  gl.uniformMatrix4fv(getGlassLocation('camera.viewMatrix'), false, identity)
  gl.uniformMatrix4fv(getGlassLocation('camera.projectionMatrix'), false, identity)
  gl.uniformMatrix4fv(getGlassLocation('camera.reconstructionMatrix'), false, identity)
  gl.uniform2f(getGlassLocation('camera.clipPlanes'), 0.1, 100)
  gl.uniform1f(getGlassLocation('graphIndexOfRefraction'), 1.5)
  gl.uniform1f(getGlassLocation('graphAlpha'), 1)
  gl.uniform1f(getGlassLocation('graphTransmission'), 1)
  gl.uniform1f(getGlassLocation('graphRoughness'), 0)
  gl.uniform1f(getGlassLocation('environmentSpecularStrength'), 1)
  gl.uniform1f(getGlassLocation('materialTransmissionEdgeFade'), 0)
  gl.uniform3f(getGlassLocation('graphNormal'), 0, 0, 1)
  gl.uniform3f(getGlassLocation('graphBaseColor'), 1, 1, 1)
  setPixel(1, [0.5, 0.5, 0.5, 1])
  setPixel(9, [0.5, 0.5, 0.5, 1])
  setPixel(4, [0.5, 0.5, 1, 1])
  setPixel(5, [1, 1, 1, 1])
  setPixel(6, [1, 0, 0, 1])
  setPixel(7, [10, 10, 10, 1])
  setPixel(8, [10, 10, 10, 1])

  const drawGlass = (background, volume, isEnabled = true) => {
    setPixel(0, [background, background, background, 1])
    setPixel(2, [volume, volume, volume, 1])
    gl.uniform1i(getGlassLocation('isVolumetricLightingEnabled'), isEnabled ? 1 : 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    const pixel = new Float32Array(4)

    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, pixel)

    return pixel[0]
  }
  const plain = drawGlass(0.2, 0.4, false)

  assert(Math.abs(drawGlass(0.2, 0.4) - plain) < 1e-6, 'Clear glass must not duplicate the final volume')
  gl.uniform1i(getGlassLocation('isPlanarReflectionEnabled'), 1)
  gl.uniform1f(getGlassLocation('planarReflectionIntensity'), 1)
  gl.uniform1f(getGlassLocation('planarReflectionMaximumRoughness'), 0.8)
  gl.uniform2f(getGlassLocation('planarReflectionViewportSize'), 1, 1)
  gl.uniform1f(getGlassLocation('environmentSpecularStrength'), 0)
  gl.uniform1f(getGlassLocation('graphRoughness'), 0.5)

  const roughPlanar = drawGlass(0.1, 0, false)

  assert(
    roughPlanar > 0.1 && roughPlanar < 0.2,
    `Rough transmission must not expose the raw HDR planar capture (got ${roughPlanar})`
  )
  gl.uniform1i(getGlassLocation('isPlanarReflectionEnabled'), 0)
  gl.uniform1f(getGlassLocation('environmentSpecularStrength'), 1)
  gl.uniform1f(getGlassLocation('graphRoughness'), 0)
  gl.uniform1f(getGlassLocation('materialTransmissionEdgeFade'), 0.25)
  assert(
    Math.abs(drawGlass(0.2, 0.4, false) - 0.2) < 1e-6,
    'Contact fade must reveal the captured background at a shallow intersection'
  )
  gl.uniform1f(getGlassLocation('materialTransmissionEdgeFade'), 0)

  let residual = 0.2,
    expected = 0.2

  for (let layer = 0; layer < 3; layer++) {
    residual = drawGlass(residual, 0.4)
    expected = 0.96 * expected + 0.04

    assert(Math.abs(residual + 0.4 - (expected + 0.4)) < 1e-6, 'Stacked glass amplified the volume')
  }

  gl.uniform3f(getGlassLocation('graphBaseColor'), 0.5, 0.5, 0.5)
  setPixel(5, [0.5, 0.5, 0.5, 1])

  residual = drawGlass(0.1, 2)

  // The Fresnel branch now samples the reflected environment instead of a
  // base-color approximation, so the 4% normal-incidence reflection is white.
  const tinted = 0.96 * 0.5 * (0.1 + 2) + 0.04 * 1 + 0.04 * 2

  assert(residual < 0 && Math.abs(residual + 2 - tinted) < 1e-5, 'Tinted volume needs signed HDR residuals')
  gl.uniform1f(getGlassLocation('graphTransmission'), 0)
  setPixel(5, [0.25, 0.25, 0.25, 1])
  assert(
    Math.abs(drawGlass(0.1, 2) - 0.25) < 1e-6,
    'Zero transmission must use the PBR-lit surface rather than raw albedo'
  )
  gl.uniform1f(getGlassLocation('graphTransmission'), 1)
  gl.uniform1f(getGlassLocation('materialTransmissionDepth'), 3)
  gl.uniform3f(getGlassLocation('graphBaseColor'), 1, 1, 1)
  setPixel(5, [1, 1, 1, 1])
  gl.uniform3f(getGlassLocation('graphNormal'), -0.6, 0, 0.8)

  // Keep the captured opaque surface behind the glass so edge rejection does
  // not intentionally return to the undistorted screen ray.
  setPixel(1, [0.99, 0.99, 0.99, 1])
  setPixel(4, [0.2, 0.5, 0.9, 1])

  for (const [unit, data] of [
    [0, [0.2, 0.2, 0.2, 1, 0.2, 0.2, 0.2, 1]],
    [2, [0.4, 0.4, 0.4, 1, 1.6, 1.6, 1.6, 1]],
    [9, [0.99, 0.99, 0.99, 1, 0.99, 0.99, 0.99, 1]]
  ]) {
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, glassTextures[unit])
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 2, 1, 0, gl.RGBA, gl.FLOAT, new Float32Array(data))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  }

  const shifted = new Float32Array(4)

  gl.uniform1i(getGlassLocation('isVolumetricLightingEnabled'), 0)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, shifted)

  const unlitGlass = shifted[0]

  gl.uniform1i(getGlassLocation('isVolumetricLightingEnabled'), 1)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, shifted)
  assert(shifted[0] > unlitGlass + 0.1, 'Refraction must sample the brighter volume across the screen')
  messages.push(
    'PASS full transmission shader: PBR-lit surface, disabled volume, contact fade, clear/tinted glass, three layers, signed HDR, zero transmission, refracted UV'
  )

  const resolveProgram = createProgram(vertex, headers + (await load('volumetric-composite.fragment.glsl')))

  gl.useProgram(resolveProgram)

  const resolveLocation = (name) => gl.getUniformLocation(resolveProgram, name)

  gl.uniform1i(resolveLocation('depthTexture'), 1)
  gl.uniform1i(resolveLocation('volumetricTexture'), 2)
  gl.uniform1i(resolveLocation('volumetricDepthTexture'), 9)
  gl.uniform1i(resolveLocation('isVolumetricLightingEnabled'), 1)
  gl.uniform2f(resolveLocation('camera.clipPlanes'), 0.1, 100)
  gl.uniform2f(resolveLocation('destinationSize'), 1, 1)
  setPixel(2, [0.4, 0.4, 0.4, 1])
  setPixel(9, [0.99, 0.99, 0.99, 1])
  gl.clearColor(0.25, 0.25, 0.25, 0.5)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
  gl.colorMask(true, true, true, false)
  gl.drawArrays(gl.TRIANGLES, 0, 3)

  const resolvedColor = new Float32Array(4)

  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, resolvedColor)
  assert(
    Math.abs(resolvedColor[0] - 0.65) < 1e-6 && resolvedColor[3] === 0.5,
    'Reflection resolve must add once and preserve coverage'
  )
  gl.colorMask(true, true, true, true)
  gl.disable(gl.BLEND)
  messages.push('PASS reflection volume resolve preserves scene color and alpha')

  const depthTextures = [gl.createTexture(), gl.createTexture()]
  const depthTargets = [gl.createFramebuffer(), gl.createFramebuffer()]

  for (let index = 0; index < 2; index++) {
    gl.activeTexture(gl.TEXTURE0 + 7 + index)
    gl.bindTexture(gl.TEXTURE_2D, depthTextures[index])
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, 1, 1, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthTargets[index])
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTextures[index], 0)
    gl.drawBuffers([gl.NONE])
    gl.readBuffer(gl.NONE)
    assert(gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE, 'Depth snapshot target incomplete')
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, depthTargets[0])
  gl.depthMask(true)
  gl.clearDepth(0.375)
  gl.clear(gl.DEPTH_BUFFER_BIT)
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, depthTargets[0])
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, depthTargets[1])
  gl.blitFramebuffer(0, 0, 1, 1, 0, 0, 1, 1, gl.DEPTH_BUFFER_BIT, gl.NEAREST)
  gl.bindFramebuffer(gl.FRAMEBUFFER, target)

  const depthProgram = createProgram(
    vertex,
    '#version 300 es\nprecision highp float; uniform sampler2D capturedDepth; out vec4 result; void main() { result = vec4(texture(capturedDepth, vec2(0.5)).rrr, 1.0); }'
  )

  gl.useProgram(depthProgram)
  gl.uniform1i(gl.getUniformLocation(depthProgram, 'capturedDepth'), 8)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, resolvedColor)
  assert(Math.abs(resolvedColor[0] - 0.375) < 1e-6, 'Transmission depth snapshot did not preserve opaque depth')
  messages.push('PASS detached transmission depth snapshot preserves opaque depth without feedback')
  depthTargets.forEach((value) => gl.deleteFramebuffer(value))
  depthTextures.forEach((value) => gl.deleteTexture(value))
  gl.deleteProgram(depthProgram)
  glassTextures.forEach((input) => gl.deleteTexture(input))
  gl.deleteProgram(glassProgram)
  gl.deleteProgram(resolveProgram)
  assert(gl.getError() === gl.NO_ERROR, 'WebGL error after tests')
  gl.deleteProgram(coneProgram)
  gl.deleteFramebuffer(target)
  gl.deleteTexture(texture)

  results.textContent = messages.join('\n') + '\nALL TESTS PASSED'
  results.dataset.status = 'passed'
} catch (error) {
  results.textContent = messages.join('\n') + '\nFAIL ' + error.message
  results.dataset.status = 'failed'

  console.error(error)
}
