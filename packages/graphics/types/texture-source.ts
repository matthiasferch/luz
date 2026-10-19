export type PixelData = Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Float32Array
export type TextureSource = PixelData | TexImageSource

export function getImageDimensions(source: TexImageSource): [width: number, height: number] {
  if ('videoWidth' in source) {
    return [source.videoWidth, source.videoHeight]
  }

  if ('displayWidth' in source) {
    return [source.displayWidth, source.displayHeight]
  }

  return [source.width, source.height]
}
