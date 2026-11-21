<script setup lang="ts">
import { NButton, NCheckbox, NDivider } from 'naive-ui'
import type { PanelId, PanelLayout } from '../panel-layout'

defineProps<{ panels: PanelLayout; isMobile?: boolean; isViewer?: boolean; isFullscreen?: boolean }>()

const emit = defineEmits<{
  togglePanel: [id: PanelId, isVisible: boolean]
  resetLayout: []
  resetCamera: []
  toggleFullscreen: []
}>()
const panelMenuItems: Array<{ id: PanelId; label: string }> = [
  { id: 'entities', label: 'Entities' },
  { id: 'animations', label: 'Animations' },
  { id: 'environment', label: 'Environment' },
  { id: 'simulation', label: 'Simulation' },
  { id: 'settings', label: 'Settings' },
  { id: 'debug', label: 'Debug' },
  { id: 'diagnostics', label: 'Diagnostics' }
]
</script>

<template>
  <div class="view-menu" :class="isMobile ? 'sheet-menu' : 'toolbar-menu'" data-editor-interactive>
    <template v-if="!isViewer">
      <h3 v-if="isMobile">Panels</h3>
      <NCheckbox
        v-for="item in panelMenuItems"
        :key="item.id"
        :size="isMobile ? 'medium' : 'small'"
        :checked="panels[item.id].isVisible"
        @update:checked="emit('togglePanel', item.id, $event)"
        >{{ item.label }}</NCheckbox
      >
      <NDivider />
      <NButton class="reset-layout" text @click.stop="emit('resetLayout')">Reset layout</NButton>
      <NButton class="view-command" text @click="emit('resetCamera')">Reset camera</NButton>
      <NDivider />
    </template>
    <NButton class="view-command" text :aria-pressed="isFullscreen" @click="emit('toggleFullscreen')">
      {{ isMobile ? (isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen') : 'Toggle fullscreen' }}
    </NButton>
  </div>
</template>

<style scoped>
h3 {
  margin: 0;
  padding: 4px;
  color: rgb(255 255 255 / 65%);
  font-size: 14px;
}

.reset-layout,
.view-command {
  justify-content: flex-start;
  width: 100%;
}
</style>
