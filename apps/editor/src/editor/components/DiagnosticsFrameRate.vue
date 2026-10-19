<script setup lang="ts">
import { useEditorStore } from '../editor-store'

const store = useEditorStore()
const display = (value: number | null) => (value === null ? '—' : String(value))
</script>

<template>
  <div class="frame-rate">
    <span>Frame rate</span><strong>{{ display(store.telemetry.value.framesPerSecond) }}</strong>
  </div>
</template>

<style scoped>
.frame-rate {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 7px;
  background: rgb(184 184 184 / 12%);
  color: rgb(255 255 255 / 72%);
  font-size: 12px;
}

.frame-rate strong {
  color: white;
  font-size: 16px;
  font-weight: 600;
}
</style>
