<script setup lang="ts">
import { computed } from 'vue'
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

let drag:
  | { pointerId: number; startX: number; startY: number; panelX: number; panelY: number; renderedHeight: number }
  | undefined

type ResizeDirection = 'right' | 'bottom' | 'corner'

let resizing:
  | {
      pointerId: number
      direction: ResizeDirection
      startX: number
      startY: number
      width: number
      height: number
    }
  | undefined

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

const startDrag = (event: PointerEvent) => {
  if (event.button !== 0 || (event.target as HTMLElement).closest('button')) {
    return
  }

  const panel = (event.currentTarget as HTMLElement).closest<HTMLElement>('.floating-panel')

  drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    panelX: props.panel.x,
    panelY: props.panel.y,
    renderedHeight: panel?.getBoundingClientRect().height ?? props.panel.height
  }

  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  emit('focus', props.id)
}

const dragPanel = (event: PointerEvent) => {
  if (!drag || drag.pointerId !== event.pointerId) {
    return
  }

  emit(
    'move',
    props.id,
    drag.panelX + event.clientX - drag.startX,
    drag.panelY + event.clientY - drag.startY,
    drag.renderedHeight
  )
}

const endDrag = (event: PointerEvent) => {
  if (drag?.pointerId === event.pointerId) {
    drag = undefined
  }
}

const startResize = (event: PointerEvent, direction: ResizeDirection) => {
  if (event.button !== 0) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  const panel = (event.currentTarget as HTMLElement).closest<HTMLElement>('.floating-panel')
  const rectangle = panel?.getBoundingClientRect()

  resizing = {
    pointerId: event.pointerId,
    direction,
    startX: event.clientX,
    startY: event.clientY,
    width: rectangle?.width ?? props.panel.width,
    height: rectangle?.height ?? props.panel.height
  }

  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  emit('focus', props.id)
}

const resizePanel = (event: PointerEvent) => {
  if (!resizing || resizing.pointerId !== event.pointerId) {
    return
  }

  const isHorizontal = resizing.direction === 'right' || resizing.direction === 'corner'
  const isVertical = resizing.direction === 'bottom' || resizing.direction === 'corner'

  emit(
    'resize',
    props.id,
    resizing.width + (isHorizontal ? event.clientX - resizing.startX : 0),
    resizing.height + (isVertical ? event.clientY - resizing.startY : 0),
    isVertical
  )
}

const endResize = (event: PointerEvent) => {
  if (resizing?.pointerId === event.pointerId) {
    resizing = undefined
  }
}

const fitAfterSectionToggle = (event: MouseEvent) => {
  if (!(event.target instanceof Element) || !event.target.closest('.n-collapse-item__header')) {
    return
  }

  emit('fit', props.id)
}
</script>

<template>
  <section
    class="floating-panel"
    :class="{ collapsed: panel.isCollapsed, 'auto-height': panel.hasAutomaticHeight }"
    :style="style"
    :aria-label="title"
    data-editor-interactive
    @pointerdown="emit('focus', id)"
    @click="fitAfterSectionToggle"
  >
    <header
      class="panel-header"
      @pointerdown="startDrag"
      @pointermove="dragPanel"
      @pointerup="endDrag"
      @pointercancel="endDrag"
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
        @pointerdown="startResize($event, 'right')"
        @pointermove="resizePanel"
        @pointerup="endResize"
        @pointercancel="endResize"
      />
      <div
        class="panel-resize-handle bottom"
        aria-hidden="true"
        @pointerdown="startResize($event, 'bottom')"
        @pointermove="resizePanel"
        @pointerup="endResize"
        @pointercancel="endResize"
      />
      <div
        class="panel-resize-handle corner"
        aria-hidden="true"
        @pointerdown="startResize($event, 'corner')"
        @pointermove="resizePanel"
        @pointerup="endResize"
        @pointercancel="endResize"
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
</style>
