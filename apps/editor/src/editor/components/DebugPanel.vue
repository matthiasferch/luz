<script setup lang="ts">
import { NDivider, NSelect } from 'naive-ui'
import { computed } from 'vue'
import { debugOverlayCheckboxes, debugVisualizations } from '../control-catalog'
import type { DebugVisualization } from '../editor-api'
import { useEditorStore } from '../editor-store'
import SettingSlider from './SettingSlider.vue'
import { OVERLAY_STYLES } from '../../rendering/overlay-style'
import type { OverlayDepthMode } from '../../settings'
import SettingCheckbox from './SettingCheckbox.vue'

const store = useEditorStore()
const areGeometryOverlaysVisible = computed(() => store.settings.value!.rendering.debug.areGeometryOverlaysVisible)
</script>

<template>
  <SettingCheckbox
    label="Enable overlay"
    :is-checked="areGeometryOverlaysVisible"
    @change="store.setRendering('debug', 'areGeometryOverlaysVisible', $event)"
  />
  <label class="select-row">
    <span>Overlay depth</span>
    <NSelect
      :value="store.settings.value!.rendering.debug.overlayDepthMode"
      :disabled="!areGeometryOverlaysVisible"
      :options="[
        { label: 'Faint hidden lines', value: 'occluded' },
        { label: 'Visible only', value: 'visible' },
        { label: 'Always on top', value: 'always' }
      ]"
      size="small"
      @update:value="store.setRendering('debug', 'overlayDepthMode', $event as OverlayDepthMode)"
    />
  </label>
  <SettingSlider
    label="Line width"
    :is-disabled="!areGeometryOverlaysVisible"
    :value="store.settings.value!.rendering.debug.overlayLineWidth"
    :min="1"
    :max="5"
    :step="0.5"
    :digits="1"
    unit="px"
    @change="store.setRendering('debug', 'overlayLineWidth', $event)"
  />
  <SettingSlider
    label="Opacity"
    :is-disabled="!areGeometryOverlaysVisible"
    :value="store.settings.value!.rendering.debug.overlayOpacity * 100"
    :min="10"
    :max="100"
    :step="5"
    :digits="0"
    unit="%"
    @change="store.setRendering('debug', 'overlayOpacity', $event / 100)"
  />

  <SettingCheckbox
    v-for="checkbox in debugOverlayCheckboxes"
    :key="checkbox.key"
    :label="checkbox.label"
    :color="OVERLAY_STYLES[checkbox.style].color"
    :title="
      checkbox.style === 'bodyInside'
        ? 'Green: intersects the viewing frustum. Red and dashed: outside the viewing frustum.'
        : OVERLAY_STYLES[checkbox.style].label
    "
    :is-disabled="!areGeometryOverlaysVisible"
    :is-checked="store.settings.value!.rendering.debug[checkbox.key]"
    @change="store.setRendering('debug', checkbox.key, $event)"
  />
  <NDivider class="debug-view-divider" />
  <label class="select-row">
    <span>Debug visualization</span>
    <NSelect
      :value="store.currentDebugVisualization.value"
      :options="debugVisualizations"
      size="small"
      @update:value="store.setDebugVisualization($event as DebugVisualization | 'none')"
    />
  </label>
</template>

<style scoped>
.debug-view-divider {
  margin: 12px 0;
}

.select-row {
  display: grid;
  grid-template-columns: var(--luz-setting-label-width) minmax(0, 1fr);
  align-items: center;
  gap: var(--luz-setting-gap);
  min-height: 36px;
  color: rgb(255 255 255 / 74%);
  font-size: 12px;
}

.select-row :deep(.n-select) {
  width: 100%;
}
</style>
