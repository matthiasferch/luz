<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  darkTheme,
  NAlert,
  NButton,
  NCard,
  NCheckbox,
  NConfigProvider,
  NDivider,
  NEmpty,
  NGlobalStyle,
  NModal,
  NPopover,
  NSpin,
  NTag,
  type GlobalThemeOverrides
} from 'naive-ui'
import DebugPanel from './components/DebugPanel.vue'
import DiagnosticsPanel from './components/DiagnosticsPanel.vue'
import DiagnosticsFrameRate from './components/DiagnosticsFrameRate.vue'
import DialogCloseButton from './components/DialogCloseButton.vue'
import FloatingPanel from './components/FloatingPanel.vue'
import RenderSettingsPanel from './components/RenderSettingsPanel.vue'
import EntitiesPanel from './components/EntitiesPanel.vue'
import AnimationPanel from './components/AnimationPanel.vue'
import EnvironmentPanel from './components/EnvironmentPanel.vue'
import SimulationPanel from './components/SimulationPanel.vue'
import SimulationControls from './components/SimulationControls.vue'
import { createPanelLayout, type PanelId } from './panel-layout'
import { useEditorStore } from './editor-store'
import { loadSceneThumbnails, SCENE_THUMBNAIL_UPDATED_EVENT } from './scene-thumbnails'

const store = useEditorStore()
const layout = createPanelLayout()
const viewMenuVisible = ref(false)
const sceneMenuVisible = ref(false)
const sceneDialogVisible = ref(false)
const sceneCatalogRefreshing = ref(false)
const selectedSceneId = ref<string | null>(null)
const sceneThumbnailUrls = ref<Record<string, string>>({})
const entitiesPanel = ref<InstanceType<typeof FloatingPanel> | null>(null)
const environmentPanel = ref<InstanceType<typeof FloatingPanel> | null>(null)
const simulationPanel = ref<InstanceType<typeof FloatingPanel> | null>(null)
const version = __EDITOR_VERSION__
const PRIMARY_COLOR = '#B8B8B8'
const PANEL_STACK_GAP = 16
const PANEL_BOTTOM_MARGIN = 8

const mixColor = (color: string, target: number, amount: number) => {
  const channels = color
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16))
  const mixed = channels.map((channel) => Math.round(channel + (target - channel) * amount))

  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

const panelMenuItems: Array<{ id: PanelId; label: string }> = [
  { id: 'entities', label: 'Entities' },
  { id: 'animations', label: 'Animations' },
  { id: 'environment', label: 'Environment' },
  { id: 'simulation', label: 'Simulation' },
  { id: 'settings', label: 'Settings' },
  { id: 'debug', label: 'Debug' },
  { id: 'diagnostics', label: 'Diagnostics' }
]

const themeOverrides: GlobalThemeOverrides = {
  common: {
    fontFamily: '"Outfit", sans-serif',
    primaryColor: PRIMARY_COLOR,
    primaryColorHover: mixColor(PRIMARY_COLOR, 255, 0.18),
    primaryColorPressed: mixColor(PRIMARY_COLOR, 0, 0.14),
    primaryColorSuppl: mixColor(PRIMARY_COLOR, 255, 0.3),
    borderRadius: '7px'
  },
  Collapse: {
    titleFontSize: '12px',
    titleFontWeight: '600',
    dividerColor: 'rgba(255, 255, 255, 0.07)'
  },
  Slider: {
    handleSize: '14px'
  }
}

const resize = () => layout.clampAll()

const togglePanel = (id: PanelId, isVisible: boolean) => layout.setVisible(id, isVisible)

const onResetCamera = () => {
  viewMenuVisible.value = false

  store.resetCamera()
}

const revokeThumbnailUrls = () => {
  Object.values(sceneThumbnailUrls.value).forEach((url) => URL.revokeObjectURL(url))

  sceneThumbnailUrls.value = {}
}

const refreshSceneThumbnails = async () => {
  try {
    const thumbnails = await loadSceneThumbnails(store.scenes.value.map(({ id }) => id))

    revokeThumbnailUrls()

    sceneThumbnailUrls.value = Object.fromEntries(
      thumbnails.map(({ sceneId, image }) => [sceneId, URL.createObjectURL(image)])
    )
  } catch (error) {
    console.warn('Unable to load cached scene thumbnails', error)
  }
}

