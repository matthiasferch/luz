const { it } = require('node:test')
const assert = require('node:assert/strict')
const { inflateSync } = require('node:zlib')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const {
  createHalfwaySamples,
  integrateReflectance,
  createReflectancePixels,
  createWhiteNoise,
  createNoisePixels,
  encodeImage
} = require('../../tooling/textures/generate-textures.cjs')

function integrateHemisphere(normalViewDot, roughness) {
  const sampleCount = 512
  const viewX = Math.sqrt(1 - normalViewDot ** 2)
  const geometryFactor = roughness ** 2 / 2
  const viewGeometry = normalViewDot / (normalViewDot * (1 - geometryFactor) + geometryFactor)

  let scale = 0
  let bias = 0

  for (let elevationIndex = 0; elevationIndex < sampleCount; ++elevationIndex) {
    const lightZ = (elevationIndex + 0.5) / sampleCount
    const lightRadius = Math.sqrt(1 - lightZ ** 2)
    const lightGeometry = lightZ / (lightZ * (1 - geometryFactor) + geometryFactor)

    for (let azimuthIndex = 0; azimuthIndex < sampleCount; ++azimuthIndex) {
      const azimuth = (2 * Math.PI * (azimuthIndex + 0.5)) / sampleCount
      const halfwayX = viewX + lightRadius * Math.cos(azimuth)
      const halfwayY = lightRadius * Math.sin(azimuth)
      const halfwayZ = normalViewDot + lightZ
      const inverseLength = 1 / Math.hypot(halfwayX, halfwayY, halfwayZ)
      const normalHalfwayDot = halfwayZ * inverseLength
      const viewHalfwayDot = (viewX * halfwayX + normalViewDot * halfwayZ) * inverseLength
      const distribution = roughness ** 4 / (Math.PI * (normalHalfwayDot ** 2 * (roughness ** 4 - 1) + 1) ** 2)
      const weight = (distribution * viewGeometry * lightGeometry) / (4 * normalViewDot)
      const fresnelBias = (1 - viewHalfwayDot) ** 5

      scale += weight * (1 - fresnelBias)
      bias += weight * fresnelBias
    }
  }

  const solidAngle = (2 * Math.PI) / sampleCount ** 2

  return [scale * solidAngle, bias * solidAngle]
}

it('integrates the environment BRDF against independent hemisphere quadrature and analytic limits', () => {
  for (const normalViewDot of [0.1, 0.5, 1]) {
    const smoothCoefficients = integrateReflectance(normalViewDot, 0)
    const fresnelBias = (1 - normalViewDot) ** 5

    assert.ok(Math.abs(smoothCoefficients[0] - (1 - fresnelBias)) < 1e-10)
    assert.ok(Math.abs(smoothCoefficients[1] - fresnelBias) < 1e-10)

    for (const roughness of [0.4, 0.7, 1]) {
      const integrated = integrateReflectance(normalViewDot, roughness)
      const reference = integrateHemisphere(normalViewDot, roughness)

      for (let channel = 0; channel < 2; ++channel) {
        assert.ok(
          Math.abs(integrated[channel] - reference[channel]) < 0.002,
          `${normalViewDot}/${roughness}/${channel}: ${integrated[channel]} versus ${reference[channel]}`
        )
      }
    }
  }

  const roughCoefficients = integrateReflectance(1, 1)

  assert.ok(Math.abs(roughCoefficients[0] + roughCoefficients[1] - (1 - Math.log(2))) < 0.0003)
})
it('keeps lookup channels, texel-center axes, and grazing samples finite', () => {
  const size = 16
  const pixels = createReflectancePixels(size)

  for (const [x, y] of [
    [0, 0],
    [15, 0],
    [0, 15],
    [15, 15],
    [7, 8]
  ]) {
    const coefficients = integrateReflectance(
      (x + 0.5) / size,
      (y + 0.5) / size,
      createHalfwaySamples((y + 0.5) / size, 65536)
    )
    const offset = (y * size + x) * 3

    assert.ok(coefficients.every(Number.isFinite))
    assert.ok(Math.abs(pixels[offset] / 255 - coefficients[0]) < 0.008)
    assert.ok(Math.abs(pixels[offset + 1] / 255 - coefficients[1]) < 0.008)
    assert.equal(pixels[offset + 2], 0)
  }

  for (const roughness of [10.5 / 256, 25.5 / 256, 127.5 / 256]) {
    const coefficients = integrateReflectance(0.5 / 256, roughness)
    const reference = integrateReflectance(0.5 / 256, roughness, createHalfwaySamples(roughness, 262144))

    assert.ok(coefficients.every((value, channel) => Math.abs(value - reference[channel]) < 1 / 255))
  }
})

