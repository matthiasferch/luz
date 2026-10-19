<script setup lang="ts">
import { NButton } from 'naive-ui'

defineProps<{ label: string }>()

const emit = defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <NButton class="dialog-close-button" quaternary circle size="tiny" :aria-label="label" @click="emit('click', $event)"
    >×</NButton
  >
</template>
