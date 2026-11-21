<script setup lang="ts">
import { onBeforeUnmount, ref, watchPostEffect } from 'vue'
import { NCard, NModal } from 'naive-ui'
import DialogCloseButton from './DialogCloseButton.vue'

defineProps<{
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

watchPostEffect(() => {
  if (sheet.value && !sheet.value.open) {
    sheet.value.showModal()
  }
})
onBeforeUnmount(() => sheet.value?.close())

function playSlide(element: Element, isEntering: boolean, finish: () => void) {
  if (!element.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finish()

    return
  }

  const startTransform = isEntering ? 'var(--sheet-offset)' : getComputedStyle(element).transform

  element
    .getAnimations()
    .find((animation) => animation.id === 'sheetSlide')
    ?.cancel()

  const slide = element.animate(
    [{ transform: startTransform }, { transform: isEntering ? 'none' : 'var(--sheet-offset)' }],
    {
      id: 'sheetSlide',
      duration: isEntering ? 220 : 180,
      easing: isEntering ? 'cubic-bezier(0.2, 0, 0, 1)' : 'cubic-bezier(0.4, 0, 1, 1)'
    }
  )

  void slide.finished.then(finish, finish)
}

function onSheetEnter(element: Element, finish: () => void) {
  playSlide(element, true, finish)
}

function onSheetLeave(element: Element, finish: () => void) {
  element.setAttribute('inert', '')
  playSlide(element, false, finish)
}

function onSheetClosed(element: Element) {
  const dialog = element as HTMLDialogElement

  dialog.close()

  if (!document.querySelector('dialog[open]') && document.activeElement === document.body) {
    document.querySelector<HTMLButtonElement>(`[data-toolbar="${dialog.dataset.focusTarget}"]`)?.focus()
  }
}
</script>

<template>
  <Transition
    v-if="isMobile"
    :css="false"
    appear
    @enter="onSheetEnter"
    @leave="onSheetLeave"
    @after-leave="onSheetClosed"
  >
    <dialog
      v-if="isVisible"
      ref="sheet"
      class="mobile-sheet panel-surface"
      :aria-label="title"
      :data-focus-target="focusTarget"
      data-editor-interactive
      @cancel.prevent="emit('update:isVisible', false)"
    >
      <header class="sheet-header">
        <h2 class="panel-title">{{ title }}</h2>
        <DialogCloseButton :label="closeLabel" @click="emit('update:isVisible', false)" />
      </header>
      <div class="sheet-body"><slot /></div>
    </dialog>
  </Transition>
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
  --sheet-offset: translateY(100%);

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
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.mobile-sheet[open] {
  display: flex;
  flex-direction: column;
}

.mobile-sheet::backdrop {
  pointer-events: auto;
  background: rgb(0 0 0 / 22%);
}

.sheet-header {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 env(safe-area-inset-right) 0 max(14px, env(safe-area-inset-left));
  border-bottom: 1px solid rgb(255 255 255 / 8%);
}

.sheet-header :deep(.dialog-close-button) {
  width: 44px;
  height: 44px;
  border: 11px solid transparent;
  background-clip: padding-box;
}

.sheet-body {
  min-height: 0;
  padding: 8px max(12px, env(safe-area-inset-right)) max(14px, env(safe-area-inset-bottom))
    max(12px, env(safe-area-inset-left));
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y pinch-zoom;
  scrollbar-color: rgb(184 184 184 / 42%) rgb(255 255 255 / 3.5%);
  scrollbar-width: thin;
}

@media (orientation: landscape) {
  .mobile-sheet {
    --sheet-offset: translateX(100%);

    inset: 0 0 0 auto;
    width: min(400px, 68vw);
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 10px 0 0 10px;
  }

  .sheet-header {
    padding-top: env(safe-area-inset-top);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .mobile-sheet[open]::backdrop {
    animation: dim-backdrop 220ms ease both;
  }

  .mobile-sheet[inert]::backdrop {
    animation: clear-backdrop 180ms ease both;
  }
}

@keyframes dim-backdrop {
  from {
    background-color: transparent;
  }
}

@keyframes clear-backdrop {
  to {
    background-color: transparent;
  }
}
</style>
