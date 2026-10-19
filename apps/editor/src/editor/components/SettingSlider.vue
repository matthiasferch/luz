<script setup lang="ts">
import { computed } from 'vue'
import { NSlider } from 'naive-ui'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    min: number
    max: number
    step: number
    digits?: number
    unit?: string
    isDisabled?: boolean
  }>(),
  { digits: 2, unit: '', isDisabled: false }
)

const emit = defineEmits<{ change: [value: number] }>()
const formattedValue = computed(() => `${props.value.toFixed(props.digits)}${props.unit}`)
const onValueChange = (value: number) => emit('change', value)
</script>

<template>
  <label class="setting-row">
    <span class="setting-label">{{ label }}</span>
    <NSlider
      class="setting-slider"
      :value="value"
      :min="min"
      :max="max"
      :step="step"
      :disabled="isDisabled"
      :tooltip="false"
      :aria-label="label"
      @update:value="onValueChange"
    />
    <output class="setting-value">{{ formattedValue }}</output>
  </label>
</template>

<style scoped>
.setting-row {
  display: grid;
  grid-template-columns:
    var(--luz-setting-label-width) var(--luz-setting-gap) minmax(var(--luz-setting-slider-min-width), 1fr)
    var(--luz-slider-value-gap) var(--luz-setting-value-width);
  align-items: center;
  min-height: var(--luz-setting-row-min-height);
}

.setting-label {
  color: rgb(255 255 255 / 74%);
  font-size: 12px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: clip;
}

.setting-slider {
  grid-column: 3;
}

.setting-value {
  grid-column: 5;
  justify-self: end;
  color: rgb(255 255 255 / 90%);
  font:
    500 11px/1.2 Outfit,
    sans-serif;
  text-align: right;
  white-space: nowrap;
}
</style>
