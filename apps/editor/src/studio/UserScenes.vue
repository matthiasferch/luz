<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { NButton, NTag } from 'naive-ui'
import { getListings, SignInRequired, type Listing } from './scenes'

defineProps<{ activeSceneId: string | null }>()

const emit = defineEmits<{ select: [id: string] }>()
const isHosted = __EDITOR_STUDIO__
const listings = ref<Listing[]>([])
const status = ref<'loading' | 'ready' | 'signedOut' | 'error'>('loading')

let requestNumber = 0

async function refreshListings() {
  const request = ++requestNumber

  try {
    const scenes = await getListings()

    if (request === requestNumber) {
      listings.value = scenes
      status.value = 'ready'
    }
  } catch (error) {
    if (request === requestNumber) {
      listings.value = []
      status.value = error instanceof SignInRequired ? 'signedOut' : 'error'
    }
  }
}

function onFocus() {
  void refreshListings()
}

onMounted(() => {
  if (isHosted) {
    void refreshListings()
    window.addEventListener('focus', onFocus)
  }
})
onBeforeUnmount(() => {
  requestNumber++

  window.removeEventListener('focus', onFocus)
})
</script>

<template>
  <section aria-labelledby="user-scene-heading">
    <div class="section-heading">
      <h3 id="user-scene-heading">Your scenes</h3>
      <NButton
        v-if="isHosted && status === 'ready' && listings.length"
        tag="a"
        href="/scenes"
        target="_blank"
        rel="noopener"
        text
        >Manage publications</NButton
      >
    </div>
    <a v-if="!isHosted" href="https://studio.luzjs.dev/scenes" target="_blank" rel="noopener"
      >Open your scenes in luz studio</a
    >
    <a v-else-if="status === 'signedOut'" href="/scenes" target="_blank" rel="noopener">Sign in to see your scenes</a>
    <p v-else-if="status === 'loading'" role="status">Loading your scenes…</p>
    <p v-else-if="status === 'error'" role="status">
      Couldn’t load your scenes. <NButton text @click="refreshListings">Try again</NButton>
    </p>
    <p v-else-if="!listings.length">You haven’t published any scenes yet.</p>
    <div v-else role="listbox" aria-labelledby="user-scene-heading">
      <button
        v-for="scene in listings"
        :key="scene.id"
        class="publication-row"
        role="option"
        type="button"
        :aria-selected="activeSceneId === scene.id"
        :disabled="!scene.isPublished"
        @click="emit('select', scene.id)"
      >
        <strong>{{ scene.title }}</strong>
        <NTag v-if="!scene.isPublished" size="small" :bordered="false">Unpublished</NTag>
        <NTag v-else-if="activeSceneId === scene.id" size="small" :bordered="false">Current</NTag>
      </button>
    </div>
  </section>
</template>

<style scoped>
.section-heading,
.publication-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

h3 {
  margin: 0;
  font-size: 14px;
}

.section-heading {
  margin: 16px 0 8px;
}

a {
  color: inherit;
}

p {
  margin: 0;
}

.publication-row {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 6px;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 7px;
  color: inherit;
  background: rgb(255 255 255 / 3%);
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.publication-row:disabled {
  opacity: 0.55;
  cursor: default;
}

.publication-row[aria-selected='true'],
.publication-row:hover:not(:disabled) {
  background: rgb(255 255 255 / 8%);
}
</style>
