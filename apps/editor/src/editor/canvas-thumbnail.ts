import type { Rectangle } from '@luz/core'

export const calculateThumbnailCrop = (
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): Rectangle => {
  if (sourceWidth <= 0 || sourceHeight <= 0 || targetWidth <= 0 || targetHeight <= 0) {
    throw new Error('Thumbnail dimensions must be positive')
  }

  const sourceAspect = sourceWidth / sourceHeight
  const targetAspect = targetWidth / targetHeight

  if (sourceAspect > targetAspect) {
    const width = sourceHeight * targetAspect

    return { x: (sourceWidth - width) / 2, y: 0, width, height: sourceHeight }
  }

  const height = sourceWidth / targetAspect

  return { x: 0, y: (sourceHeight - height) / 2, width: sourceWidth, height }
}

const encodeCanvas = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Unable to encode the scene thumbnail'))),
      'image/webp',
      0.82
    )
  })

export const captureCanvasThumbnail = async (
  source: HTMLCanvasElement,
  width = 320,
  height = 240,
  createBitmap: typeof createImageBitmap | null = globalThis.createImageBitmap?.bind(globalThis) ?? null
): Promise<Blob> => {
  const crop = calculateThumbnailCrop(source.width, source.height, width, height)
  const thumbnail = document.createElement('canvas')

  thumbnail.width = width
  thumbnail.height = height

  const context = thumbnail.getContext('2d')

  if (!context) {
    return Promise.reject(new Error('Unable to create the thumbnail canvas context'))
  }

  if (!createBitmap) {
    throw new Error('Asynchronous canvas snapshots are unavailable')
  }

  // Drawing a WebGL canvas into a 2D canvas forces a synchronous GPU readback.
  // Capture it asynchronously first so a complex frame cannot block the main loop.
  const bitmap = await createBitmap(source, crop.x, crop.y, crop.width, crop.height, {
    resizeWidth: width,
    resizeHeight: height,
    resizeQuality: 'high'
  })

  try {
    context.drawImage(bitmap, 0, 0)
  } finally {
    bitmap.close()
  }

  return encodeCanvas(thumbnail)
}
