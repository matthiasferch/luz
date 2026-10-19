import { createApp } from 'vue'
import '../styles.css'
import { Editor } from './editor'
import App from './editor/App.vue'
import { createEditorStore, editorStoreKey } from './editor/editor-store'
import {
  activateSceneAfterThumbnail,
  loadSceneCatalog,
  readSceneFingerprint,
  readStoredSceneId,
  selectInitialScene,
  startActiveSceneMonitor,
  storeSceneId,
  type SceneDescriptor
} from './editor/scene-catalog'
import { loadSceneThumbnail, SCENE_THUMBNAIL_UPDATED_EVENT, storeSceneThumbnail } from './editor/scene-thumbnails'

const store = createEditorStore()

createApp(App).provide(editorStoreKey, store).mount('#editor')

let stopSceneMonitor: (() => void) | undefined
let activeRuntime: Editor | undefined
let activeScene: SceneDescriptor | undefined
let isSceneSwitchInProgress = false

const SCENE_THUMBNAIL_WIDTH = 320
const SCENE_THUMBNAIL_HEIGHT = 240

const updateSceneThumbnail = async (editor: Editor, scene: SceneDescriptor, isCaptureForced = false): Promise<void> => {
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

const reloadWithScene = (sceneId: string) => {
  if (isSceneSwitchInProgress) {
    return
  }

  isSceneSwitchInProgress = true

  void activateSceneAfterThumbnail(
    sceneId,
    () => (activeRuntime && activeScene ? updateSceneThumbnail(activeRuntime, activeScene, true) : Promise.resolve()),
    (id) => {
      storeSceneId(id)
      window.location.reload()
    }
  ).catch((error) => {
    console.warn(`Unable to update the thumbnail for '${activeScene?.id ?? 'the current scene'}'`, error)
  })
}

const initialize = async () => {
  try {
    store.setLoadingProgress({ stage: 'Discovering scenes' })

    const catalog = await loadSceneCatalog()
    const selectedScene = selectInitialScene(catalog, readStoredSceneId())

    store.configureScenes(catalog, selectedScene?.id ?? null, loadSceneCatalog, reloadWithScene)

    if (!selectedScene) {
      throw new Error('No valid .scene.json files were found in assets/scenes.')
    }

    storeSceneId(selectedScene.id)

    const runtime = await Editor.create('#canvas', selectedScene.url, store.setLoadingProgress)

    activeRuntime = runtime
    activeScene = selectedScene

    store.attach(runtime)
    void updateSceneThumbnail(runtime, selectedScene).catch((error) => {
      console.warn(`Unable to capture a thumbnail for '${selectedScene.id}'`, error)
    })

    if (__EDITOR_DEVELOPMENT__) {
      stopSceneMonitor = startActiveSceneMonitor(
        selectedScene.url,
        async () => {
          store.setSceneExportProgress(null)
          store.setSceneReloading(true)

          try {
            await runtime.reloadScene()
            store.attach(runtime)

            await updateSceneThumbnail(runtime, selectedScene, true)
          } catch (error) {
            console.error(`Unable to reload '${selectedScene.id}' in place`, error)
            throw error
          } finally {
            store.setSceneReloading(false)
          }
        },
        1000,
        store.setSceneExportProgress
      )
    }
  } catch (error) {
    console.error('Failed to initialize editor', error)
    store.fail(error)
  }
}

window.addEventListener('pagehide', () => stopSceneMonitor?.(), { once: true })
void initialize()
