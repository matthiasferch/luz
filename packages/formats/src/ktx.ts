export interface KTXLevel {
  width: number
  height: number
  faces: Uint8Array[]
}

export interface KTXContainer {
  glType: number
  glTypeSize: number
  glFormat: number
  glInternalFormat: number
  glBaseInternalFormat: number
  pixelWidth: number
  pixelHeight: number
  pixelDepth: number
  numberOfArrayElements: number
  numberOfFaces: number
  numberOfMipmapLevels: number
  bytesOfKeyValueData: number
  isLittleEndian: boolean
  levels: KTXLevel[]
}
