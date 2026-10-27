<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { NButton } from 'naive-ui'
import type { PanelId, PanelState } from '../panel-layout'
import DialogCloseButton from './DialogCloseButton.vue'

const VERTICAL_EDGE_MARGIN = 8

const props = defineProps<{ id: PanelId; title: string; panel: PanelState }>()
const emit = defineEmits<{
  move: [id: PanelId, x: number, y: number, renderedHeight: number]
  resize: [id: PanelId, width: number, height: number, resizeHeight: boolean]
  focus: [id: PanelId]
  fit: [id: PanelId]
  collapse: [id: PanelId]
  close: [id: PanelId]
}>()

interface PanelDrag {
  pointerId: number
  captureTarget: HTMLElement
  startX: number
  startY: number
  panelX: number
  panelY: number
  renderedHeight: number
}

type ResizeDirection = 'right' | 'bottom' | 'corner'

interface PanelResize {
  pointerId: number
  captureTarget: HTMLElement
  direction: ResizeDirection
  startX: number
  startY: number
  width: number
  height: number
}

let panelDrag: PanelDrag | undefined
let panelResize: PanelResize | undefined

const style = computed(() => ({
  left: `${props.panel.x}px`,
  top: `${props.panel.y}px`,
  width: `${props.panel.width}px`,
  height: props.panel.isCollapsed ? '42px' : props.panel.hasAutomaticHeight ? 'auto' : `${props.panel.height}px`,
  maxHeight: props.panel.isCollapsed
    ? '42px'
    : props.panel.hasAutomaticHeight
      ? `calc(100vh - ${props.panel.y + VERTICAL_EDGE_MARGIN}px)`
      : undefined,
  zIndex: props.panel.z
}))

const onDragStart = (event: PointerEvent) => {
  if (
    event.button !== 0 ||
    !event.isPrimary ||
    panelDrag ||
    panelResize ||
    (event.target as HTMLElement).closest('button')
  ) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  const captureTarget = event.currentTarget as HTMLElement
  const panel = captureTarget.closest<HTMLElement>('.floating-panel')

  panelDrag = {
    pointerId: event.pointerId,
    captureTarget,
    startX: event.clientX,
    startY: event.clientY,
    panelX: props.panel.x,
    panelY: props.panel.y,
    renderedHeight: panel?.getBoundingClientRect().height ?? props.panel.height
  }

  captureTarget.setPointerCapture(event.pointerId)
  emit('focus', props.id)
}

const onDragMove = (event: PointerEvent) => {
  if (!panelDrag || panelDrag.pointerId !== event.pointerId) {
    return
  }

  emit(
    'move',
    props.id,
    panelDrag.panelX + event.clientX - panelDrag.startX,
    panelDrag.panelY + event.clientY - panelDrag.startY,
    panelDrag.renderedHeight
  )
}

const releasePointer = (captureTarget: HTMLElement, pointerId: number) => {
  if (captureTarget.hasPointerCapture(pointerId)) {
    captureTarget.releasePointerCapture(pointerId)
  }
}

const onDragEnd = (event: PointerEvent) => {
  if (panelDrag?.pointerId === event.pointerId) {
    const { captureTarget, pointerId } = panelDrag

    panelDrag = undefined

    releasePointer(captureTarget, pointerId)
  }
}

const onResizeStart = (event: PointerEvent, direction: ResizeDirection) => {
  if (event.button !== 0 || !event.isPrimary || panelDrag || panelResize) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  const captureTarget = event.currentTarget as HTMLElement
  const panel = captureTarget.closest<HTMLElement>('.floating-panel')
  const rectangle = panel?.getBoundingClientRect()

  panelResize = {
    pointerId: event.pointerId,
    captureTarget,
    direction,
    startX: event.clientX,
    startY: event.clientY,
    width: rectangle?.width ?? props.panel.width,
    height: rectangle?.height ?? props.panel.height
  }

  captureTarget.setPointerCapture(event.pointerId)
  emit('focus', props.id)
}

const onResizeMove = (event: PointerEvent) => {
  if (!panelResize || panelResize.pointerId !== event.pointerId) {
    return
  }

  const isHorizontal = panelResize.direction === 'right' || panelResize.direction === 'corner'
  const isVertical = panelResize.direction === 'bottom' || panelResize.direction === 'corner'

  emit(
    'resize',
    props.id,
    panelResize.width + (isHorizontal ? event.clientX - panelResize.startX : 0),
    panelResize.height + (isVertical ? event.clientY - panelResize.startY : 0),
    isVertical
  )
}

const onResizeEnd = (event: PointerEvent) => {
  if (panelResize?.pointerId === event.pointerId) {
    const { captureTarget, pointerId } = panelResize

    panelResize = undefined

    releasePointer(captureTarget, pointerId)
  }
}

const onSectionToggle = (event: MouseEvent) => {
  if (!(event.target instanceof Element) || !event.target.closest('.n-collapse-item__header')) {
    return
  }

  emit('fit', props.id)
}

