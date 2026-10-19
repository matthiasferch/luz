<script setup lang="ts">
import { NCheckbox } from 'naive-ui'

defineProps<{ label: string; isChecked: boolean; isDisabled?: boolean; color?: string }>()

const emit = defineEmits<{ change: [isChecked: boolean] }>()
</script>

<template>
  <NCheckbox
    class="setting-checkbox"
    :class="{ 'is-colored': color }"
    :style="color ? { '--checkbox-color': color } : undefined"
    size="small"
    :checked="isChecked"
    :disabled="isDisabled"
    @update:checked="emit('change', $event)"
    >{{ label }}</NCheckbox
  >
</template>

<style scoped>
.setting-checkbox {
  display: flex;
  align-items: center;
  min-height: 30px;
  font-size: var(--luz-checkbox-label-size);
}

.is-colored :deep(.n-checkbox-box) {
  background: color-mix(in srgb, var(--checkbox-color) 18%, transparent) !important;
}

.is-colored :deep(.n-checkbox-box__border) {
  border: 1px solid var(--checkbox-color) !important;
}

.is-colored.n-checkbox--checked :deep(.n-checkbox-box) {
  background: var(--checkbox-color) !important;
}

.is-colored.n-checkbox--disabled {
  opacity: 1;
}

.is-colored.n-checkbox--disabled :deep(.n-checkbox-box) {
  background: color-mix(in srgb, var(--checkbox-color) 7%, rgb(255 255 255 / 2.5%)) !important;
}

.is-colored.n-checkbox--disabled :deep(.n-checkbox-box__border) {
  border-color: color-mix(in srgb, var(--checkbox-color) 38%, rgb(255 255 255 / 12%)) !important;
}

.is-colored.n-checkbox--disabled.n-checkbox--checked :deep(.n-checkbox-box) {
  background: color-mix(in srgb, var(--checkbox-color) 32%, rgb(18 20 25 / 92%)) !important;
}

.is-colored.n-checkbox--disabled :deep(.n-checkbox-icon) {
  opacity: 0.48;
}
</style>
