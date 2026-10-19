<script setup lang="ts">
import type { PlaybackMode } from '@luz/formats'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { NButton, NEmpty, NInput, NSelect, NSlider } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import { Pause, Play, Plus, Repeat, RepeatOff, Square, X } from '@lucide/vue'
import { useEditorStore } from '../editor-store'
import SettingSlider from './SettingSlider.vue'

interface AnimationOption extends SelectOption {
  label: string
  value: string
}

const getStableOptions = (options: AnimationOption[], previousOptions?: AnimationOption[]) => {
  if (
    previousOptions?.length === options.length &&
    options.every(
      (option, index) => option.label === previousOptions[index].label && option.value === previousOptions[index].value
    )
  ) {
    return previousOptions
  }

  return options
}

const speedOptions = [0.25, 0.5, 1, 1.5, 2].map((value) => ({ label: `${value}×`, value }))
const selectTheme = { peers: { InternalSelection: { paddingSingle: '0 26px 0 10px' } } }
const store = useEditorStore()
const selectedGroup = ref<string | null>(null)
const selectedTab = ref<'clips' | 'mixer'>('clips')
const search = ref('')
const transitionDuration = ref(0.2)
const selections = ref<Record<string, { clip: string; weights: Record<string, number> }>>({})
const group = computed(() => store.animationGroups.value.find((entry) => entry.key === selectedGroup.value))
const groupOptions = computed<AnimationOption[]>((previousOptions) =>
  getStableOptions(
    store.animationGroups.value.map((entry) => ({ label: entry.label, value: entry.key })),
    previousOptions
  )
)
const selection = computed(() => (selectedGroup.value ? selections.value[selectedGroup.value] : undefined))
const filteredClips = computed(
  () => group.value?.clips.filter((clip) => clip.name.toLowerCase().includes(search.value.trim().toLowerCase())) ?? []
)
const activeClips = computed(() => group.value?.clips.filter((clip) => clip.weight > 0) ?? [])
const primaryClip = computed(
  () =>
    activeClips.value.find((clip) => clip.name === selection.value?.clip) ??
    activeClips.value[0] ??
    group.value?.clips.find((clip) => clip.name === selection.value?.clip)
)
const isPlaying = computed(() => activeClips.value.some((clip) => clip.isPlaying))
const canPlay = computed(() =>
  selectedTab.value !== 'mixer'
    ? Boolean(primaryClip.value)
    : activeClips.value.length > 0 || Object.values(selection.value?.weights ?? {}).some((weight) => weight > 0)
)
const playbackTime = ref(0)
const progress = computed(() =>
  primaryClip.value && primaryClip.value.duration > 0 ? playbackTime.value / primaryClip.value.duration : 0
)

let playbackFrame: number | undefined

const updatePlaybackTime = () => {
  playbackTime.value =
    group.value && primaryClip.value ? store.getAnimationTime(group.value.key, primaryClip.value.name) : 0
  playbackFrame = window.requestAnimationFrame(updatePlaybackTime)
}

watch(
  primaryClip,
  (clip) => {
    playbackTime.value = clip?.time ?? 0
  },
  { immediate: true }
)
onMounted(() => {
  playbackFrame = window.requestAnimationFrame(updatePlaybackTime)
})
onUnmounted(() => {
  if (playbackFrame !== undefined) {
    window.cancelAnimationFrame(playbackFrame)
  }
})

const mixerClips = computed(
  () => group.value?.clips.filter((clip) => Object.keys(selection.value?.weights ?? {}).includes(clip.name)) ?? []
)
const availableClips = computed<AnimationOption[]>((previousOptions) =>
  getStableOptions(
    group.value?.clips
      .filter((clip) => !Object.keys(selection.value?.weights ?? {}).includes(clip.name))
      .map((clip) => ({ label: clip.name, value: clip.name })) ?? [],
    previousOptions
  )
)
const formatTime = (time: number) => `${time.toFixed(2)} s`

const createWeightHandler = (name: string) => (value: number) => updateWeight(name, value)

watch(
  groupOptions,
  (options) => {
    if (!options.some((option) => option.value === selectedGroup.value)) {
      selectedGroup.value = options[0]?.value ?? null
    }
  },
  { immediate: true }
)
watch(
  () => JSON.stringify([selectedGroup.value, group.value?.clips.map((clip) => clip.name)]),
  () => {
    if (!group.value) {
      return
    }

    const previousSelection = selections.value[group.value.key]

    selections.value[group.value.key] = {
      clip: group.value.clips.some((clip) => clip.name === previousSelection?.clip)
        ? previousSelection.clip
        : (activeClips.value[0]?.name ?? group.value.clips[0]?.name ?? ''),
      weights: previousSelection
        ? Object.fromEntries(
            Object.entries(previousSelection.weights).filter(([name]) =>
              group.value!.clips.some((clip) => clip.name === name)
            )
          )
        : Object.fromEntries(activeClips.value.map((clip) => [clip.name, clip.weight]))
    }
    search.value = ''
  },
  { immediate: true }
)