function calculateLowFrequencyEnergy(values, size) {
  let energy = 0

  for (let frequencyY = -3; frequencyY <= 3; ++frequencyY) {
    for (let frequencyX = -3; frequencyX <= 3; ++frequencyX) {
      if (frequencyX === 0 && frequencyY === 0) {
        continue
      }

      let realPart = 0
      let imaginaryPart = 0

      for (let y = 0; y < size; ++y) {
        for (let x = 0; x < size; ++x) {
          const phase = (2 * Math.PI * (x * frequencyX + y * frequencyY)) / size
          const value = values[y * size + x] - 0.5

          realPart += value * Math.cos(phase)
          imaginaryPart += value * Math.sin(phase)
        }
      }

      energy += realPart ** 2 + imaginaryPart ** 2
    }
  }

  return energy
}

it('produces deterministic noise with an exactly uniform histogram and reduced low-frequency energy', () => {
  const size = 64
  const seed = 0x6c757a31
  const pixels = createNoisePixels(size, seed)
  const histogram = new Uint32Array(256)

  for (const value of pixels) {
    ++histogram[value]
  }

  assert.ok(histogram.every((count) => count === (size * size) / 256))
  assert.deepEqual(createNoisePixels(size, seed), pixels)
  assert.notDeepEqual(createNoisePixels(size, seed + 1), pixels)

  const whiteEnergy = calculateLowFrequencyEnergy(createWhiteNoise(size, seed), size)
  const filteredEnergy = calculateLowFrequencyEnergy(
    Float64Array.from(pixels, (value) => value / 255),
    size
  )

  assert.ok(filteredEnergy < whiteEnergy * 0.3, `${filteredEnergy} versus ${whiteEnergy}`)
})

function decodeImage(image) {
  assert.deepEqual(image.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))

  const width = image.readUInt32BE(16)
  const height = image.readUInt32BE(20)
  const channelCount = image[25] === 0 ? 1 : 3
  const chunks = []

  for (let offset = 8; offset < image.length;) {
    const length = image.readUInt32BE(offset)
    const name = image.toString('ascii', offset + 4, offset + 8)

    if (name === 'IDAT') {
      chunks.push(image.subarray(offset + 8, offset + 8 + length))
    }

    assert.ok(['IHDR', 'IDAT', 'IEND'].includes(name), `Unexpected color profile or metadata: ${name}`)

    offset += length + 12
  }

  const rows = inflateSync(Buffer.concat(chunks))
  const stride = width * channelCount
  const pixels = Buffer.alloc(width * height * channelCount)

  assert.equal(rows.length, (stride + 1) * height)

  for (let y = 0; y < height; ++y) {
    assert.equal(rows[y * (stride + 1)], 1)

    for (let x = 0; x < stride; ++x) {
      pixels[y * stride + x] =
        (rows[y * (stride + 1) + 1 + x] + (x >= channelCount ? pixels[y * stride + x - channelCount] : 0)) & 255
    }
  }

  return { width, height, channelCount, pixels }
}

it('encodes untagged linear PNG data without changing channel values or row order', () => {
  for (const channelCount of [1, 3]) {
    const pixels = Buffer.from(Array.from({ length: 2 * 2 * channelCount }, (_, index) => index * 19))
    const decoded = decodeImage(encodeImage(2, 2, channelCount, pixels))

    assert.deepEqual(decoded, { width: 2, height: 2, channelCount, pixels })
  }
})
it('stores generated textures with the expected dimensions and channels', () => {
  const root = path.resolve(__dirname, '../..')

  for (const [filename, size, channelCount] of [
    ['brdfLUT.png', 256, 3],
    ['noise.png', 512, 1]
  ]) {
    const image = readFileSync(path.join(root, 'packages/graphics/rendering/textures', filename))
    const decoded = decodeImage(image)

    assert.equal(decoded.width, size)
    assert.equal(decoded.height, size)
    assert.equal(decoded.channelCount, channelCount)
  }
})
