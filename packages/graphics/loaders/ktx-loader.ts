import type { KTXContainer, KTXLevel } from '@luz/formats'
import { readBinary } from './resource-readers'

export async function loadKTX(url: string, signal?: AbortSignal): Promise<KTXContainer> {
  return decodeKTX(await readBinary(url, signal))
}

export function decodeKTX(buffer: ArrayBuffer): KTXContainer {
  const bytes = new Uint8Array(buffer)

  if (
    bytes[0] !== 0xab ||
    bytes[1] !== 0x4b ||
    bytes[2] !== 0x54 ||
    bytes[3] !== 0x58 ||
    bytes[4] !== 0x20 ||
    bytes[5] !== 0x31 ||
    bytes[6] !== 0x31 ||
    bytes[7] !== 0xbb ||
    bytes[8] !== 0x0d ||
    bytes[9] !== 0x0a ||
    bytes[10] !== 0x1a ||
    bytes[11] !== 0x0a
  ) {
    throw new Error('Invalid KTX identifier')
  }

  const dataView = new DataView(buffer, 12, 13 * 4)
  const endianness = dataView.getUint32(0, true)
  const isLittleEndian = endianness === 0x04030201
  const readUnsigned32 = (index: number) => dataView.getUint32(index * 4, isLittleEndian)

  const glType = readUnsigned32(1)
  const glTypeSize = readUnsigned32(2)
  const glFormat = readUnsigned32(3)
  const glInternalFormat = readUnsigned32(4)
  const glBaseInternalFormat = readUnsigned32(5)
  const pixelWidth = readUnsigned32(6)
  const pixelHeight = readUnsigned32(7)
  const pixelDepth = readUnsigned32(8)
  const numberOfArrayElements = readUnsigned32(9)
  const numberOfFaces = readUnsigned32(10)

  let numberOfMipmapLevels = readUnsigned32(11)

  const bytesOfKeyValueData = readUnsigned32(12)

  if (pixelHeight === 0 || pixelDepth !== 0) {
    throw new Error('Only 2D textures are supported')
  }

  if (numberOfArrayElements !== 0) {
    throw new Error('Texture arrays are not supported')
  }

  if (numberOfFaces !== 1 && numberOfFaces !== 6) {
    throw new Error('KTX: numberOfFaces must be 1 or 6')
  }

  numberOfMipmapLevels = Math.max(1, numberOfMipmapLevels)

  let offset = 12 + 13 * 4 + bytesOfKeyValueData

  const levels: KTXLevel[] = []

  let width = pixelWidth
  let height = pixelHeight

  for (let level = 0; level < numberOfMipmapLevels; level++) {
    if (offset + 4 > bytes.length) {
      throw new Error('KTX truncated (imageSize)')
    }

    const imageSize = new DataView(buffer, offset, 4).getUint32(0, isLittleEndian)

    offset += 4

    const faces: Uint8Array[] = []

    for (let face = 0; face < numberOfFaces; face++) {
      if (offset + imageSize > bytes.length) {
        throw new Error('KTX truncated (image data)')
      }

      const faceData = new Uint8Array(buffer, offset, imageSize)

      faces.push(faceData)

      offset += imageSize

      // Face padding to 4-byte alignment
      offset += 3 - ((imageSize + 3) % 4)
    }

    levels.push({ width, height, faces })

    width = Math.max(1, width >> 1)
    height = Math.max(1, height >> 1)
  }

  return {
    glType,
    glTypeSize,
    glFormat,
    glInternalFormat,
    glBaseInternalFormat,
    pixelWidth,
    pixelHeight,
    pixelDepth,
    numberOfArrayElements,
    numberOfFaces,
    numberOfMipmapLevels,
    bytesOfKeyValueData,
    isLittleEndian,
    levels
  }
}