const playClip = (name: string) => {
  if (group.value && selection.value) {
    selection.value.clip = name
    selection.value.weights = { [name]: 1 }

    store.setAnimationMix(group.value.key, { [name]: 1 }, transitionDuration.value, true)
  }
}

const togglePlayback = (name: string, mode: PlaybackMode | undefined) => {
  if (group.value) {
    store.setAnimationPlayback(group.value.key, name, mode === 'loop' ? 'once' : 'loop')
  }
}

const togglePlaying = () => {
  if (!group.value || !selection.value) {
    return
  }

  if (isPlaying.value) {
    store.controlAnimation(group.value.key, 'pause')
  } else if (activeClips.value.length) {
    store.controlAnimation(group.value.key, 'resume')
  } else if (selectedTab.value === 'mixer' && Object.values(selection.value.weights).some((weight) => weight > 0)) {
    store.setAnimationMix(group.value.key, selection.value.weights, 0, true)
  } else {
    playClip(selection.value.clip)
  }
}

const stopPlayback = () => {
  if (group.value) {
    store.controlAnimation(group.value.key, 'stop')
  }
}

const seekPlayback = (value: number) => {
  if (!group.value || !selection.value) {
    return
  }

  if (!activeClips.value.length) {
    const weights = selectedTab.value === 'mixer' ? selection.value.weights : { [selection.value.clip]: 1 }

    store.setAnimationMix(group.value.key, weights, 0, true)
  }

  store.seekAnimation(group.value.key, value)
}

const setSpeed = (value: number) => {
  if (group.value) {
    store.setAnimationSpeed(group.value.key, value)
  }
}

const addClip = (name: string) => {
  if (selection.value) {
    selection.value.weights = Object.fromEntries([...Object.entries(selection.value.weights), [name, 0]])
  }
}

const updateWeight = (name: string, percentage: number) => {
  if (!selection.value || !group.value) {
    return
  }

  const weights = selection.value.weights
  const otherNames = Object.keys(weights).filter((clipName) => clipName !== name)
  const totalWeight = otherNames.reduce((sum, clipName) => sum + weights[clipName], 0)
  const weight = percentage / 100

  weights[name] = otherNames.length ? weight : weight > 0 ? 1 : 0

  for (const clipName of otherNames) {
    weights[clipName] = (1 - weight) * (totalWeight > 0 ? weights[clipName] / totalWeight : 1 / otherNames.length)
  }

  store.setAnimationMix(group.value.key, { ...weights }, 0)
}

const removeClip = (name: string) => {
  if (!selection.value || !group.value) {
    return
  }

  delete selection.value.weights[name]

  const totalWeight = Object.values(selection.value.weights).reduce((sum, weight) => sum + weight, 0)

  for (const clipName of Object.keys(selection.value.weights)) {
    selection.value.weights[clipName] = totalWeight > 0 ? selection.value.weights[clipName] / totalWeight : 0
  }

  store.setAnimationMix(group.value.key, { ...selection.value.weights }, 0)
}
</script>

