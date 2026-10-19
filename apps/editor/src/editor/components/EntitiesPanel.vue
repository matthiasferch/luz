<script setup lang="ts">
import { computed, h, ref, watch, type Component } from 'vue'
import {
  Box,
  Network,
  Bone,
  Cctv,
  Eye,
  EyeOff,
  LampDesk,
  Lightbulb,
  Route,
  Skull,
  Sun,
  TrianglesCenterlineDashedVertical,
  VectorPolygon
} from '@lucide/vue'
import { NButton, NDivider, NEmpty, NTree, type TreeOption } from 'naive-ui'
import type { LightType } from '@luz/formats'
import { useEditorStore } from '../editor-store'
import type { EditorComponent, EditorEntity, ModelContent } from '../editor-api'

const store = useEditorStore()
const lightIcons: Record<LightType, Component> = {
  directional: Sun,
  spot: LampDesk,
  point: Lightbulb
}
const componentIcons = new Map<string, Component>([
  ['model', VectorPolygon],
  ['body', Box],
  ['camera', Cctv],
  ['light', Lightbulb],
  ['reflector', TrianglesCenterlineDashedVertical],
  ['animation', Route],
  ['armature', Skull],
  ['bone', Bone],
  ['biped', Box]
])
const expandedKeys = ref<Array<string | number>>([])
const formatTypeLabel = (value: string) => value[0].toUpperCase() + value.slice(1)

const getChildren = (option: TreeOption) => (option.children?.length ? option.children : undefined)

const describeModelContent = (content: ModelContent, path: string[]): TreeOption => {
  const contentPath = [...path, content.type, content.name]

  return {
    key: `content:${JSON.stringify(contentPath)}`,
    label: content.name,
    content,
    children: content.children?.map((child) => describeModelContent(child, contentPath)),
    isLeaf: !content.children?.length
  }
}
const entityNodes = computed(() => {
  const describe = (entity: EditorEntity): TreeOption => ({
    key: `entity:${entity.key}`,
    label: entity.label,
    entityPath: entity.key,
    components: entity.components,
    children: [
      ...entity.components.map((component) => ({
        key: `component:${JSON.stringify([entity.key, component.name])}`,
        label:
          component.type === 'body' && component.collisionShape
            ? formatTypeLabel(component.collisionShape)
            : component.name,
        componentName: component.name,
        ownerPath: entity.key,
        component,
        detail:
          component.type !== 'body' && component.collisionShape ? formatTypeLabel(component.collisionShape) : undefined,
        children: component.contents?.map((content) => describeModelContent(content, [entity.key, component.name])),
        isLeaf: !component.contents?.length
      })),
      ...entity.children.map(describe)
    ]
  })

  return store.entities.value.map(describe)
})

watch(
  store.entities,
  (entities) => {
    expandedKeys.value = entities.filter((entity) => entity.children.length > 0).map((entity) => `entity:${entity.key}`)
  },
  { immediate: true }
)

const nodeProps = ({ option }: { option: TreeOption }) => ({
  'data-entity-path': option.entityPath as string | undefined,
  'data-component-name': option.componentName as string | undefined,
  'data-model-content-type': (option.content as ModelContent | undefined)?.type,
  'data-model-content-name': (option.content as ModelContent | undefined)?.name
})

const componentLight = (component: EditorComponent) =>
  component.lightKey === undefined ? undefined : store.lights.value.find((light) => light.key === component.lightKey)

const renderComponentIcon = (component: EditorComponent) => {
  const icon =
    component.type === 'light' && component.lightType
      ? lightIcons[component.lightType]
      : componentIcons.get(component.type)

  return icon
    ? h(
        'span',
        {
          key: component.name,
          class: 'component-icon',
          style: component.color ? { color: component.color } : undefined,
          role: 'img'
        },
        [h(icon, { size: 14, 'aria-hidden': 'true', focusable: 'false' })]
      )
    : null
}

