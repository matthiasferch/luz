<script setup lang="ts">
import { computed } from 'vue'
import { NCheckbox, NCollapse, NCollapseItem, NSelect } from 'naive-ui'
import { VOLUMETRIC_QUALITY } from '@luz/graphics'
import { AMBIENT_OCCLUSION_QUALITY } from '@luz/graphics'
import {
  ambientOcclusionSliders,
  bloomSliders,
  depthOfFieldSliders,
  motionBlurSliders,
  shadowSliders,
  volumetricLightingSliders,
  type SliderDefinition
} from '../control-catalog'
import { useEditorStore } from '../editor-store'
import { depthOfFieldPresets, getDepthOfFieldPreset } from '../depth-of-field-presets'
import type { DepthOfFieldSettings } from '../../settings'
import SettingSlider from './SettingSlider.vue'
import SettingCheckbox from './SettingCheckbox.vue'

const store = useEditorStore()
const rendering = computed(() => store.settings.value!.rendering)
const isControlDisabled = (control: SliderDefinition, isFeatureEnabled = true, section?: object) =>
  !isFeatureEnabled ||
  Boolean(control.requires && !Object.entries(section ?? {}).some(([key, value]) => key === control.requires && value))

const getSliderProperties = ({ key: _key, requires: _requires, ...props }: SliderDefinition) => props

const ambientOcclusionQualityOptions = Object.entries(AMBIENT_OCCLUSION_QUALITY).map(([value, profile]) => ({
  value,
  label: `${value[0].toUpperCase()}${value.slice(1)} (${profile.directionCount} directions × ${profile.stepCount} steps)`
}))
const volumetricQualityOptions = Object.entries(VOLUMETRIC_QUALITY).map(([value, profile]) => ({
  value,
  label: `${value[0].toUpperCase()}${value.slice(1)} (${profile.sampleCount} steps, ${profile.resolutionScale * 100}% resolution)`
}))
const motionBlurQualityOptions = [
  [8, 'Low'],
  [16, 'Medium'],
  [24, 'High'],
  [32, 'Ultra']
].map(([value, label]) => ({ value, label: `${label} (${value} maximum)` }))
const depthOfFieldQualityOptions = [
  [16, 'Low'],
  [32, 'Medium'],
  [48, 'High'],
  [64, 'Ultra']
].map(([value, label]) => ({ value, label: `${label} (${value} maximum)` }))
const depthOfFieldPresetOptions = [
  { value: 'camera', label: 'Blender camera' },
  ...depthOfFieldPresets.map(({ value, label }) => ({ value, label })),
  { value: 'custom', label: 'Custom', disabled: true }
]
const selectedDepthOfFieldPreset = computed(() => getDepthOfFieldPreset(rendering.value.depthOfField))

const onDepthOfFieldPresetChange = (value: string) => {
  if (value === 'camera') {
    store.setRendering('depthOfField', 'isCameraOverridden', false)
    store.setRendering('depthOfField', 'isEnabled', true)

    return
  }

  const preset = depthOfFieldPresets.find((candidate) => candidate.value === value)

  if (!preset) {
    return
  }

  for (const [key, setting] of Object.entries(preset.settings)) {
    store.setRendering('depthOfField', key as keyof DepthOfFieldSettings, setting)
  }

  store.setRendering('depthOfField', 'isCameraOverridden', true)
  store.setRendering('depthOfField', 'isEnabled', true)
}

const antialiasingOptions = [
  { label: 'Fast approximate anti-aliasing (FXAA)', value: 'fxaa' },
  { label: 'Temporal anti-aliasing (TAA)', value: 'taa' }
]
</script>

