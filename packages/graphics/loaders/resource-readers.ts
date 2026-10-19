export async function readBinary(url: string, signal?: AbortSignal): Promise<ArrayBuffer> {
  const response = await fetch(url, { signal, cache: 'no-cache' })

  if (!response.ok) {
    throw new Error(`Failed to load resource '${url}': ${response.status}`)
  }

  return response.arrayBuffer()
}

export async function readJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal, cache: 'no-cache' })

  if (!response.ok) {
    throw new Error(`Failed to load JSON '${url}': ${response.status}`)
  }

  return response.json()
}
