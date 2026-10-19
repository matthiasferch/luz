import { EntityLoader } from '@luz/graphics'
import type { Scene } from '@luz/scene'

import type { ModelManager } from '@luz/graphics'
import type { LoadingProgressReporter } from '../editor/editor-api'

export async function loadText(path: string, signal?: AbortSignal): Promise<string> {
  const response = await fetch(path, { signal, cache: 'no-cache' })

  if (!response.ok) {
    throw new Error(`Failed to load text '${path}': ${response.status}`)
  }

  return response.text()
}

export async function loadJson(path: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(path, { signal, cache: 'no-cache' })

  if (!response.ok) {
    throw new Error(`Failed to load JSON '${path}': ${response.status}`)
  }

  return response.json()
}

export async function loadJsonInWorker(
  path: string,
  cache: RequestCache = 'default',
  signal?: AbortSignal
): Promise<unknown> {
  signal?.throwIfAborted()

  const absoluteUrl = new URL(path, window.location.href).toString()
  const worker = new Worker(new URL('../workers/json-worker.ts', import.meta.url), { type: 'module' })

  return new Promise<unknown>((resolve, reject) => {
    const finish = () => {
      worker.terminate()
      signal?.removeEventListener('abort', onAbort)
    }

    const onAbort = () => {
      finish()
      reject(signal?.reason)
    }

    signal?.addEventListener('abort', onAbort, { once: true })

    worker.onerror = (error) => {
      finish()
      reject(error)
    }
    worker.onmessage = (event) => {
      finish()

      if (event.data?.ok) {
        resolve(event.data.data)
      } else {
        reject(new Error(event.data?.error || 'Worker failed to load JSON'))
      }
    }

    try {
      worker.postMessage({ url: absoluteUrl, cache })
    } catch (error) {
      finish()
      reject(error)
    }
  })
}

export class SceneLoader {
  private readonly requests = new AbortController()

  constructor(
    private readonly modelCache: ModelManager,
    private readonly reportLoading: LoadingProgressReporter
  ) {}

  async load(path: string): Promise<Scene> {
    const sceneUrl = new URL(path, document.baseURI)
    const data = await loadJsonInWorker(sceneUrl.toString(), 'no-cache', this.requests.signal)

    this.reportLoading({ stage: 'Loading entity assets' })

    const entityLoader = new EntityLoader(this.modelCache.loader, (url) =>
      loadJsonInWorker(url, 'no-cache', this.requests.signal)
    )
    const scene = await entityLoader.loadSceneData(data, sceneUrl.toString())

    await this.modelCache.prepareScene(scene, (completed, total) => {
      if (total > 0) {
        this.reportLoading({ stage: 'Compiling models', completed, total })
      }
    })

    return scene
  }

  destroy(): void {
    this.requests.abort()
  }
}
