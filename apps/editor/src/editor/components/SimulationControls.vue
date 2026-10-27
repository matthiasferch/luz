<script setup lang="ts">
import { NButton } from 'naive-ui'
import { Pause, Play, RotateCcw } from '@lucide/vue'
import { useEditorStore } from '../editor-store'

const store = useEditorStore()

const onStart = () => {
  if (!store.isSimulationRunning.value) {
    store.toggleSimulation()
  }
}

const onPause = () => {
  if (store.isSimulationRunning.value) {
    store.toggleSimulation()
  }
}
</script>

<template>
  <div
    class="simulation-controls"
    role="group"
    aria-label="Simulation controls"
    data-editor-interactive
    @pointerdown.stop
  >
    <NButton
      class="simulation-control"
      quaternary
      circle
      title="Start simulation"
      aria-label="Start simulation"
      :disabled="store.isSimulationRunning.value"
      @click="onStart"
      ><Play :size="20" aria-hidden="true"
    /></NButton>
    <NButton
      class="simulation-control"
      quaternary
      circle
      title="Pause simulation"
      aria-label="Pause simulation"
      :disabled="!store.isSimulationRunning.value"
      @click="onPause"
      ><Pause :size="20" aria-hidden="true"
    /></NButton>
    <NButton
      class="simulation-control"
      quaternary
      circle
      title="Reset simulation"
      aria-label="Reset simulation"
      @click="store.resetSimulation"
      ><RotateCcw :size="20" aria-hidden="true"
    /></NButton>
  </div>
</template>

<style scoped>
.simulation-controls {
  position: fixed;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  z-index: 10000;
  display: flex;
  gap: 4px;
  padding: 4px;
  pointer-events: auto;
  touch-action: manipulation;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 28px;
  background: rgb(18 20 25 / 90%);
  box-shadow: 0 10px 32px rgb(0 0 0 / 28%);
  transform: translateX(-50%);
  backdrop-filter: blur(16px);
}

.simulation-control {
  width: 44px;
  height: 44px;
}
</style>
