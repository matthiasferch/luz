export interface SceneDescriptor {
  id: string
  label: string
  url: string
  byteLength: number
  isValid: boolean
  entities: number
  models: number
  lights: number
  cameras: number
  hasEnvironment: boolean
  error?: string
}

export interface ExportProgress {
  status: 'exporting'
  scene: string
  stage: string
  completed?: number
  total?: number
}

export const SCENE_SELECTION_STORAGE_KEY = 'luz.scene.current'

const DEFAULT_SCENE_ID = 'sala-character.scene.json'

const isSceneDescriptor = (value: unknown): value is SceneDescriptor => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const scene = value as Partial<SceneDescriptor>

  return (
    typeof scene.id === 'string' &&
    typeof scene.label === 'string' &&
    typeof scene.url === 'string' &&
    typeof scene.byteLength === 'number' &&
    typeof scene.isValid === 'boolean' &&
    typeof scene.entities === 'number' &&
    typeof scene.models === 'number' &&
    typeof scene.lights === 'number' &&
    typeof scene.cameras === 'number' &&
    typeof scene.hasEnvironment === 'boolean'
  )
}

export const normalizeSceneCatalog = (value: unknown): SceneDescriptor[] => {
  if (!Array.isArray(value)) {
    throw new Error('Scene catalog must be an array')
  }

  return value
    .filter(isSceneDescriptor)
    .sort(
      (firstScene, secondScene) =>
        firstScene.label.localeCompare(secondScene.label) || firstScene.id.localeCompare(secondScene.id)
    )
}

export const loadSceneCatalog = async (fetchResource: typeof fetch = fetch): Promise<SceneDescriptor[]> => {
  if (__EDITOR_DEVELOPMENT__) {
    try {
      const response = await fetchResource('/__luz/scenes', { cache: 'no-store' })

      if (!response.ok) {
        throw new Error(`Scene catalog request failed: ${response.status}`)
      }

      return normalizeSceneCatalog(await response.json())
    } catch (error) {
      console.warn('Failed to refresh the development scene catalog; using the embedded catalog.', error)
    }
  }

  return normalizeSceneCatalog(__EDITOR_SCENES__)
}

export const selectInitialScene = (
  scenes: SceneDescriptor[],
  storedId?: string | null
): SceneDescriptor | undefined => {
  const validScenes = scenes
    .filter(({ isValid }) => isValid)
    .sort(
      (firstScene, secondScene) =>
        firstScene.label.localeCompare(secondScene.label) || firstScene.id.localeCompare(secondScene.id)
    )

  return (
    validScenes.find(({ id }) => id === storedId) ??
    validScenes.find(({ id }) => id === DEFAULT_SCENE_ID) ??
    validScenes.find(({ id }) => id === 'editor.scene.json') ??
    validScenes[0]
  )
}

export const readStoredSceneId = (storage: Pick<Storage, 'getItem'> = localStorage): string | null => {
  try {
    return storage.getItem(SCENE_SELECTION_STORAGE_KEY)
  } catch {
    return null
  }
}

export const storeSceneId = (id: string, storage: Pick<Storage, 'setItem'> = localStorage): void => {
  try {
    storage.setItem(SCENE_SELECTION_STORAGE_KEY, id)
  } catch {
    // Scene selection still works when browser storage is unavailable.
  }
}

export const activateSceneAfterThumbnail = async (
  sceneId: string,
  updateCurrentThumbnail: () => Promise<void>,
  activate: (id: string) => void
): Promise<void> => {
  try {
    await updateCurrentThumbnail()
  } finally {
    activate(sceneId)
  }
}

