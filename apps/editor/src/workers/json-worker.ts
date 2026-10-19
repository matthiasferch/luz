/// <reference lib="webworker" />

export {}

declare const self: DedicatedWorkerGlobalScope

self.onmessage = async (event: MessageEvent<{ url: string; cache?: RequestCache }>) => {
  const { url, cache = 'default' } = event.data

  try {
    const response = await fetch(url, { cache })

    if (!response.ok) {
      throw new Error(`Failed to load JSON '${url}': ${response.status} ${response.statusText}`)
    }

    const content = await response.text()

    try {
      self.postMessage({ ok: true, data: JSON.parse(content) })
    } catch (error) {
      const contentType = response.headers.get('content-type') ?? 'unknown content type'

      throw new Error(
        `Invalid JSON from '${url}' (${contentType}): ${error instanceof Error ? error.message : String(error)}`
      )
    }
  } catch (error) {
    self.postMessage({ ok: false, error: String(error) })
  }
}