<template>
  <NCollapse class="section-list" :default-expanded-names="['antialiasing', 'shadows']" arrow-placement="right">
    <NCollapseItem name="antialiasing">
      <template #header>
        <NCheckbox
          class="feature-toggle"
          size="small"
          :checked="store.antialiasingMode.value !== 'off'"
          @click.stop
          @update:checked="store.setAntialiasingEnabled"
          >Anti-aliasing</NCheckbox
        >
      </template>
      <label class="select-row"
        ><span>Method</span
        ><NSelect
          :value="store.selectedAntialiasingMode.value"
          :options="antialiasingOptions"
          :disabled="store.antialiasingMode.value === 'off'"
          size="small"
          @update:value="store.setAntialiasingMode"
      /></label>
    </NCollapseItem>

    <NCollapseItem name="shadows">
      <template #header>
        <NCheckbox
          class="feature-toggle"
          size="small"
          :checked="rendering.shadows.isEnabled"
          @click.stop
          @update:checked="store.setRendering('shadows', 'isEnabled', $event)"
          >Shadows</NCheckbox
        >
      </template>
      <SettingSlider
        v-for="control in shadowSliders"
        :key="control.key"
        v-bind="getSliderProperties(control)"
        :value="rendering.shadows[control.key]"
        :is-disabled="isControlDisabled(control, rendering.shadows.isEnabled)"
        @change="store.setRendering('shadows', control.key, $event)"
      />
    </NCollapseItem>

    <div class="feature-only-row">
      <NCheckbox
        class="feature-toggle"
        size="small"
        :checked="rendering.planarReflections.isEnabled"
        @update:checked="store.setRendering('planarReflections', 'isEnabled', $event)"
        >Planar reflections</NCheckbox
      >
    </div>

    <NCollapseItem name="ambient-occlusion">
      <template #header>
        <NCheckbox
          class="feature-toggle"
          size="small"
          :checked="rendering.ambientOcclusion.isEnabled"
          @click.stop
          @update:checked="store.setRendering('ambientOcclusion', 'isEnabled', $event)"
          >Ambient occlusion</NCheckbox
        >
      </template>
      <label class="select-row"
        ><span>Quality</span
        ><NSelect
          :value="rendering.ambientOcclusion.quality"
          :options="ambientOcclusionQualityOptions"
          :disabled="!rendering.ambientOcclusion.isEnabled"
          size="small"
          @update:value="store.setRendering('ambientOcclusion', 'quality', $event)"
      /></label>
      <SettingSlider
        v-for="control in ambientOcclusionSliders"
        :key="control.key"
        v-bind="getSliderProperties(control)"
        :value="rendering.ambientOcclusion[control.key]"
        :is-disabled="isControlDisabled(control, rendering.ambientOcclusion.isEnabled)"
        @change="store.setRendering('ambientOcclusion', control.key, $event)"
      />
    </NCollapseItem>

    <NCollapseItem name="volumetric">
      <template #header>
        <NCheckbox
          class="feature-toggle"
          size="small"
          :checked="rendering.volumetricLighting.isEnabled"
          @click.stop
          @update:checked="store.setRendering('volumetricLighting', 'isEnabled', $event)"
          >Volumetric lighting</NCheckbox
        >
      </template>
      <label class="select-row"
        ><span>Quality</span
        ><NSelect
          :value="rendering.volumetricLighting.quality"
          :options="volumetricQualityOptions"
          :disabled="!rendering.volumetricLighting.isEnabled"
          size="small"
          @update:value="store.setRendering('volumetricLighting', 'quality', $event)"
      /></label>
      <SettingSlider
        v-for="control in volumetricLightingSliders"
        :key="control.key"
        v-bind="getSliderProperties(control)"
        :value="rendering.volumetricLighting[control.key]"
        :is-disabled="isControlDisabled(control, rendering.volumetricLighting.isEnabled)"
        @change="store.setRendering('volumetricLighting', control.key, $event)"
      />
    </NCollapseItem>

    <div class="feature-only-row">
      <NCheckbox
        class="feature-toggle"
        size="small"
        :checked="rendering.lighting.isSubsurfaceLightingEnabled"
        @update:checked="store.setRendering('lighting', 'isSubsurfaceLightingEnabled', $event)"
        >Subsurface lighting</NCheckbox
      >
    </div>

    <NCollapseItem name="bloom">
      <template #header>
        <NCheckbox
          class="feature-toggle"
          size="small"
          :checked="rendering.bloom.isEnabled"
          @click.stop
          @update:checked="store.setRendering('bloom', 'isEnabled', $event)"
          >Bloom</NCheckbox
        >
      </template>
      <SettingSlider
        v-for="control in bloomSliders"
        :key="control.key"
        v-bind="getSliderProperties(control)"
        :value="rendering.bloom[control.key]"
        :is-disabled="isControlDisabled(control, rendering.bloom.isEnabled)"
        @change="store.setRendering('bloom', control.key, $event)"
      />
    </NCollapseItem>

    <NCollapseItem name="motion-blur">
      <template #header>
        <NCheckbox
          class="feature-toggle"
          size="small"
          :checked="rendering.motionBlur.isEnabled"
          @click.stop
          @update:checked="store.setRendering('motionBlur', 'isEnabled', $event)"
          >Motion blur</NCheckbox
        >
      </template>
      <SettingCheckbox
        label="Camera motion"
        title="Include camera movement in motion blur. Turn off to blur only moving objects."
        :is-checked="rendering.motionBlur.isCameraBlurEnabled"
        :is-disabled="!rendering.motionBlur.isEnabled"
        @change="store.setRendering('motionBlur', 'isCameraBlurEnabled', $event)"
      />
      <label class="select-row"
        ><span>Quality</span
        ><NSelect
          :value="rendering.motionBlur.maximumSamples"
          :options="motionBlurQualityOptions"
          :disabled="!rendering.motionBlur.isEnabled"
          size="small"
          @update:value="store.setRendering('motionBlur', 'maximumSamples', $event)"
      /></label>
      <SettingSlider
        v-for="control in motionBlurSliders"
        :key="control.key"
        v-bind="getSliderProperties(control)"
        :value="rendering.motionBlur[control.key]"
        :is-disabled="isControlDisabled(control, rendering.motionBlur.isEnabled)"
        @change="store.setRendering('motionBlur', control.key, $event)"
      />
    </NCollapseItem>

    <NCollapseItem name="depth-of-field">
      <template #header>
        <NCheckbox
          class="feature-toggle"
          size="small"
          :checked="rendering.depthOfField.isEnabled"
          @click.stop
          @update:checked="store.setRendering('depthOfField', 'isEnabled', $event)"
          >Depth of field</NCheckbox
        >
      </template>
      <label class="select-row">
        <span>Preset</span>
        <NSelect
          aria-label="Depth of field preset"
          :value="selectedDepthOfFieldPreset"
          :options="depthOfFieldPresetOptions"
          size="small"
          @update:value="onDepthOfFieldPresetChange"
        />
      </label>
      <label class="select-row"
        ><span>Quality</span
        ><NSelect
          :value="rendering.depthOfField.maximumSamples"
          :options="depthOfFieldQualityOptions"
          :disabled="!rendering.depthOfField.isEnabled"
          size="small"
          @update:value="store.setRendering('depthOfField', 'maximumSamples', $event)"
      /></label>
      <SettingSlider
        v-for="control in depthOfFieldSliders"
        :key="control.key"
        v-bind="getSliderProperties(control)"
        :value="rendering.depthOfField[control.key]"
        :is-disabled="isControlDisabled(control, rendering.depthOfField.isEnabled, rendering.depthOfField)"
        @change="store.setRendering('depthOfField', control.key, $event)"
      />
    </NCollapseItem>
  </NCollapse>
</template>

<style scoped>
.section-list {
  padding-top: 8px;
}

.feature-toggle {
  font-size: var(--luz-checkbox-label-size);
  font-weight: inherit;
}

.feature-only-row {
  display: flex;
  align-items: center;
  margin: var(--n-item-margin);
  padding: var(--n-title-padding);
  color: var(--n-title-text-color);
  font-size: var(--n-title-font-size);
  font-weight: var(--n-title-font-weight);
  border-top: 1px solid var(--n-divider-color);
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
