<script setup lang="ts">
import { computed, markRaw, onMounted, onBeforeUnmount, ref, shallowRef } from 'vue'
import { NButton, NCard, NConfigProvider, NModal, darkTheme } from 'naive-ui'
import { Editor, type SceneSource } from '../runtime/editor-runtime'
import { useEditorStore } from '../editor/editor-store'
import App from '../editor/App.vue'
import DialogCloseButton from '../editor/components/DialogCloseButton.vue'
import {
  loadSceneCatalog,
  selectInitialScene,
  readStoredSceneId,
  storeSceneId,
  startActiveSceneMonitor,
  type SceneDescriptor
} from '../editor/scene-catalog'
import { updateSceneThumbnail } from '../editor/scene-thumbnails'
import {
  capturePreset,
  createDraftSource,
  getListings,
  getPublication,
  publishScene,
  requestStudio,
  restoreAnimations,
  type Draft,
  type Listing,
  type Preset
} from './scenes'

const store = useEditorStore()
const connection = /^#connect=(\d{1,5})\.([\w-]{43})$/.exec(location.hash)
const bridgeOrigin = connection && Number(connection[1]) <= 65535 ? 'http://127.0.0.1:' + connection[1] : ''
const isViewer = location.hash.startsWith('#/scene/')
const isLibrary = /^\/scenes\/?$/.test(location.pathname)
const isWorkspace = !isViewer && !isLibrary
const extensionUrl = __EDITOR_STUDIO__ ? '/luz-exporter.zip' : 'https://studio.luzjs.dev/luz-exporter.zip'
const installationKey = 'luz.blender.installed'
const hasInstalledExtension = ref(false)
const isInstallPromptDismissed = ref(false)
const dialog = ref<'connect' | 'publish' | null>(isWorkspace && bridgeOrigin ? 'connect' : null)
const isFullscreen = ref(Boolean(document.fullscreenElement))
const draft = shallowRef<Draft>()
const listings = ref<Listing[]>([])
const message = ref('')
const sharedUrl = ref('')
const connectionState = ref<'idle' | 'connecting' | 'connected'>('idle')
const isRendering = ref(false)
const isPublishing = ref(false)
const hasPreview = ref(false)
const isLibraryReady = ref(false)
const title = computed(
  () =>
    draft.value?.entry
      .split('/')
      .pop()
      ?.replace(/\.scene\.json$/, '') ?? ''
)
const size = computed(() => draft.value?.files.reduce((total, file) => total + file.size, 0) ?? 0)

let ticket = connection?.[2]
let editor: Editor | undefined
let blobs = new Map<string, Blob>()
let bridge: Window | null = null
let port: MessagePort | undefined
let pendingSnapshot: { state: Draft; files: Map<string, Blob> } | undefined
let timer: number
let pairingTimeout: number | undefined
let isActive = true
let sceneGeneration = 0
let stopSceneMonitor: (() => void) | undefined
let catalogScene: SceneDescriptor | undefined

function rememberInstallation() {
  hasInstalledExtension.value = true

  try {
    localStorage.setItem(installationKey, 'true')
  } catch {
    return
  }
}

function onFullscreenChange() {
  isFullscreen.value = Boolean(document.fullscreenElement)
}

function onDialogVisibility(isVisible: boolean) {
  if (!isVisible) {
    dialog.value = null
  }
}

function onStorage(event: StorageEvent) {
  if (event.key === installationKey || event.key === null) {
    hasInstalledExtension.value = event.newValue === 'true'
  }
}

if (connection) {
  history.replaceState(null, '', '/')
}

const describeError = (reason: unknown) => (reason instanceof Error ? reason.message : String(reason))

const getUrl = (id: string) => location.origin + '/#/scene/' + id

const formatSize = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + ' MiB'

const refreshRoute = () => location.reload()

