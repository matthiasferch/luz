<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NDivider } from 'naive-ui'
import { environmentSliders, type SliderDefinition } from '../control-catalog'
import { useEditorStore } from '../editor-store'
import SettingSlider from './SettingSlider.vue'

const store = useEditorStore()
const settings = computed(() => store.settings.value!)
const getSliderProperties = ({ key: _key, requires: _requires, ...props }: SliderDefinition) => props
</script>

<template>
  <SettingSlider
    v-for="control in environmentSliders"
    :key="control.key"
    v-bind="getSliderProperties(control)"
    :value="settings.environment[control.key]"
    @change="store.setEnvironmentSetting(control.key, $event)"
  />
  <div class="environment-actions">
    <NDivider />
    <NButton
      class="reset-environment"
      block
      secondary
      size="small"
      :disabled="store.isEnvironmentResetting.value"
      @click="store.resetImportedEnvironment"
      >Reset to import</NButton
    >
  </div>
</template>

<style scoped>
.environment-actions :deep(.n-divider) {
  margin: 12px 0;
}
</style>
