<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NCheckbox, NCollapse, NCollapseItem, NDivider } from 'naive-ui'
import type { DebugOverlayCategory } from '../../settings'
import { useEditorStore } from '../editor-store'
import SettingSlider from './SettingSlider.vue'

const store = useEditorStore()
const simulation = computed(() => store.settings.value!.simulation)
const overlayEnabled = computed(() => store.settings.value!.rendering.debug.areOverlaysVisible)
const overlayCategories = computed(() => store.settings.value!.rendering.debug.overlayCategories)
const legendItems: Array<{ category: DebugOverlayCategory; label: string; description: string }> = [
  { category: 'active', label: 'Active', description: 'Dynamic or kinematic and currently simulated' },
  { category: 'passive', label: 'Passive', description: 'Static and fixed in the world' },
  { category: 'sleeping', label: 'Sleeping', description: 'Temporarily excluded from simulation' },
  { category: 'colliding', label: 'Colliding', description: 'Has one or more current contacts' },
  { category: 'culled', label: 'Culled', description: 'Outside the camera frustum' }
]
</script>

<template>
  <SettingSlider
    label="Gravity"
    :value="simulation.gravity ?? -9.81"
    :min="-30"
    :max="30"
    :step="0.1"
    :digits="2"
    unit="m/s²"
    @change="store.setGravity"
  />
  <SettingSlider
    label="Time scale"
    :value="simulation.timeScale"
    :min="0"
    :max="1"
    :step="0.05"
    :digits="2"
    unit="×"
    @change="store.setTimeScale"
  />
  <div class="simulation-actions">
    <NButton secondary size="small" @click="store.toggleSimulation">
      {{ store.isSimulationRunning.value ? 'Stop' : 'Start' }}
    </NButton>
    <NButton secondary size="small" @click="store.resetSimulation">Reset</NButton>
  </div>
  <NDivider class="simulation-divider" />
  <NCollapse class="overlay-settings" :default-expanded-names="['overlay']" arrow-placement="right">
    <NCollapseItem name="overlay">
      <template #header>
        <NCheckbox
          class="overlay-toggle"
          size="small"
          :checked="overlayEnabled"
          @click.stop
          @update:checked="store.setRendering('debug', 'areOverlaysVisible', $event)"
          ><span id="simulation-legend-title">Enable overlay</span></NCheckbox
        >
      </template>
      <section class="simulation-legend" aria-labelledby="simulation-legend-title">
        <div
          v-for="item in legendItems"
          :key="item.category"
          class="legend-item"
          :class="{ 'is-disabled': !overlayEnabled }"
        >
          <NCheckbox
            :class="['legend-toggle', item.category]"
            size="small"
            :checked="overlayCategories[item.category]"
            :disabled="!overlayEnabled"
            :aria-label="`${item.label} overlays`"
            @update:checked="store.setDebugOverlayCategory(item.category, $event)"
          />
          <span
            ><strong>{{ item.label }}</strong
            ><small>{{ item.description }}</small></span
          >
        </div>
      </section>
    </NCollapseItem>
  </NCollapse>
</template>

<style scoped>
.simulation-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding-top: 8px;
}

.simulation-divider {
  margin: 12px 0;
}

.overlay-toggle {
  font-size: var(--luz-checkbox-label-size);
  font-weight: inherit;
}

.legend-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: start;
  gap: 8px;
  min-height: 34px;
}

.legend-toggle {
  margin-top: -2px;
}

.legend-toggle.active {
  --legend-color: var(--luz-overlay-active);
}

.legend-toggle.passive {
  --legend-color: var(--luz-overlay-passive);
}

.legend-toggle.sleeping {
  --legend-color: var(--luz-overlay-sleeping);
}

.legend-toggle.colliding {
  --legend-color: var(--luz-overlay-colliding);
}

.legend-toggle.culled {
  --legend-color: var(--luz-overlay-culled);
}

.legend-toggle :deep(.n-checkbox-box) {
  background: color-mix(in srgb, var(--legend-color) 18%, transparent) !important;
}

.legend-toggle :deep(.n-checkbox-box__border) {
  border: 1px solid var(--legend-color) !important;
}

.legend-toggle.n-checkbox--checked :deep(.n-checkbox-box) {
  background: var(--legend-color) !important;
}

.legend-toggle.n-checkbox--disabled {
  opacity: 1;
}

.legend-toggle.n-checkbox--disabled :deep(.n-checkbox-box) {
  background: color-mix(in srgb, var(--legend-color) 7%, rgb(255 255 255 / 2.5%)) !important;
}

.legend-toggle.n-checkbox--disabled :deep(.n-checkbox-box__border) {
  border-color: color-mix(in srgb, var(--legend-color) 38%, rgb(255 255 255 / 12%)) !important;
}

.legend-toggle.n-checkbox--disabled.n-checkbox--checked :deep(.n-checkbox-box) {
  background: color-mix(in srgb, var(--legend-color) 32%, rgb(18 20 25 / 92%)) !important;
}

.legend-toggle.n-checkbox--disabled :deep(.n-checkbox-icon) {
  opacity: 0.48;
}

.legend-toggle.culled :deep(.n-checkbox-box__border) {
  border-style: dashed !important;
}

.legend-item > span:last-child {
  display: grid;
  gap: 1px;
  transition: opacity 140ms ease;
}

.legend-item.is-disabled > span:last-child {
  opacity: 0.42;
}

.legend-item strong {
  color: rgb(255 255 255 / 82%);
  font-size: var(--luz-checkbox-label-size);
  font-weight: 500;
  line-height: 1.2;
}

.legend-item small {
  color: rgb(255 255 255 / 46%);
  font-size: 9px;
  line-height: 1.25;
}
</style>
