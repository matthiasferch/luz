const { deflateSync, constants } = require('node:zlib')
const { readFileSync, writeFileSync } = require('node:fs')
const path = require('node:path')

const lookupSize = 256
const lookupSampleCount = 16384
const noiseSize = 512
const noiseSeed = 0x6c757a31

function calculateRadicalInverse(index) {
  let fraction = 0.5
  let result = 0

  while (index > 0) {
    result += (index & 1) * fraction
    index >>>= 1
    fraction *= 0.5
  }

  return result
}

function createHalfwaySamples(roughness, sampleCount) {
  const fourthPowerRoughness = roughness ** 4
  const samples = new Float64Array(sampleCount * 2)

  for (let index = 0; index < sampleCount; ++index) {
    const elevationSample = calculateRadicalInverse(index)
    const normalHalfwayDot = Math.sqrt((1 - elevationSample) / (1 + (fourthPowerRoughness - 1) * elevationSample))

    samples[index * 2] =
      Math.sqrt(Math.max(0, 1 - normalHalfwayDot ** 2)) * Math.cos((2 * Math.PI * index) / sampleCount)
    samples[index * 2 + 1] = normalHalfwayDot
  }

  return samples
}

function integrateReflectance(normalViewDot, roughness, samples = createHalfwaySamples(roughness, lookupSampleCount)) {
  const viewX = Math.sqrt(Math.max(0, 1 - normalViewDot ** 2))

  // The IBL Schlick geometry factor omits the direct-light roughness remapping.
  const geometryFactor = roughness ** 2 / 2
  const viewVisibility = 1 / (normalViewDot * (1 - geometryFactor) + geometryFactor)

  let scale = 0
  let bias = 0

  for (let index = 0; index < samples.length; index += 2) {
    const normalHalfwayDot = samples[index + 1]
    const viewHalfwayDot = viewX * samples[index] + normalViewDot * normalHalfwayDot
    const normalLightDot = 2 * viewHalfwayDot * normalHalfwayDot - normalViewDot

    if (normalLightDot <= 0) {
      continue
    }

    const lightGeometry = normalLightDot / (normalLightDot * (1 - geometryFactor) + geometryFactor)
    const visibility = (viewVisibility * lightGeometry * viewHalfwayDot) / normalHalfwayDot
    const fresnelBias = Math.max(0, 1 - viewHalfwayDot) ** 5

    scale += visibility * (1 - fresnelBias)
    bias += visibility * fresnelBias
  }

  const sampleCount = samples.length / 2

  return [scale / sampleCount, bias / sampleCount]
}

function createReflectancePixels(size = lookupSize, sampleCount = lookupSampleCount) {
  const pixels = Buffer.alloc(size * size * 3)

  for (let y = 0; y < size; ++y) {
    const roughness = (y + 0.5) / size
    const samples = createHalfwaySamples(roughness, sampleCount)

    for (let x = 0; x < size; ++x) {
      const coefficients = integrateReflectance((x + 0.5) / size, roughness, samples)
      const offset = (y * size + x) * 3

      pixels[offset] = Math.round(Math.min(1, Math.max(0, coefficients[0])) * 255)
      pixels[offset + 1] = Math.round(Math.min(1, Math.max(0, coefficients[1])) * 255)
    }
  }

  return pixels
}

function createWhiteNoise(size, seed) {
  const values = new Float64Array(size * size)

  let state = seed >>> 0

  for (let index = 0; index < values.length; ++index) {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    values[index] = (state >>> 0) / 4294967296
  }

  return values
}

function filterNoise(values, size, isHorizontal) {
  const filteredValues = new Float64Array(values.length)
  const weights = [1, 4, 6, 4, 1]

  for (let y = 0; y < size; ++y) {
    for (let x = 0; x < size; ++x) {
      let weightedSum = 0

      for (let offset = -2; offset <= 2; ++offset) {
        const sampleX = (x + (isHorizontal ? offset : 0) + size) % size
        const sampleY = (y + (isHorizontal ? 0 : offset) + size) % size

        weightedSum += values[sampleY * size + sampleX] * weights[offset + 2]
      }

      filteredValues[y * size + x] = weightedSum / 16
    }
  }

  return filteredValues
}