async function showScene(generation: number, entry: string, source?: SceneSource, preset?: Preset) {
  if (!isActive || generation !== sceneGeneration) {
    return
  }

  const canvas = document.createElement('canvas')

  canvas.id = 'preview-' + generation
  canvas.className = 'studio-pending'

  document.body.prepend(canvas)

  let candidate: Editor | undefined

  try {
    candidate = await Editor.create(
      '#' + canvas.id,
      source ? new URL(entry, source.root).href : entry,
      (progress) => {
        if (isActive && generation === sceneGeneration) {
          store.setLoadingProgress(progress)

          if (source && !hasPreview.value) {
            message.value = progress.stage + '…'
          }
        }
      },
      source
    )

    if (!isActive || generation !== sceneGeneration) {
      candidate.destroy()
      canvas.remove()

      return
    }

    if (preset) {
      restoreAnimations(candidate, preset)
    }

    stopSceneMonitor?.()
    editor?.destroy()
    document.querySelector('#canvas')?.remove()

    canvas.id = 'canvas'
    canvas.className = ''
    editor = candidate
    catalogScene = undefined
    draft.value = undefined
    blobs = new Map()

    store.attach(markRaw(candidate))

    hasPreview.value = true

    return candidate
  } catch (error) {
    candidate?.destroy()
    canvas.remove()

    if (isActive && generation === sceneGeneration) {
      throw error
    }
  }
}

function configureCatalog(sceneId: string | null) {
  store.configureScenes(store.scenes.value, sceneId, loadSceneCatalog, (id) => {
    const scene = store.scenes.value.find((entry) => entry.id === id)

    if (scene) {
      void openCatalogScene(scene)
    }
  })
}

async function openCatalogScene(scene: SceneDescriptor) {
  const generation = ++sceneGeneration

  store.startLoading(scene.label)

  try {
    if (editor && catalogScene) {
      await updateSceneThumbnail(editor, catalogScene, true).catch(() => undefined)
    }

    const runtime = await showScene(generation, scene.url)

    if (!runtime) {
      return
    }

    catalogScene = scene
    sharedUrl.value = ''

    if (!dialog.value) {
      message.value = ''
    }

    configureCatalog(scene.id)
    storeSceneId(scene.id)
    void updateSceneThumbnail(runtime, scene).catch(() => undefined)

    if (__EDITOR_DEVELOPMENT__) {
      stopSceneMonitor = startActiveSceneMonitor(
        scene.url,
        async () => {
          store.setSceneExportProgress(null)
          store.setSceneReloading(true)

          try {
            await runtime.reloadScene()

            if (editor === runtime && store.status.value === 'ready') {
              store.attach(markRaw(runtime))

              await updateSceneThumbnail(runtime, scene, true)
            }
          } finally {
            store.setSceneReloading(false)
          }
        },
        1000,
        store.setSceneExportProgress
      )
    }
  } catch (error) {
    if (isActive && generation === sceneGeneration) {
      store.fail(error)
    }
  }
}

async function openPublication(id: string) {
  const generation = ++sceneGeneration

  message.value = isViewer ? 'Loading scene…' : ''

  store.startLoading('Fetching published scene')

  try {
    const scene = await getPublication(id)

    if (await showScene(generation, scene.entry, scene.source, scene.preset)) {
      if (isWorkspace) {
        configureCatalog(id)
      }

      sharedUrl.value = ''
      message.value = ''
    }
  } catch (error) {
    if (isActive && generation === sceneGeneration) {
      store.fail(error)

      if (isViewer) {
        message.value = describeError(error)
      }
    }
  }
}

async function applySnapshots() {
  if (isRendering.value) {
    return
  }

  isRendering.value = true

  try {
    while (pendingSnapshot && isActive) {
      const snapshot = pendingSnapshot

      pendingSnapshot = undefined

      let generation: number | undefined

      try {
        const preset = editor && draft.value?.project === snapshot.state.project ? capturePreset(editor) : undefined
        const source = createDraftSource(snapshot.state, snapshot.files, preset?.settings)

        generation = ++sceneGeneration

        if (!(await showScene(generation, snapshot.state.entry, source, preset))) {
          continue
        }

        draft.value = snapshot.state
        blobs = snapshot.files
        message.value = ''

        configureCatalog(null)

        if (dialog.value === 'connect') {
          dialog.value = null
        }
      } catch (error) {
        if (isActive && (generation === undefined || generation === sceneGeneration)) {
          if (generation !== undefined && store.status.value === 'loading') {
            store.fail(error)
          } else {
            message.value = describeError(error)
          }
        }
      }
    }
  } finally {
    isRendering.value = false
  }
}