const renderEntityLabel = ({ option }: { option: TreeOption }) => {
  const component = option.component as EditorComponent | undefined
  const components = option.components as EditorComponent[] | undefined
  const content = option.content as ModelContent | undefined
  const light = component && componentLight(component)
  const isVisible = light?.isEnabled ?? component?.isVisible ?? true
  const iconNode =
    component || content
      ? renderComponentIcon(component ?? content!)
      : h('span', { class: 'component-icon', role: 'img', 'aria-label': 'Entity' }, [
          h(Network, { size: 14, 'aria-hidden': 'true', focusable: 'false' })
        ])

  return h('span', { class: 'entity-row' }, [
    iconNode,
    h('span', { class: 'entity-name' }, String(option.label)),
    component?.isActiveCamera ? h('span', { class: 'component-tag active-camera' }, 'Active') : null,
    component?.motionMode
      ? h('span', { class: 'component-tag motion-mode' }, formatTypeLabel(component.motionMode))
      : null,
    components?.length
      ? h(
          'span',
          { class: 'entity-components entity-component-icons', role: 'group' },
          components.map(renderComponentIcon)
        )
      : null,
    content?.boneCount !== undefined
      ? h(
          'span',
          {
            class: 'entity-components entity-component-icons',
            role: 'img',
            'aria-label': `${content.boneCount} ${content.boneCount === 1 ? 'bone' : 'bones'}`
          },
          [h(Bone, { size: 14, 'aria-hidden': 'true', focusable: 'false' }), String(content.boneCount)]
        )
      : option.detail
        ? h('span', { class: 'entity-components' }, String(option.detail))
        : null,
    component && (component.type === 'model' || component.type === 'light')
      ? h(
          'button',
          {
            class: 'visibility-toggle',
            type: 'button',
            'aria-pressed': isVisible,
            onClick: (event: Event) => {
              event.stopPropagation()
              store.setComponentVisible(String(option.ownerPath), component.name, !isVisible)
            },

            onKeydown: (event: Event) => event.stopPropagation()
          },
          [h(isVisible ? Eye : EyeOff, { size: 14, 'aria-hidden': 'true', focusable: 'false' })]
        )
      : null
  ])
}
</script>

<template>
  <div class="entities-panel">
    <div class="entity-tree" data-editor-interactive>
      <NEmpty v-if="store.entities.value.length === 0" description="No entities in scene" size="small" />
      <NTree
        v-else
        v-model:expanded-keys="expandedKeys"
        :data="entityNodes"
        :get-children="getChildren"
        :node-props="nodeProps"
        :render-label="renderEntityLabel"
        :selectable="false"
        :indent="16"
        block-line
        expand-on-click
      />
    </div>
    <div class="entity-actions">
      <NDivider />
      <NButton class="reset-entities" block secondary size="small" @click="store.resetImportedEntities"
        >Reset to import</NButton
      >
    </div>
  </div>
</template>

<style scoped>
.entities-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.entity-tree {
  flex: 1;
  min-height: 0;
  overflow: auto;
  scrollbar-width: thin;
}

.entity-actions {
  flex: none;
}

.entity-actions :deep(.n-divider) {
  margin: 12px 0;
}

.entity-tree :deep(.entity-row) {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: var(--luz-checkbox-label-size);
}

.entity-tree :deep(.entity-name) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entity-tree :deep(.entity-components) {
  margin-left: auto;
  color: #9299a6;
  font-size: 12px;
  white-space: nowrap;
}

.entity-tree :deep(.entity-component-icons) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.entity-tree :deep(.component-icon) {
  display: inline-flex;
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  color: #9299a6;
}

.entity-tree :deep(.component-tag) {
  flex-shrink: 0;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgb(139 197 255 / 14%);
  color: #8bc5ff;
  font-size: 10px;
  line-height: 16px;
}

.entity-tree :deep(.visibility-toggle) {
  display: inline-flex;
  flex-shrink: 0;
  margin-left: auto;
  padding: 2px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: #9299a6;
  cursor: pointer;
}

.entity-tree :deep(.visibility-toggle:hover) {
  background: rgb(255 255 255 / 12%);
}

.entity-tree :deep(.visibility-toggle:focus-visible) {
  outline: 2px solid #8bc5ff;
  outline-offset: 2px;
}
</style>