function createNoisePixels(size = noiseSize, seed = noiseSeed) {
  const values = createWhiteNoise(size, seed)
  const blurredValues = filterNoise(filterNoise(values, size, true), size, false)
  const indices = Array.from({ length: values.length }, (_, index) => index)
  const pixels = Buffer.alloc(values.length)

  indices.sort(
    (firstIndex, secondIndex) =>
      values[firstIndex] - blurredValues[firstIndex] - (values[secondIndex] - blurredValues[secondIndex]) ||
      firstIndex - secondIndex
  )

  for (let rank = 0; rank < indices.length; ++rank) {
    pixels[indices[rank]] = Math.floor((rank * 256) / indices.length)
  }

  return pixels
}

function calculateChecksum(bytes) {
  let checksum = 0xffffffff

  for (const byte of bytes) {
    checksum ^= byte

    for (let bit = 0; bit < 8; ++bit) {
      checksum = (checksum >>> 1) ^ (checksum & 1 ? 0xedb88320 : 0)
    }
  }

  return (checksum ^ 0xffffffff) >>> 0
}

function createChunk(name, content) {
  const payload = Buffer.concat([Buffer.from(name, 'ascii'), content])
  const chunk = Buffer.alloc(content.length + 12)

  chunk.writeUInt32BE(content.length)
  payload.copy(chunk, 4)
  chunk.writeUInt32BE(calculateChecksum(payload), chunk.length - 4)

  return chunk
}

function encodeImage(width, height, channelCount, pixels) {
  if (![1, 3].includes(channelCount) || pixels.length !== width * height * channelCount) {
    throw new Error('Invalid texture pixel layout')
  }

  const header = Buffer.alloc(13)
  const stride = width * channelCount
  const rows = Buffer.alloc((stride + 1) * height)

  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)

  header[8] = 8
  header[9] = channelCount === 1 ? 0 : 2

  for (let y = 0; y < height; ++y) {
    rows[y * (stride + 1)] = 1

    for (let offset = 0; offset < stride; ++offset) {
      const precedingValue = offset >= channelCount ? pixels[y * stride + offset - channelCount] : 0

      rows[y * (stride + 1) + offset + 1] = (pixels[y * stride + offset] - precedingValue + 256) & 255
    }
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    createChunk('IHDR', header),
    createChunk('IDAT', deflateSync(rows, { level: 9, strategy: constants.Z_FIXED })),
    createChunk('IEND', Buffer.alloc(0))
  ])
}

function generateTextures(isChecking) {
  const root = path.resolve(__dirname, '../..')
  const images = [
    ['brdfLUT.png', encodeImage(lookupSize, lookupSize, 3, createReflectancePixels())],
    ['noise.png', encodeImage(noiseSize, noiseSize, 1, createNoisePixels())]
  ]

  for (const [name, image] of images) {
    const filename = path.join(root, 'packages/graphics/rendering/textures', name)

    if (isChecking) {
      if (!readFileSync(filename).equals(image)) {
        throw new Error(`Regenerate engine texture: ${name}`)
      }
    } else {
      writeFileSync(filename, image)
    }

    console.log(`${isChecking ? 'Verified' : 'Generated'} ${name} (${image.length} bytes)`)
  }
}

if (require.main === module) {
  const argumentsList = process.argv.slice(2)

  if (argumentsList.length > 1 || (argumentsList.length === 1 && argumentsList[0] !== '--check')) {
    throw new Error('Usage: node tooling/textures/generate-textures.cjs [--check]')
  }

  generateTextures(argumentsList.includes('--check'))
}

module.exports = {
  createHalfwaySamples,
  integrateReflectance,
  createReflectancePixels,
  createWhiteNoise,
  createNoisePixels,
  encodeImage
}