const calculateContentHash = (content: string): string => {
  let hash = 2166136261

  for (let index = 0; index < content.length; index++) {
    hash ^= content.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(16)
}

export const readSceneFingerprint = async (url: string, fetchResource: typeof fetch = fetch): Promise<string> => {
  const response = await fetchResource(url, { method: 'HEAD', cache: 'no-store' })

  if (response.status === 404 || response.status === 410) {
    return `missing:${response.status}`
  }

  if (!response.ok) {
    throw new Error(`Scene fingerprint request failed: ${response.status}`)
  }

  const etag = response.headers.get('etag')
  const lastModified = response.headers.get('last-modified')
  const contentLength = response.headers.get('content-length')

  if (etag || lastModified) {
    return [etag, lastModified, contentLength].filter(Boolean).join('|')
  }

  const contentResponse = await fetchResource(url, { cache: 'no-store' })

  if (contentResponse.status === 404 || contentResponse.status === 410) {
    return `missing:${contentResponse.status}`
  }

  if (!contentResponse.ok) {
    throw new Error(`Scene fingerprint request failed: ${contentResponse.status}`)
  }

  return `content:${calculateContentHash(await contentResponse.text())}`
}

export const createSceneExportUrl = (sceneUrl: string): string => {
  const exportUrl = sceneUrl.replace(/\.scene\.json(?=([?#]|$))/i, '.export.json')

  if (exportUrl === sceneUrl) {
    throw new Error(`Scene URL '${sceneUrl}' must end in .scene.json`)
  }

  return exportUrl
}

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0

export const readSceneExportProgress = async (
  sceneUrl: string,
  fetchResource: typeof fetch = fetch
): Promise<ExportProgress | null> => {
  const response = await fetchResource(createSceneExportUrl(sceneUrl), { cache: 'no-store' })

  if (response.status === 204 || response.status === 404 || response.status === 410) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Scene export status request failed: ${response.status}`)
  }

  const value = (await response.json()) as Partial<ExportProgress>

  if (value.status !== 'exporting' || typeof value.scene !== 'string' || typeof value.stage !== 'string') {
    throw new Error('Scene export status is invalid')
  }

  const hasCompleted = value.completed !== undefined
  const hasTotal = value.total !== undefined

  if (
    hasCompleted !== hasTotal ||
    (hasCompleted &&
      (!isNonNegativeInteger(value.completed) || !isNonNegativeInteger(value.total) || value.completed > value.total))
  ) {
    throw new Error('Scene export progress is invalid')
  }

  return value as ExportProgress
}

export const createActiveScenePoller = (
  sceneUrl: string,
  onChange: () => void | Promise<void>,
  fetchResource: typeof fetch = fetch,
  onExportProgress: (progress: ExportProgress | null) => void = () => {}
) => {
  let previousFingerprint: string | undefined
  let previousExportProgress: string | undefined
  let isPolling = false

  return async (): Promise<void> => {
    if (isPolling) {
      return
    }

    isPolling = true

    try {
      try {
        const exportProgress = await readSceneExportProgress(sceneUrl, fetchResource)
        const serializedProgress = JSON.stringify(exportProgress)

        if (serializedProgress !== previousExportProgress) {
          previousExportProgress = serializedProgress

          onExportProgress(exportProgress)
        }
      } catch {
        // A transient or partially deployed status endpoint must not stop scene monitoring.
      }

      const fingerprint = await readSceneFingerprint(sceneUrl, fetchResource)

      if (previousFingerprint === undefined) {
        previousFingerprint = fingerprint
      } else if (fingerprint !== previousFingerprint) {
        await onChange()

        previousFingerprint = fingerprint
      }
    } catch {
      // Transient development-server and reload failures are retried on the next poll.
    } finally {
      isPolling = false
    }
  }
}

export const startActiveSceneMonitor = (
  sceneUrl: string,
  onChange: () => void | Promise<void>,
  intervalMilliseconds = 1000,
  onExportProgress: (progress: ExportProgress | null) => void = () => {}
): (() => void) => {
  const poll = createActiveScenePoller(sceneUrl, onChange, fetch, onExportProgress)

  void poll()

  const timer = window.setInterval(() => void poll(), intervalMilliseconds)

  return () => window.clearInterval(timer)
}
