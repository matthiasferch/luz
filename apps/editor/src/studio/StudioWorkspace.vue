<script setup lang="ts">
import { computed, markRaw, onMounted, onBeforeUnmount, ref, shallowRef } from 'vue'
import { NConfigProvider, darkTheme } from 'naive-ui'
import { Editor, type SceneSource } from '../runtime/editor-runtime'
import { useEditorStore } from '../editor/editor-store'
import AnimationControls from '../editor/components/AnimationControls.vue'
import RenderSettingsPanel from '../editor/components/RenderSettingsPanel.vue'
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
const draft = shallowRef<Draft>()
const listings = ref<Listing[]>([])
const message = ref('')
const sharedUrl = ref('')
const isConnected = ref(false)
const isRendering = ref(false)
const isPublishing = ref(false)
const isSettingsVisible = ref(false)
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
let isActive = true

if (connection) {
  history.replaceState(null, '', '/')
}

const describeError = (reason: unknown) => (reason instanceof Error ? reason.message : String(reason))

const getUrl = (id: string) => location.origin + '/#/scene/' + id

const formatSize = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + ' MiB'

const refreshRoute = () => location.reload()

async function showScene(source: SceneSource, entry: string, preset?: Preset) {
  const canvas = document.createElement('canvas')

  canvas.id = 'preview-' + crypto.randomUUID()
  canvas.className = 'studio-pending'

  document.body.prepend(canvas)

  let candidate: Editor | undefined

  try {
    candidate = await Editor.create(
      '#' + canvas.id,
      new URL(entry, source.root).href,
      ({ stage }) => {
        if (!hasPreview.value) {
          message.value = stage + '…'
        }
      },
      source
    )

    if (!isActive) {
      throw new Error('Workspace closed')
    }

    if (preset) {
      restoreAnimations(candidate, preset)
    }

    editor?.destroy()
    document.querySelector('#canvas')?.remove()

    canvas.id = 'canvas'
    canvas.className = ''
    editor = candidate

    store.attach(markRaw(candidate))

    hasPreview.value = true
  } catch (error) {
    candidate?.destroy()
    canvas.remove()
    throw error
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

      try {
        const preset = editor && draft.value?.project === snapshot.state.project ? capturePreset(editor) : undefined
        const source = createDraftSource(snapshot.state, snapshot.files, preset?.settings)

        await showScene(source, snapshot.state.entry, preset)

        draft.value = snapshot.state
        blobs = snapshot.files
        message.value = ''
      } catch (error) {
        message.value = describeError(error)
      }
    }
  } finally {
    isRendering.value = false
  }
}

function onBridge(event: MessageEvent) {
  if (!bridge || event.source !== bridge || event.origin !== bridgeOrigin || event.data?.type !== 'luzConnection') {
    return
  }

  port?.close()

  const channel = new MessageChannel()

  port = channel.port1
  port.onmessage = ({ data }) => {
    if (data.type === 'paired') {
      ticket = data.ticket
      isConnected.value = true
      message.value = 'Loading Blender export…'
    } else if (data.type === 'snapshot') {
      pendingSnapshot = data

      void applySnapshots()
    } else {
      message.value = data.message

      if (data.type === 'disconnected') {
        isConnected.value = false
      }
    }
  }

  bridge.postMessage({ ticket }, bridgeOrigin, [channel.port2])
}

function onConnect() {
  if (!bridgeOrigin) {
    message.value = 'In Blender, open Scene Properties → luz Export → Open in luz.'

    return
  }

  bridge?.close()

  bridge = window.open(bridgeOrigin + '/', '_blank', 'popup,width=400,height=180')
  message.value = bridge ? 'Connecting to Blender…' : 'Allow the connection window, then try again.'
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

  timer = window.setInterval(() => {
    if (bridge?.closed && isConnected.value) {
      isConnected.value = false
      message.value = 'Blender disconnected'
    }
  }, 1000)

  try {
    if (isViewer) {
      message.value = 'Loading scene…'

      const scene = await getPublication(location.hash.slice('#/scene/'.length)).catch(() => {
        throw new Error('Scene unavailable')
      })

      await showScene(scene.source, scene.entry, scene.preset)

      message.value = ''
    } else if (isLibrary) {
      listings.value = await getListings()
      isLibraryReady.value = true
    }
  } catch (error) {
    message.value = describeError(error)
  }
})
onBeforeUnmount(() => {
  isActive = false

  window.removeEventListener('hashchange', refreshRoute)
  window.removeEventListener('message', onBridge)
  window.clearInterval(timer)
  port?.close()
  bridge?.close()
  store.dispose()
  editor?.destroy()
})
</script>
<template>
  <NConfigProvider :theme="darkTheme">
    <main class="studio" :class="{ 'studio-empty': !hasPreview }">
      <header v-if="!isViewer">
        <a href="/">luz studio</a><a v-if="!isLibrary" href="/scenes" target="_blank" rel="noopener">My scenes</a>
      </header>
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
      <section v-else-if="!isViewer" class="studio-card" :class="{ 'studio-tools': hasPreview }">
        <h1>{{ title || 'Preview a Blender scene' }}</h1>
        <p v-if="!hasPreview">Choose Open in luz in Blender’s scene export panel, then connect this tab.</p>
        <a v-if="!hasPreview" href="/luz-exporter.zip" download>Download Blender extension</a>
        <button v-if="!isConnected" @click="onConnect">{{ hasPreview ? 'Reconnect' : 'Connect Blender' }}</button>
        <template v-if="hasPreview"
          ><span>{{ formatSize(size) }}</span
          ><button @click="isSettingsVisible = !isSettingsVisible">Render settings</button
          ><button :disabled="isPublishing || isRendering" @click="onPublish">Publish</button></template
        >
        <template v-if="sharedUrl"
          ><a :href="sharedUrl" target="_blank" rel="noopener">View publication</a
          ><button @click="onCopy(sharedUrl)">Copy link</button></template
        >
      </section>
      <aside v-if="isSettingsVisible && !isViewer"><RenderSettingsPanel /></aside>
      <p v-if="message" role="status" class="studio-message">{{ message }}</p>
      <template v-if="hasPreview"
        ><AnimationControls /><button class="studio-fullscreen" @click="onFullscreen">Fullscreen</button></template
      >
    </main>
  </NConfigProvider>
</template>