const openSceneDialog = async () => {
  sceneMenuVisible.value = false
  sceneDialogVisible.value = true
  selectedSceneId.value = store.activeSceneId.value ?? store.scenes.value.find(({ isValid }) => isValid)?.id ?? null
  sceneCatalogRefreshing.value = true

  try {
    await store.refreshScenes()

    await refreshSceneThumbnails()

    const hasSelectedScene = store.scenes.value.some(({ id, isValid }) => id === selectedSceneId.value && isValid)

    if (!hasSelectedScene) {
      selectedSceneId.value = store.activeSceneId.value ?? store.scenes.value.find(({ isValid }) => isValid)?.id ?? null
    }
  } finally {
    sceneCatalogRefreshing.value = false
  }
}
const selectedScene = computed(() => store.scenes.value.find(({ id }) => id === selectedSceneId.value))
const confirmScene = () => {
  if (!selectedScene.value?.isValid || !store.activateScene(selectedScene.value.id)) {
    return
  }

  sceneDialogVisible.value = false
}

const selectScene = (sceneId: string) => {
  selectedSceneId.value = sceneId

  confirmScene()
}

const formatFileSize = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

const formatCount = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`

const renderedPanelHeight = (panel: InstanceType<typeof FloatingPanel> | null, fallback: number) => {
  const height = (panel?.$el as HTMLElement | undefined)?.offsetHeight ?? 0

  return height > 0 ? height : fallback
}

const resetLayout = async () => {
  layout.reset()

  viewMenuVisible.value = false

  await nextTick()

  const entities = layout.panels.entities
  const environment = layout.panels.environment
  const simulation = layout.panels.simulation

  let entitiesHeight = renderedPanelHeight(entitiesPanel.value, entities.height)

  const environmentHeight = renderedPanelHeight(environmentPanel.value, environment.height)
  const simulationHeight = renderedPanelHeight(simulationPanel.value, simulation.height)
  const availableEntitiesHeight =
    window.innerHeight - entities.y - PANEL_STACK_GAP * 2 - environmentHeight - simulationHeight - PANEL_BOTTOM_MARGIN

  if (entitiesHeight > availableEntitiesHeight) {
    layout.resize('entities', entities.width, availableEntitiesHeight, true)

    entitiesHeight = layout.panels.entities.height

    await nextTick()
  }

  layout.move('environment', entities.x, entities.y + entitiesHeight + PANEL_STACK_GAP, environmentHeight)
  layout.move(
    'simulation',
    entities.x,
    layout.panels.environment.y + environmentHeight + PANEL_STACK_GAP,
    simulationHeight
  )
}

const hidePanel = (id: PanelId) => layout.setVisible(id, false)

const onThumbnailUpdated = () => {
  if (sceneDialogVisible.value) {
    void refreshSceneThumbnails()
  }
}

onMounted(() => {
  window.addEventListener('resize', resize)
  window.addEventListener(SCENE_THUMBNAIL_UPDATED_EVENT, onThumbnailUpdated)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  window.removeEventListener(SCENE_THUMBNAIL_UPDATED_EVENT, onThumbnailUpdated)
  revokeThumbnailUrls()
  store.dispose()
})
</script>

<template>
  <NConfigProvider :theme="darkTheme" :theme-overrides="themeOverrides">
    <NGlobalStyle />
    <main class="editor-shell" aria-label="luz">
      <div v-if="store.status.value === 'ready'" class="editor-toolbar" data-editor-interactive>
        <span class="brand"
          >luz <small>{{ version }}</small></span
        >
        <NPopover v-model:show="sceneMenuVisible" trigger="click" placement="bottom-start" :show-arrow="false" raw>
          <template #trigger>
            <NButton class="toolbar-item" size="small" quaternary>Scene</NButton>
          </template>
          <div class="toolbar-menu scene-menu" data-editor-interactive>
            <NButton text @click="openSceneDialog">Load scene…</NButton>
          </div>
        </NPopover>
        <NPopover v-model:show="viewMenuVisible" trigger="click" placement="bottom-start" :show-arrow="false" raw>
          <template #trigger>
            <NButton class="toolbar-item" size="small" quaternary>View</NButton>
          </template>
          <div class="toolbar-menu view-menu" data-editor-interactive>
            <NCheckbox
              v-for="item in panelMenuItems"
              :key="item.id"
              size="small"
              :checked="layout.panels[item.id].isVisible"
              @update:checked="togglePanel(item.id, $event)"
              >{{ item.label }}</NCheckbox
            >
            <NDivider />
            <NButton class="reset-layout" text @click.stop="resetLayout">Reset layout</NButton>
            <NButton class="view-command" text @click="onResetCamera">Reset camera</NButton>
          </div>
        </NPopover>
      </div>

      <Transition name="reload">
        <div
          v-if="store.sceneActivityDetail.value"
          class="scene-reload-status"
          role="status"
          aria-live="polite"
          data-editor-interactive
        >
          <NSpin :size="14" />
          <span>{{ store.sceneActivityDetail.value }}</span>
        </div>
      </Transition>

      <div v-if="store.status.value === 'loading'" class="status-card" data-editor-interactive>
        <NSpin class="loading-spinner" :size="16" />
        <span class="status-copy">
          <strong>Loading scene</strong>
          <small>{{ store.loadingDetail.value }}</small>
        </span>
      </div>

      <NAlert
        v-else-if="store.status.value === 'error'"
        class="error-card"
        title="Scene initialization failed"
        type="error"
        data-editor-interactive
      >
        <div class="error-content">
          <span>{{ store.error.value }}</span>
          <NButton size="small" @click="openSceneDialog">Choose scene</NButton>
        </div>
      </NAlert>

      <template v-else>
        <SimulationControls v-if="!layout.panels.simulation.isVisible" />

        <Transition name="dialog" appear>
          <FloatingPanel
            ref="entitiesPanel"
            v-if="layout.panels.entities.isVisible"
            id="entities"
            title="Entities"
            :panel="layout.panels.entities"
            @move="layout.move"
            @resize="layout.resize"
            @fit="layout.fitContent"
            @focus="layout.bringToFront"
            @collapse="layout.toggleCollapsed"
            @close="hidePanel"
            ><EntitiesPanel
          /></FloatingPanel>
        </Transition>

        <Transition name="dialog" appear>
          <FloatingPanel
            v-if="layout.panels.animations.isVisible"
            id="animations"
            title="Animations"
            :panel="layout.panels.animations"
            @move="layout.move"
            @resize="layout.resize"
            @fit="layout.fitContent"
            @focus="layout.bringToFront"
            @collapse="layout.toggleCollapsed"
            @close="hidePanel"
            ><AnimationPanel
          /></FloatingPanel>
        </Transition>

        <Transition name="dialog" appear>
          <FloatingPanel
            ref="environmentPanel"
            v-if="layout.panels.environment.isVisible"
            id="environment"
            title="Environment"
            :panel="layout.panels.environment"
            @move="layout.move"
            @resize="layout.resize"
            @fit="layout.fitContent"
            @focus="layout.bringToFront"
            @collapse="layout.toggleCollapsed"
            @close="hidePanel"
            ><EnvironmentPanel
          /></FloatingPanel>
        </Transition>

        <Transition name="dialog" appear>
          <FloatingPanel
            ref="simulationPanel"
            v-if="layout.panels.simulation.isVisible"
            id="simulation"
            title="Simulation"
            :panel="layout.panels.simulation"
            @move="layout.move"
            @resize="layout.resize"
            @fit="layout.fitContent"
            @focus="layout.bringToFront"
            @collapse="layout.toggleCollapsed"
            @close="hidePanel"
            ><SimulationPanel
          /></FloatingPanel>
        </Transition>

        <Transition name="dialog" appear>
          <FloatingPanel
            v-if="layout.panels.settings.isVisible"
            id="settings"
            title="Settings"
            :panel="layout.panels.settings"
            @move="layout.move"
            @resize="layout.resize"
            @fit="layout.fitContent"
            @focus="layout.bringToFront"
            @collapse="layout.toggleCollapsed"
            @close="hidePanel"
            ><RenderSettingsPanel
          /></FloatingPanel>
        </Transition>

        <Transition name="dialog" appear>
          <FloatingPanel
            v-if="layout.panels.debug.isVisible"
            id="debug"
            title="Debug"
            :panel="layout.panels.debug"
            @move="layout.move"
            @resize="layout.resize"
            @fit="layout.fitContent"
            @focus="layout.bringToFront"
            @collapse="layout.toggleCollapsed"
            @close="hidePanel"
            ><DebugPanel
          /></FloatingPanel>
        </Transition>

        <Transition name="dialog" appear>
          <FloatingPanel
            v-if="layout.panels.diagnostics.isVisible"
            id="diagnostics"
            title="Diagnostics"
            :panel="layout.panels.diagnostics"
            @move="layout.move"
            @resize="layout.resize"
            @fit="layout.fitContent"
            @focus="layout.bringToFront"
            @collapse="layout.toggleCollapsed"
            @close="hidePanel"
          >
            <template #fixed><DiagnosticsFrameRate /></template>
            <DiagnosticsPanel />
          </FloatingPanel>
        </Transition>
      </template>

      <NAlert
        v-if="store.error.value && store.status.value === 'ready'"
        class="operation-error"
        type="error"
        closable
        data-editor-interactive
      >
        {{ store.error.value }}
      </NAlert>

      <NModal v-model:show="sceneDialogVisible" :mask-closable="false">
        <NCard class="scene-browser" title="Load scene" role="dialog" aria-modal="true" data-editor-interactive>
          <template #header-extra>
            <DialogCloseButton label="Close Load scene" @click="sceneDialogVisible = false" />
          </template>
          <NSpin :show="sceneCatalogRefreshing">
            <div v-if="store.scenes.value.length" class="scene-list" role="listbox" aria-label="Available scenes">
              <button
                v-for="scene in store.scenes.value"
                :key="scene.id"
                class="scene-row"
                :class="{ selected: selectedSceneId === scene.id, invalid: !scene.isValid }"
                :disabled="!scene.isValid"
                :aria-selected="selectedSceneId === scene.id"
                role="option"
                type="button"
                @click="selectScene(scene.id)"
              >
                <span class="scene-preview" aria-hidden="true">
                  <img v-if="sceneThumbnailUrls[scene.id]" :src="sceneThumbnailUrls[scene.id]" alt="" />
                  <span v-else class="scene-preview-placeholder">{{ scene.isValid ? 'No preview' : 'Invalid' }}</span>
                </span>
                <span class="scene-details">
                  <span class="scene-row-heading">
                    <strong>{{ scene.label }}</strong>
                    <NTag v-if="store.activeSceneId.value === scene.id" size="small" :bordered="false">Current</NTag>
                  </span>
                  <span class="scene-path">{{ scene.id }}</span>
                  <span v-if="scene.isValid" class="scene-metadata">
                    {{ formatFileSize(scene.byteLength) }} · {{ formatCount(scene.entities, 'entity', 'entities') }} ·
                    {{ formatCount(scene.models, 'model') }} · {{ formatCount(scene.lights, 'light') }}
                  </span>
                  <span v-else class="scene-error">Invalid JSON: {{ scene.error }}</span>
                </span>
              </button>
            </div>
            <NEmpty v-else description="No scene files found" />
          </NSpin>
        </NCard>
      </NModal>
    </main>
  </NConfigProvider>
</template>

<style scoped>
.editor-shell {
  position: fixed;
  inset: 0;
  z-index: 20;
  pointer-events: none;
}

.editor-toolbar {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  pointer-events: auto;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 9px;
  background: rgb(18 20 25 / 90%);
  box-shadow: 0 10px 32px rgb(0 0 0 / 28%);
  backdrop-filter: blur(16px);
}

.brand {
  margin: 0 9px 0 7px;
  color: #fff;
  font-size: 17px;
  font-weight: 300;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.brand small {
  margin-left: 3px;
  color: rgb(255 255 255 / 48%);
  font-size: 9px;
  font-weight: 500;
}

.toolbar-item {
  min-width: 58px;
}

.toolbar-menu {
  display: grid;
  min-width: 166px;
  max-height: calc(100dvh - 64px);
  gap: 9px;
  overflow-y: auto;
  padding: 10px 12px;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 9px;
  background: rgb(18 20 25 / 90%);
  box-shadow: 0 10px 32px rgb(0 0 0 / 28%);
  backdrop-filter: blur(16px);
}

:global(.n-popover-shared.popover-transition-enter-from),
:global(.n-popover-shared.popover-transition-leave-to),
:global(.n-popover-shared.popover-transition-enter-to),
:global(.n-popover-shared.popover-transition-leave-from) {
  transform: none !important;
}

:global(.n-popover-shared.popover-transition-enter-active),
:global(.n-popover-shared.popover-transition-leave-active) {
  transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.scene-menu :deep(.n-button) {
  justify-content: flex-start;
  width: 100%;
}

.toolbar-menu :deep(.n-button__content) {
  font-size: var(--luz-checkbox-label-size);
}

.view-menu :deep(.n-divider) {
  margin: 2px 0;
}

.view-menu :deep(.n-checkbox) {
  font-size: var(--luz-checkbox-label-size);
}

.reset-layout,
.view-command {
  justify-content: flex-start;
  width: 100%;
}

.scene-reload-status {
  position: fixed;
  top: 10px;
  left: 50%;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 11px;
  color: rgb(255 255 255 / 86%);
  font-size: 12px;
  font-weight: 500;
  pointer-events: none;
  background: rgb(18 20 25 / 94%);
  border: 1px solid rgb(255 255 255 / 11%);
  border-radius: 8px;
  box-shadow: 0 8px 28px rgb(0 0 0 / 30%);
  transform: translateX(-50%);
  backdrop-filter: blur(14px);
}

.reload-enter-active,
.reload-leave-active {
  transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.reload-enter-from,
.reload-leave-to {
  opacity: 0;
}

.dialog-enter-active,
.dialog-leave-active {
  transition:
    opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top left;
  will-change: opacity, transform;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.status-card {
  position: fixed;
  top: 50%;
  left: 50%;
  display: grid;
  grid-template-columns: 16px auto;
  grid-template-rows: auto auto;
  align-items: center;
  gap: 2px 12px;
  padding: 14px 18px;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  color: rgb(255 255 255 / 80%);
  border-radius: 9px;
  background: rgb(18 20 25 / 90%);
}

.loading-spinner {
  grid-column: 1;
  grid-row: 1;
}

.status-copy {
  display: contents;
}

.status-copy strong {
  grid-column: 2;
  grid-row: 1;
  color: rgb(255 255 255 / 90%);
  font-size: 12px;
  font-weight: 500;
}

.status-copy small {
  grid-column: 2;
  grid-row: 2;
  color: rgb(255 255 255 / 50%);
  font-size: 10px;
}

.error-card {
  position: fixed;
  top: 72px;
  left: 50%;
  width: min(520px, calc(100vw - 32px));
  transform: translateX(-50%);
  pointer-events: auto;
}

.error-content {
  display: grid;
  justify-items: start;
  gap: 12px;
}

.operation-error {
  position: fixed;
  right: 16px;
  bottom: 16px;
  width: min(420px, calc(100vw - 32px));
  pointer-events: auto;
}

.scene-browser {
  width: min(640px, calc(100vw - 32px));
  max-height: min(720px, calc(100vh - 32px));
  background: rgb(18 20 25 / 98%);
}

.scene-list {
  display: grid;
  gap: 6px;
  max-height: min(520px, calc(100vh - 210px));
  overflow: auto;
  padding-right: 3px;
}

.scene-row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  align-items: center;
  gap: 13px;
  width: 100%;
  padding: 9px;
  text-align: left;
  color: rgb(255 255 255 / 75%);
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: 7px;
  background: rgb(255 255 255 / 2.5%);
  cursor: pointer;
  font: inherit;
}

.scene-row:hover:not(:disabled) {
  border-color: rgb(255 255 255 / 18%);
  background: rgb(255 255 255 / 5.5%);
}

.scene-row.selected {
  border-color: rgb(255 255 255 / 42%);
  background: rgb(255 255 255 / 8.5%);
}

.scene-row.invalid {
  cursor: not-allowed;
  opacity: 0.58;
}

.scene-preview {
  display: grid;
  width: 120px;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  place-items: center;
  border-radius: 5px;
  background: rgb(0 0 0 / 28%);
}

.scene-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scene-preview-placeholder {
  color: rgb(255 255 255 / 35%);
  font-size: 10px;
  letter-spacing: 0.02em;
}

.scene-details {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.scene-row-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: rgb(255 255 255 / 92%);
}

.scene-row-heading strong {
  font-size: 13px;
  font-weight: 600;
}

.scene-path {
  color: rgb(255 255 255 / 46%);
  font-size: 10px;
}

.scene-metadata {
  margin-top: 3px;
  color: rgb(255 255 255 / 62%);
  font-size: 11px;
}

.scene-error {
  margin-top: 3px;
  overflow: hidden;
  color: #f3a3a3;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (width <= 560px) {
  .scene-row {
    grid-template-columns: 88px minmax(0, 1fr);
  }

  .scene-preview {
    width: 88px;
  }
}
</style>