<template>
  <div class="animation-panel">
    <NEmpty v-if="!group" description="No animations in this scene" size="small" />
    <template v-else>
      <label class="character-field"
        >Target
        <NSelect
          v-model:value="selectedGroup"
          :options="groupOptions"
          :theme-overrides="selectTheme"
          aria-label="Target"
          size="small"
        />
      </label>
      <div class="animation-tabs" role="tablist" aria-label="Animation views">
        <button
          id="animation-clips-tab"
          type="button"
          role="tab"
          :aria-selected="selectedTab === 'clips'"
          aria-controls="animation-clips"
          @click="selectedTab = 'clips'"
        >
          Animations
        </button>
        <button
          id="animation-mixer-tab"
          type="button"
          role="tab"
          :aria-selected="selectedTab === 'mixer'"
          aria-controls="animation-mixer"
          @click="selectedTab = 'mixer'"
        >
          Mixer
        </button>
      </div>
      <div
        v-if="selectedTab === 'clips'"
        id="animation-clips"
        class="animation-content"
        role="tabpanel"
        aria-labelledby="animation-clips-tab"
      >
        <NInput
          v-model:value="search"
          placeholder="Search animations"
          aria-label="Search animations"
          size="small"
          clearable
        />
        <div class="clip-list" aria-label="Animations">
          <NEmpty v-if="!filteredClips.length" description="No matching animations" size="small" />
          <div
            v-for="clip in filteredClips"
            :key="clip.name"
            class="clip-row"
            :class="{ selected: selection?.clip === clip.name }"
          >
            <button
              class="clip-name"
              type="button"
              :aria-pressed="selection?.clip === clip.name"
              @click="selection && (selection.clip = clip.name)"
            >
              <span>{{ clip.name }}</span
              ><small
                >{{ formatTime(clip.duration)
                }}<span v-if="clip.weight > 0">
                  · {{ clip.isPlaying ? 'Playing' : group?.isPaused ? 'Paused' : 'Held' }}</span
                ></small
              >
            </button>
            <NButton size="tiny" quaternary :aria-label="`Play ${clip.name}`" @click="playClip(clip.name)"
              ><Play :size="14" aria-hidden="true"
            /></NButton>
            <NButton
              size="tiny"
              quaternary
              :aria-label="`Loop ${clip.name}`"
              :aria-pressed="clip.playback === 'loop'"
              @click="togglePlayback(clip.name, clip.playback)"
              ><component :is="clip.playback === 'loop' ? Repeat : RepeatOff" :size="14" aria-hidden="true"
            /></NButton>
          </div>
        </div>
        <SettingSlider
          label="Crossfade"
          :value="transitionDuration"
          :min="0"
          :max="2"
          :step="0.05"
          unit=" s"
          @change="transitionDuration = $event"
        />
      </div>
      <div v-else id="animation-mixer" class="animation-content" role="tabpanel" aria-labelledby="animation-mixer-tab">
        <NSelect
          :value="null"
          :options="availableClips"
          :theme-overrides="selectTheme"
          :disabled="!availableClips.length"
          placeholder="Add an animation to the mix"
          aria-label="Add animation to mix"
          size="small"
          filterable
          @update:value="addClip"
          ><template #arrow><Plus :size="14" aria-hidden="true" /></template
        ></NSelect>
        <div v-for="clip in mixerClips" :key="clip.name" class="mixer-row">
          <div class="mixer-heading">
            <span>{{ clip.name }}</span>
            <NButton
              size="tiny"
              quaternary
              :aria-label="`Loop ${clip.name}`"
              :aria-pressed="clip.playback === 'loop'"
              @click="togglePlayback(clip.name, clip.playback)"
              ><component :is="clip.playback === 'loop' ? Repeat : RepeatOff" :size="14" aria-hidden="true"
            /></NButton>
            <NButton size="tiny" quaternary :aria-label="`Remove ${clip.name} from mix`" @click="removeClip(clip.name)"
              ><X :size="14" aria-hidden="true"
            /></NButton>
          </div>
          <div class="weight-control">
            <NSlider
              :value="(selection?.weights[clip.name] ?? 0) * 100"
              :min="0"
              :max="100"
              :step="1"
              :tooltip="false"
              :aria-label="`${clip.name} contribution`"
              v-bind="{ 'onUpdate:value': createWeightHandler(clip.name) }"
            /><output>{{ Math.round((selection?.weights[clip.name] ?? 0) * 100) }}%</output>
          </div>
        </div>
      </div>
      <div class="animation-transport" aria-label="Animation playback">
        <div class="transport-heading">
          <span>{{ activeClips.length > 1 ? 'Mixed playback' : primaryClip?.name }}</span
          ><output>{{ formatTime(playbackTime) }} / {{ formatTime(primaryClip?.duration ?? 0) }}</output>
        </div>
        <NSlider
          :value="progress"
          :min="0"
          :max="1"
          :step="0.001"
          :tooltip="false"
          :disabled="!canPlay"
          aria-label="Animation progress"
          @update:value="seekPlayback"
        />
        <div class="transport-actions">
          <NButton
            size="small"
            :aria-label="isPlaying ? 'Pause playback' : 'Resume playback'"
            :disabled="!canPlay"
            @click="togglePlaying"
            ><component :is="isPlaying ? Pause : Play" :size="16" aria-hidden="true"
          /></NButton>
          <NButton size="small" aria-label="Stop playback" @click="stopPlayback"
            ><Square :size="14" aria-hidden="true"
          /></NButton>
          <label class="speed-field"
            >Speed<NSelect
              :value="group.speed"
              :options="speedOptions"
              :theme-overrides="selectTheme"
              aria-label="Playback speed"
              size="small"
              @update:value="setSpeed"
          /></label>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.animation-panel {
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.character-field {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.animation-tabs {
  flex-shrink: 0;
  display: flex;
  gap: 16px;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
}

.animation-tabs button {
  padding: 6px 0;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  color: #9299a6;
  cursor: pointer;
  font: inherit;
}

.animation-tabs button[aria-selected='true'] {
  color: #eee;
  border-bottom-color: #b8b8b8;
}

.animation-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  scrollbar-width: thin;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.clip-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: auto;
  scrollbar-width: thin;
}

.clip-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 5px;
}

.clip-row.selected {
  background: rgb(255 255 255 / 7%);
}

.clip-name {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  gap: 2px;
  min-width: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}

.clip-name > span {
  overflow-wrap: anywhere;
}

.clip-name small,
.animation-help {
  color: #9299a6;
  font-size: 11px;
}

.animation-help {
  margin: 0;
}

.mixer-heading,
.transport-heading,
.transport-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.mixer-heading > span {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.mixer-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.weight-control {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 40px;
  gap: 10px;
  align-items: center;
}

.weight-control output,
.transport-heading output {
  font-size: 11px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.weight-control output {
  text-align: right;
}

.animation-transport {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid rgb(255 255 255 / 10%);
  padding-top: 12px;
}

.transport-heading {
  flex-wrap: wrap;
  justify-content: space-between;
}

.transport-heading > span {
  overflow-wrap: anywhere;
}

.speed-field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  font-size: 12px;
}

.speed-field :deep(.n-select) {
  width: 80px;
}

button:focus-visible {
  outline: 2px solid #b8b8b8;
  outline-offset: 2px;
}
</style>