function onBridge(event: MessageEvent) {
  if (
    connectionState.value !== 'connecting' ||
    !bridge ||
    event.source !== bridge ||
    event.origin !== bridgeOrigin ||
    event.data?.type !== 'luzConnection'
  ) {
    return
  }

  port?.close()

  const channel = new MessageChannel()

  port = channel.port1
  port.onmessage = ({ data }) => {
    if (data.type === 'paired') {
      window.clearTimeout(pairingTimeout)
      rememberInstallation()

      ticket = data.ticket
      connectionState.value = 'connected'
      message.value = 'Loading Blender export…'
    } else if (data.type === 'snapshot') {
      pendingSnapshot = data

      void applySnapshots()
    } else {
      message.value = data.message

      if (data.type === 'disconnected') {
        window.clearTimeout(pairingTimeout)

        connectionState.value = 'idle'
      }
    }
  }

  bridge.postMessage({ ticket }, bridgeOrigin, [channel.port2])
}

function onConnect() {
  if (!bridgeOrigin || connectionState.value !== 'idle') {
    return
  }

  port?.close()
  bridge?.close()

  bridge = window.open(bridgeOrigin + '/', '_blank', 'popup,width=400,height=180')

  if (!bridge) {
    message.value = 'Your browser blocked the connection window. Allow the pop-up for this site and try again.'

    return
  }

  connectionState.value = 'connecting'
  message.value = 'Connecting to Blender…'
  pairingTimeout = window.setTimeout(() => {
    port?.close()
    bridge?.close()

    connectionState.value = 'idle'
    message.value = 'Blender did not respond. Choose Open in luz in Blender to start a new connection.'
  }, 15000)
}

async function onPublish() {
  if (!editor || !draft.value || isPublishing.value) {
    return
  }

  isPublishing.value = true

  try {
    const result = await publishScene(draft.value, blobs, capturePreset(editor), (count) => {
      message.value = 'Uploading ' + formatSize(count)
    })

    sharedUrl.value = getUrl(result.id)
    message.value = 'Published'
  } catch (error) {
    message.value = describeError(error)
  } finally {
    isPublishing.value = false
  }
}

async function onCopy(url: string) {
  try {
    await navigator.clipboard.writeText(url)

    message.value = 'Link copied'
  } catch {
    message.value = url
  }
}

async function onUnpublish(scene: Listing) {
  try {
    await requestStudio('/scenes/api/projects/' + scene.project, {
      method: 'DELETE',
      headers: { 'If-Match': String(scene.version) }
    })

    listings.value = await getListings()
    message.value = 'Scene unpublished'
  } catch (error) {
    message.value = describeError(error)
  }
}

