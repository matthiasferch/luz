<script setup lang="ts">
import { NCollapse, NCollapseItem } from 'naive-ui'
import { useEditorStore } from '../editor-store'

const store = useEditorStore()
const display = (value: number | null) => (value === null ? '—' : String(value))

const sentenceCase = (value: string) => {
  const words = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()

  return words.charAt(0).toUpperCase() + words.slice(1)
}
</script>

<template>
  <NCollapse :default-expanded-names="['rendering']" arrow-placement="right">
    <NCollapseItem title="Collisions" name="collisions">
      <div class="metric">
        <span>Bodies</span><output>{{ display(store.telemetry.value.collisions.bodyCount) }}</output>
      </div>
      <div class="metric">
        <span>Colliders</span><output>{{ display(store.telemetry.value.collisions.colliderCount) }}</output>
      </div>
      <div class="metric">
        <span>Body-body candidates</span
        ><output>{{ display(store.telemetry.value.collisions.candidateBodyPairCount) }}</output>
      </div>
      <div class="metric">
        <span>Body-collider candidates</span
        ><output>{{ display(store.telemetry.value.collisions.candidateBodyColliderPairCount) }}</output>
      </div>
      <div class="metric">
        <span>Collision manifolds</span><output>{{ display(store.telemetry.value.collisions.manifoldCount) }}</output>
      </div>
    </NCollapseItem>
    <NCollapseItem title="Culling" name="culling">
      <div class="metric">
        <span>Visible bodies</span><output>{{ display(store.telemetry.value.culling.visibleBodyCount) }}</output>
      </div>
      <div class="metric">
        <span>Culled bodies</span><output>{{ display(store.telemetry.value.culling.culledBodyCount) }}</output>
      </div>
      <div class="metric">
        <span>Visible lights</span><output>{{ display(store.telemetry.value.culling.visibleLightCount) }}</output>
      </div>
      <div class="metric">
        <span>Culled lights</span><output>{{ display(store.telemetry.value.culling.culledLightCount) }}</output>
      </div>
    </NCollapseItem>
    <NCollapseItem title="Rendering" name="rendering">
      <div class="metric">
        <span>Primitives</span
        ><output title="Rendered / submitted"
          >{{ store.telemetry.value.renderer.primitives.renderedCount }} /
          {{ store.telemetry.value.renderer.primitives.submittedCount }}</output
        >
      </div>
      <div class="metric">
        <span>Reflections</span
        ><output title="Rendered / total"
          >{{ store.telemetry.value.renderer.planarReflections.renderedCount }} /
          {{ store.telemetry.value.renderer.planarReflections.totalCount }}</output
        >
      </div>
      <div
        v-for="key in ['cullChanges', 'blendChanges', 'depthChanges', 'colorMaskChanges', 'depthMaskChanges'] as const"
        :key="key"
        class="metric"
      >
        <span>{{ sentenceCase(key) }}</span
        ><output>{{ store.telemetry.value.renderer[key] }}</output>
      </div>
    </NCollapseItem>
  </NCollapse>
</template>

<style scoped>
.metric {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  min-height: 25px;
  color: rgb(255 255 255 / 66%);
  font-size: 11px;
}

.metric output {
  color: rgb(255 255 255 / 92%);
  font-family: Outfit, sans-serif;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
</style>
