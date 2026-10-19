export async function decodeImage(
  blob: Blob,
  signal: AbortSignal = new AbortController().signal
): Promise<HTMLImageElement> {
  signal.throwIfAborted()

  const image = new Image()
  const objectUrl = URL.createObjectURL(blob)

  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const finish = () => {
        signal.removeEventListener('abort', onAbort)

        image.onload = null
        image.onerror = null
      }

      const onAbort = () => {
        finish()

        image.src = ''

        reject(signal.reason)
      }

      signal.addEventListener('abort', onAbort, { once: true })

      image.onload = () => {
        finish()
        resolve(image)
      }
      image.onerror = () => {
        finish()
        reject(new Error('Failed to decode image'))
      }
      image.src = objectUrl
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
