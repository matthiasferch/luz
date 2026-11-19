<script setup lang="ts">
import { onBeforeUnmount, ref, watchPostEffect } from 'vue'
import { NCard, NModal } from 'naive-ui'
import DialogCloseButton from './DialogCloseButton.vue'

const props = defineProps<{
  isMobile: boolean
  isVisible: boolean
  title: string
  closeLabel: string
  cardClass?: string
  focusTarget: 'scenes' | 'view'
  isMaskClosable?: boolean
}>()
const emit = defineEmits<{ 'update:isVisible': [isVisible: boolean] }>()
const sheet = ref<HTMLDialogElement>()

let trigger: 'scenes' | 'view' = 'scenes'

watchPostEffect(() => {
  const element = sheet.value

  if (!element) {
    return
  }

  if (props.isVisible && !element.open) {
    trigger = props.focusTarget

    element.showModal()
  } else if (!props.isVisible && element.open) {
    element.close()

    if (!document.querySelector('dialog[open]') && document.activeElement === document.body) {
      document.querySelector<HTMLButtonElement>(`[data-toolbar="${trigger}"]`)?.focus()
    }
  }
})
onBeforeUnmount(() => sheet.value?.close())
</script>

<template>
  <dialog
    v-if="isMobile"
    ref="sheet"
    class="mobile-sheet"
    :aria-label="title"
    data-editor-interactive
    @cancel.prevent="emit('update:isVisible', false)"
  >
    <template v-if="isVisible">
      <header class="sheet-header">
        <h2>{{ title }}</h2>
        <DialogCloseButton :label="closeLabel" @click="emit('update:isVisible', false)" />
      </header>
      <div class="sheet-body"><slot /></div>
    </template>
  </dialog>
  <NModal v-else :show="isVisible" :mask-closable="isMaskClosable" @update:show="emit('update:isVisible', $event)">
    <NCard
      :class="cardClass"
      :title="title"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      data-editor-interactive
    >
      <template #header-extra
        ><DialogCloseButton :label="closeLabel" @click="emit('update:isVisible', false)"
      /></template>
      <slot />
    </NCard>
  </NModal>
</template>

<style scoped>
.mobile-sheet {
  position: fixed;
  inset: auto 0 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  max-height: calc(100dvh - max(18px, env(safe-area-inset-top)));
  margin: 0;
  padding: 0;
  overflow: hidden;
  pointer-events: auto;
  color: #f0f0ed;
  color-scheme: dark;
  font-family: Outfit, system-ui, sans-serif;
  background: rgb(18 20 25 / 99%);
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 8px 32px rgb(0 0 0 / 32%);
}

.mobile-sheet[open] {
  display: flex;
  flex-direction: column;
}

.mobile-sheet::backdrop {
  pointer-events: auto;
  background: rgb(0 0 0 / 48%);
}

.sheet-header {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px max(12px, env(safe-area-inset-right)) 6px max(18px, env(safe-area-inset-left));
  border-bottom: 1px solid rgb(255 255 255 / 10%);
}

.sheet-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.sheet-header :deep(.dialog-close-button) {
  width: 44px;
  height: 44px;
  font-size: 22px;
}

.sheet-body {
  min-height: 0;
  padding: 8px max(16px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom))
    max(16px, env(safe-area-inset-left));
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y pinch-zoom;
}

@media (orientation: landscape) {
  .mobile-sheet {
    inset: 0 0 0 auto;
    width: min(400px, 68vw);
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 14px 0 0 14px;
  }

  .sheet-header {
    padding-top: max(6px, env(safe-area-inset-top));
  }
}
</style>