onBeforeUnmount(() => {
  if (panelDrag) {
    releasePointer(panelDrag.captureTarget, panelDrag.pointerId)
  }

  if (panelResize) {
    releasePointer(panelResize.captureTarget, panelResize.pointerId)
  }
})
</script>

<template>
  <section
    class="floating-panel"
    :class="{ collapsed: panel.isCollapsed, 'auto-height': panel.hasAutomaticHeight }"
    :style="style"
    :aria-label="title"
    data-editor-interactive
    @pointerdown="emit('focus', id)"
    @click="onSectionToggle"
  >
    <header
      class="panel-header"
      @pointerdown="onDragStart"
      @pointermove="onDragMove"
      @pointerup="onDragEnd"
      @pointercancel="onDragEnd"
      @lostpointercapture="onDragEnd"
    >
      <span class="panel-title">{{ title }}</span>
      <div class="panel-actions">
        <NButton
          quaternary
          circle
          size="tiny"
          :aria-label="panel.isCollapsed ? `Expand ${title}` : `Collapse ${title}`"
          @click="emit('collapse', id)"
        >
          {{ panel.isCollapsed ? '+' : '−' }}
        </NButton>
        <DialogCloseButton :label="`Hide ${title}`" @click="emit('close', id)" />
      </div>
    </header>
    <div v-show="!panel.isCollapsed" class="panel-body">
      <div v-if="$slots.fixed" class="panel-fixed">
        <slot name="fixed" />
      </div>
      <div class="panel-content">
        <slot />
      </div>
    </div>
    <template v-if="!panel.isCollapsed">
      <div
        class="panel-resize-handle right"
        aria-hidden="true"
        @pointerdown="onResizeStart($event, 'right')"
        @pointermove="onResizeMove"
        @pointerup="onResizeEnd"
        @pointercancel="onResizeEnd"
        @lostpointercapture="onResizeEnd"
      />
      <div
        class="panel-resize-handle bottom"
        aria-hidden="true"
        @pointerdown="onResizeStart($event, 'bottom')"
        @pointermove="onResizeMove"
        @pointerup="onResizeEnd"
        @pointercancel="onResizeEnd"
        @lostpointercapture="onResizeEnd"
      />
      <div
        class="panel-resize-handle corner"
        aria-hidden="true"
        @pointerdown="onResizeStart($event, 'corner')"
        @pointermove="onResizeMove"
        @pointerup="onResizeEnd"
        @pointercancel="onResizeEnd"
        @lostpointercapture="onResizeEnd"
      />
    </template>
  </section>
</template>

<style scoped>
.floating-panel {
  position: fixed;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-width: min(280px, calc(100vw - 20px));
  min-height: min(160px, calc(100vh - 66px));
  overflow: hidden;
  pointer-events: auto;
  background: rgb(18 20 25 / 92%);
  border: 1px solid rgb(255 255 255 / 11%);
  border-radius: 10px;
  box-shadow: 0 16px 48px rgb(0 0 0 / 38%);
  backdrop-filter: blur(18px);
}

.floating-panel.collapsed {
  min-height: 42px;
}

.floating-panel.auto-height:not(.collapsed) {
  min-height: 0;
}

.panel-header {
  flex: 0 0 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px 0 14px;
  cursor: move;
  touch-action: none;
  user-select: none;
  border-bottom: 1px solid rgb(255 255 255 / 8%);
}

.collapsed .panel-header {
  border-bottom-color: transparent;
}

.panel-title {
  flex: 1;
  color: #f4f6fb;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.panel-actions {
  display: flex;
  gap: 2px;
}

.panel-body {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.panel-fixed {
  flex: none;
  padding: 10px 12px;
}

.panel-content {
  flex: 1;
  min-height: 0;
  overflow: hidden auto;
  overscroll-behavior: contain;
  padding: 8px 12px 14px;
  scrollbar-color: rgb(184 184 184 / 42%) rgb(255 255 255 / 3.5%);
  scrollbar-width: thin;
}

.auto-height .panel-body,
.auto-height .panel-content {
  flex: 0 1 auto;
}

.panel-content::-webkit-scrollbar {
  width: 8px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgb(255 255 255 / 3.5%);
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgb(184 184 184 / 42%);
  border: 2px solid rgb(18 20 25 / 92%);
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: rgb(184 184 184 / 68%);
}

.panel-resize-handle {
  position: absolute;
  z-index: 2;
  touch-action: none;
}

.panel-resize-handle.right {
  top: 42px;
  right: 0;
  bottom: 8px;
  width: 6px;
  cursor: ew-resize;
}

.panel-resize-handle.bottom {
  right: 8px;
  bottom: 0;
  left: 0;
  height: 6px;
  cursor: ns-resize;
}

.panel-resize-handle.corner {
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  cursor: nwse-resize;
}

@media (pointer: coarse) {
  .panel-resize-handle.right {
    width: 16px;
  }

  .panel-resize-handle.bottom {
    height: 16px;
  }

  .panel-resize-handle.corner {
    width: 24px;
    height: 24px;
  }
}
</style>
