import { readBinary } from './resource-readers'

export interface HDRImageSRGB8 {
  width: number
  height: number
  data: Uint8Array
}

const LINE_FEED_CODE = 0x0a
const CARRIAGE_RETURN_CODE = 0x0d

export async function loadHDRtoSRGB8(url: string, signal?: AbortSignal): Promise<HDRImageSRGB8> {
  return decodeHDRtoSRGB8(await readBinary(url, signal))
}

export function decodeHDRtoSRGB8(buffer: ArrayBuffer): HDRImageSRGB8 {
  const bytes = new Uint8Array(buffer)

  let offset = 0

  const readLine = (): string => {
    let line = ''

    while (offset < bytes.length) {
      const characterCode = bytes[offset++]

      if (characterCode === LINE_FEED_CODE) {
        break
      }

      if (characterCode !== CARRIAGE_RETURN_CODE) {
        line += String.fromCharCode(characterCode)
      }
    }

    return line
  }

  const magic = readLine()

  if (!magic.startsWith('#?RADIANCE') && !magic.startsWith('#?RGBE')) {
    throw new Error('Invalid HDR: missing magic header')
  }

  let format = ''
  let exposure = 1.0

  for (;;) {
    const line = readLine()

    if (!line) {
      break
    }

    if (line.startsWith('FORMAT=')) {
      format = line.substring(7).trim()
    }

    if (line.startsWith('EXPOSURE=')) {
      const parsedExposure = parseFloat(line.substring(9).trim())

      if (isFinite(parsedExposure)) {
        exposure = parsedExposure
      }
    }
  }

  if (format && format !== '32-bit_rle_rgbe') {
    throw new Error(`Unsupported HDR FORMAT: ${format}`)
  }

  const resolutionLine = readLine()
  const resolutionMatch = resolutionLine.match(/([+-])Y\s+(\d+)\s+([+-])X\s+(\d+)/)

  if (!resolutionMatch) {
    throw new Error('Invalid HDR resolution line')
  }

  const height = parseInt(resolutionMatch[2], 10)
  const width = parseInt(resolutionMatch[4], 10)

  const output = new Uint8Array(width * height * 4)

  const channels = [new Uint8Array(width), new Uint8Array(width), new Uint8Array(width), new Uint8Array(width)]

  for (let y = 0; y < height; y++) {
    if (offset + 4 > bytes.length) {
      throw new Error('HDR truncated')
    }

    const firstHeaderByte = bytes[offset++]
    const secondHeaderByte = bytes[offset++]
    const widthHighByte = bytes[offset++]
    const widthLowByte = bytes[offset++]

    if (firstHeaderByte !== 2 || secondHeaderByte !== 2) {
      throw new Error('Unsupported HDR scanline (old RLE not implemented)')
    }

    const scanlineWidth = (widthHighByte << 8) | widthLowByte

    if (scanlineWidth !== width) {
      throw new Error('HDR scanline width mismatch')
    }

    for (let channelIndex = 0; channelIndex < 4; channelIndex++) {
      let x = 0

      while (x < width) {
        if (offset >= bytes.length) {
          throw new Error('HDR truncated in channel data')
        }

        const code = bytes[offset++]

        if (code > 128) {
          const count = code - 128
          const value = bytes[offset++]

          for (let repetition = 0; repetition < count; repetition++) {
            channels[channelIndex][x++] = value
          }
        } else {
          const count = code

          for (let repetition = 0; repetition < count; repetition++) {
            channels[channelIndex][x++] = bytes[offset++]
          }
        }
      }
    }

    for (let x = 0; x < width; x++) {
      const redMantissa = channels[0][x]
      const greenMantissa = channels[1][x]
      const blueMantissa = channels[2][x]
      const exponent = channels[3][x]

      let r = 0,
        g = 0,
        b = 0

      if (exponent !== 0) {
        const multiplier = Math.pow(2.0, exponent - (128 + 8)) * exposure

        r = redMantissa * multiplier
        g = greenMantissa * multiplier
        b = blueMantissa * multiplier
      }

      r = r / (1.0 + r)
      g = g / (1.0 + g)
      b = b / (1.0 + b)

      const encodedRed = Math.pow(Math.min(Math.max(r, 0), 1), 1 / 2.2)
      const encodedGreen = Math.pow(Math.min(Math.max(g, 0), 1), 1 / 2.2)
      const encodedBlue = Math.pow(Math.min(Math.max(b, 0), 1), 1 / 2.2)

      const index = (y * width + x) * 4

      output[index + 0] = (encodedRed * 255) | 0
      output[index + 1] = (encodedGreen * 255) | 0
      output[index + 2] = (encodedBlue * 255) | 0
      output[index + 3] = 255
    }
  }

  return { width, height, data: output }
}
