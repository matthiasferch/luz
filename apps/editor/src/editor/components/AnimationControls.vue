<script setup lang="ts">
import { computed } from 'vue'
import { NButton } from 'naive-ui'
import { Pause, Play, RotateCcw } from '@lucide/vue'
import { useEditorStore } from '../editor-store'

const store = useEditorStore()
const groups = computed(() => store.animationGroups.value.filter((group) => group.clips.length > 0))
const areAnimationsPlaying = computed(() => groups.value.every((group) => group.clips.some((clip) => clip.isPlaying)))
const hasPlayingAnimation = computed(() => groups.value.some((group) => group.clips.some((clip) => clip.isPlaying)))

const onPlay = () => {
  for (const group of groups.value) {
    if (group.clips.some((clip) => clip.isPlaying)) {
      continue
    }

    if (group.clips.some((clip) => clip.weight > 0)) {
      store.controlAnimation(group.key, 'resume')
    } else {
      store.setAnimationMix(group.key, { [group.clips[0].name]: 1 }, 0, true)
    }
  }
}

const onPause = () => {
  for (const group of groups.value) {
    if (group.clips.some((clip) => clip.isPlaying)) {
      store.controlAnimation(group.key, 'pause')
    }
  }
}

const onReset = () => {
  for (const group of groups.value) {
    store.seekAnimation(group.key, 0)
  }
}
</script>

<template>
  <div
    v-if="groups.length > 0"
    class="animation-controls"
    role="group"
    aria-label="Animation controls"
    data-editor-interactive
    @pointerdown.stop
  >
    <NButton
      class="animation-control"
      quaternary
      circle
      aria-label="Play animations"
      :disabled="areAnimationsPlaying"
      @click="onPlay"
      ><Play :size="16" aria-hidden="true"
    /></NButton>
    <NButton
      class="animation-control"
      quaternary
      circle
      aria-label="Pause animations"
      :disabled="!hasPlayingAnimation"
      @click="onPause"
      ><Pause :size="16" aria-hidden="true"
    /></NButton>
    <NButton class="animation-control" quaternary circle aria-label="Reset animations" @click="onReset"
      ><RotateCcw :size="16" aria-hidden="true"
    /></NButton>
  </div>
</template>

<style scoped>
.animation-controls {
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

.animation-control {
  width: 36px;
  height: 36px;
}
</style>
