<script setup lang="ts">
import { computed } from 'vue'
import { NButton } from 'naive-ui'
import { Pause, Play, Repeat, RepeatOff, SkipBack, SkipForward } from '@lucide/vue'
import type { AnimationGroup } from '../editor-api'
import { useEditorStore } from '../editor-store'

const store = useEditorStore()
const groups = computed(() => store.animationGroups.value.filter((group) => group.clips.length > 0))
const areAnimationsPlaying = computed(() => groups.value.every((group) => group.clips.some((clip) => clip.isPlaying)))
const hasPlayingAnimation = computed(() => groups.value.some((group) => group.clips.some((clip) => clip.isPlaying)))
const canChangeAnimation = computed(() => groups.value.some((group) => group.clips.length > 1))

const getPlaybackClips = (group: AnimationGroup) => {
  const activeClips = group.clips.filter((clip) => clip.weight > 0)

  return activeClips.length > 0 ? activeClips : group.clips.slice(0, 1)
}

const isLoopEnabled = computed(() =>
  groups.value.every((group) => getPlaybackClips(group).every((clip) => clip.playback === 'loop'))
)

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

const selectAdjacentAnimations = (offset: -1 | 1) => {
  for (const group of groups.value) {
    if (group.clips.length < 2) {
      continue
    }

    const primaryClip = group.clips.reduce((primaryClip, clip) =>
      clip.weight > primaryClip.weight ? clip : primaryClip
    )
    const activeClipIndex = primaryClip.weight > 0 ? group.clips.indexOf(primaryClip) : offset > 0 ? -1 : 0
    const clip = group.clips[(activeClipIndex + offset + group.clips.length) % group.clips.length]

    store.setAnimationMix(group.key, { [clip.name]: 1 }, 0, true)

    if (group.isPaused) {
      store.controlAnimation(group.key, 'pause')
    }
  }
}

const onPrevious = () => selectAdjacentAnimations(-1)

const onNext = () => selectAdjacentAnimations(1)

const onToggleLoop = () => {
  const playback = isLoopEnabled.value ? 'once' : 'loop'

  for (const group of groups.value) {
    for (const clip of getPlaybackClips(group)) {
      store.setAnimationPlayback(group.key, clip.name, playback)
    }
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
      aria-label="Previous animation"
      :disabled="!canChangeAnimation"
      @click="onPrevious"
      ><SkipBack :size="16" aria-hidden="true"
    /></NButton>
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
    <NButton
      class="animation-control"
      quaternary
      circle
      aria-label="Next animation"
      :disabled="!canChangeAnimation"
      @click="onNext"
      ><SkipForward :size="16" aria-hidden="true"
    /></NButton>
    <NButton
      class="animation-control"
      quaternary
      circle
      aria-label="Loop animations"
      :aria-pressed="isLoopEnabled"
      @click="onToggleLoop"
      ><Repeat v-if="isLoopEnabled" :size="16" aria-hidden="true" /><RepeatOff v-else :size="16" aria-hidden="true"
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
