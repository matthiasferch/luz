import type { Editor } from '../editor'
import { readSceneFingerprint, type SceneDescriptor } from './scene-catalog'

export interface SceneThumbnail {
  sceneId: string
  fingerprint: string
  capturedAt: number
  width: number
  height: number
  image: Blob
}

const DATABASE_NAME = 'luz.scene.thumbnails'
const STORE_NAME = 'thumbnails'

export const SCENE_THUMBNAIL_UPDATED_EVENT = 'luz-scene-thumbnail-updated'

const requestResult = <Result>(request: IDBRequest<Result>): Promise<Result> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })

const openDatabase = (factory: IDBFactory): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = factory.open(DATABASE_NAME, 1)

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'sceneId' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Unable to open the scene thumbnail database'))
  })

const resolveDatabaseFactory = (): IDBFactory | undefined => {
  try {
    return globalThis.indexedDB
  } catch {
    return undefined
  }
}

export const loadSceneThumbnail = async (sceneId: string): Promise<SceneThumbnail | undefined> => {
  const factory = resolveDatabaseFactory()

  if (!factory) {
    return undefined
  }

  const database = await openDatabase(factory)

  try {
    const transaction = database.transaction(STORE_NAME, 'readonly')

    return (await requestResult(transaction.objectStore(STORE_NAME).get(sceneId))) as SceneThumbnail | undefined
  } finally {
    database.close()
  }
}

export const loadSceneThumbnails = async (sceneIds: string[]): Promise<SceneThumbnail[]> => {
  const factory = resolveDatabaseFactory()

  if (!factory || sceneIds.length === 0) {
    return []
  }

  const database = await openDatabase(factory)

  try {
    const store = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME)
    const thumbnails = await Promise.all(sceneIds.map((sceneId) => requestResult(store.get(sceneId))))

    return thumbnails.filter((thumbnail): thumbnail is SceneThumbnail => Boolean(thumbnail))
  } finally {
    database.close()
  }
}

export const storeSceneThumbnail = async (thumbnail: SceneThumbnail): Promise<void> => {
  const factory = resolveDatabaseFactory()

  if (!factory) {
    return
  }

  const database = await openDatabase(factory)

  try {
    await requestResult(database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(thumbnail))
  } finally {
    database.close()
  }
}

const SCENE_THUMBNAIL_WIDTH = 320
const SCENE_THUMBNAIL_HEIGHT = 240

export const updateSceneThumbnail = async (
  editor: Editor,
  scene: SceneDescriptor,
  isCaptureForced = false
): Promise<void> => {
  let fingerprint = `catalog:${scene.byteLength}`

  try {
    fingerprint = await readSceneFingerprint(scene.url)
  } catch {
    // A missing development fingerprint should not prevent thumbnail capture.
  }

  if (!isCaptureForced) {
    const cachedThumbnail = await loadSceneThumbnail(scene.id)

    if (
      cachedThumbnail?.fingerprint === fingerprint &&
      cachedThumbnail.width === SCENE_THUMBNAIL_WIDTH &&
      cachedThumbnail.height === SCENE_THUMBNAIL_HEIGHT
    ) {
      return
    }
  }

  const image = await editor.captureThumbnail(SCENE_THUMBNAIL_WIDTH, SCENE_THUMBNAIL_HEIGHT)

  await storeSceneThumbnail({
    sceneId: scene.id,
    fingerprint,
    capturedAt: Date.now(),
    width: SCENE_THUMBNAIL_WIDTH,
    height: SCENE_THUMBNAIL_HEIGHT,
    image
  })
  window.dispatchEvent(new CustomEvent(SCENE_THUMBNAIL_UPDATED_EVENT, { detail: scene.id }))
}