async function onFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await document.documentElement.requestFullscreen()
    }
  } catch (error) {
    message.value = describeError(error)
  }
}
onMounted(async () => {
  window.addEventListener('hashchange', refreshRoute)
  window.addEventListener('message', onBridge)
  window.addEventListener('storage', onStorage)
  document.addEventListener('fullscreenchange', onFullscreenChange)

  try {
    hasInstalledExtension.value = localStorage.getItem(installationKey) === 'true'
  } catch {
    hasInstalledExtension.value = false
  }

  timer = window.setInterval(() => {
    if (bridge?.closed && connectionState.value !== 'idle') {
      window.clearTimeout(pairingTimeout)

      connectionState.value = 'idle'
      message.value = 'The Blender connection window was closed.'
    }
  }, 1000)

  try {
    if (isViewer) {
      await openPublication(location.hash.slice('#/scene/'.length))
    } else if (isLibrary) {
      listings.value = await getListings()
      isLibraryReady.value = true
    } else {
      store.scenes.value = await loadSceneCatalog()

      configureCatalog(null)

      const scene = selectInitialScene(store.scenes.value, readStoredSceneId())

      if (scene) {
        await openCatalogScene(scene)
      } else {
        store.fail('No valid .scene.json files were found in assets/scenes.')
      }
    }
  } catch (error) {
    message.value = describeError(error)
  }
})
onBeforeUnmount(() => {
  isActive = false

  window.removeEventListener('hashchange', refreshRoute)
  window.removeEventListener('message', onBridge)
  window.removeEventListener('storage', onStorage)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  stopSceneMonitor?.()
  window.clearInterval(timer)
  window.clearTimeout(pairingTimeout)
  port?.close()
  bridge?.close()
  store.dispose()
  editor?.destroy()
})
</script>
<template>
  <NConfigProvider :theme="darkTheme">
    <App
      v-if="isWorkspace || (isViewer && hasPreview)"
      :is-viewer="isViewer"
      :can-publish="Boolean(draft)"
      :is-fullscreen="isFullscreen"
      :connection-label="
        bridgeOrigin && connectionState === 'idle' ? (draft ? 'Reconnect Blender' : 'Connect Blender') : undefined
      "
      @publish="dialog = 'publish'"
      @connect="dialog = 'connect'"
      @open-publication="openPublication"
      @toggle-fullscreen="onFullscreen"
    />
    <div class="studio">
      <header v-if="isLibrary"><a href="/">luz studio</a></header>
      <section v-if="isLibrary" class="studio-card">
        <h1>My scenes</h1>
        <p v-if="isLibraryReady && !listings.length">Your published scenes will appear here.</p>
        <article v-for="scene in listings" :key="scene.id">
          <strong>{{ scene.title }}</strong
          ><template v-if="scene.isPublished"
            ><a :href="getUrl(scene.id)">View</a><button @click="onCopy(getUrl(scene.id))">Copy link</button
            ><button @click="onUnpublish(scene)">Unpublish</button></template
          ><span v-else>Unpublished</span>
        </article>
      </section>
      <aside
        v-if="isWorkspace && !bridgeOrigin && !hasInstalledExtension && !isInstallPromptDismissed"
        class="extension-panel"
        aria-labelledby="extension-heading"
        data-editor-interactive
      >
        <div class="extension-heading">
          <h2 id="extension-heading">Open your own Blender scene</h2>
          <DialogCloseButton label="Dismiss installation prompt" @click="isInstallPromptDismissed = true" />
        </div>
        <p>
          Download the extension, then choose <strong>Install from Disk</strong> in Blender's Get Extensions
          preferences.
        </p>
        <div class="studio-actions">
          <a :href="extensionUrl" download>Download extension</a>
          <button @click="rememberInstallation">Already installed</button>
        </div>
      </aside>
      <p v-if="message && !dialog" role="status" class="studio-message" data-editor-interactive>
        {{ message }}
        <button v-if="isWorkspace && bridgeOrigin && connectionState === 'idle'" @click="dialog = 'connect'">
          Reconnect
        </button>
      </p>
    </div>
    <NModal :show="Boolean(dialog)" @update:show="onDialogVisibility">
      <NCard
        class="studio-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-dialog-title"
        data-editor-interactive
      >
        <template #header
          ><span id="studio-dialog-title">{{
            dialog === 'connect' ? 'Connect your Blender scene' : 'Publish scene'
          }}</span></template
        >
        <template #header-extra><DialogCloseButton label="Close dialog" @click="dialog = null" /></template>
        <template v-if="dialog === 'connect'">
          <p>
            Allow this studio tab to preview the scene you opened in Blender? Keep the connection window open to see
            subsequent exports.
          </p>
          <div class="studio-actions">
            <NButton v-if="connectionState === 'idle'" type="primary" @click="onConnect">Connect Blender</NButton>
            <NButton @click="dialog = null">{{ connectionState === 'idle' ? 'Cancel' : 'Close' }}</NButton>
          </div>
        </template>
        <template v-else-if="dialog === 'publish'">
          <template v-if="draft">
            <p>
              <strong>{{ title }}</strong> &middot; {{ formatSize(size) }}
            </p>
            <p>Publish this preview with its current camera, render settings, and animation.</p>
            <div class="studio-actions">
              <NButton :disabled="isPublishing || isRendering" @click="onPublish">Publish</NButton>
              <template v-if="sharedUrl">
                <a :href="sharedUrl" target="_blank" rel="noopener">View publication</a>
                <NButton @click="onCopy(sharedUrl)">Copy link</NButton>
              </template>
            </div>
          </template>
          <p v-else>
            In Blender, choose <strong>Scene Properties &rarr; luz Export &rarr; Open in luz</strong> and connect your
            scene to publish it.
          </p>
        </template>
        <p v-if="message" role="status">{{ message }}</p>
      </NCard>
    </NModal>
  </NConfigProvider>
</template>
