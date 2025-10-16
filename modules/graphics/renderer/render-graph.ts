import { Renderer } from './renderer'
import { RenderPass } from './pass'
import { RenderContext, RenderPassContext, VisibilitySet } from './contexts'
import { LightingTask } from './lighting-task'
import { RenderQueue } from './render-queue'
import { RenderItem } from './render-item'
import { Entity } from '@luz/core'
import { RenderTarget } from './target'

export type RenderStage = 'Depth' | 'Ambient' | 'Shadowing' | 'Lighting' | 'Transparent' | 'Compositing'

type RenderOptions = {
  // Per-stage render targets override; falls back to frame.target when missing
  overrideTargets?: Partial<Record<RenderStage, RenderTarget>>
  // Per-stage extra uniforms object merged into the pass uniforms
  additionalUniforms?: Partial<Record<RenderStage, Record<string, unknown>>>
  // Per-stage temporary pass-state overrides (e.g., cull mode for reflections)
  overrideStates?: Partial<
    Record<
      RenderStage,
      Partial<Pick<RenderPass, 'cullMode' | 'blendMode' | 'depthTest' | 'colorMask' | 'depthMask' | 'clearColor' | 'clearDepth' | 'clearStencil'>>
    >
  >
}

// High-level orchestration of render stages. For Step 1, this is a thin
// container around stage queues; integration and behavior changes come later.
export class RenderGraph {
  private queues: Map<RenderStage, RenderQueue>

  constructor() {
    this.queues = new Map()
  }

  getQueue(stage: RenderStage): RenderQueue {
    let queue = this.queues.get(stage)

    if (!queue) {
      queue = new RenderQueue()
      this.queues.set(stage, queue)
    }

    return queue
  }

  clear() {
    for (const queue of this.queues.values()) {
      queue.items.length = 0
    }
  }

  // Execute the graph. For Step 1 scaffolding this method is intentionally
  // conservative and does not alter current behavior by itself; callers can
  // delegate to existing Renderer.renderPass or use queues explicitly.
  render(
    renderer: Renderer,
    passes: Partial<Record<RenderStage, RenderPass>>,
    context: RenderContext,
    visibility: VisibilitySet,
    lighting: LightingTask[],
    options?: RenderOptions
  ) {
    const addItemsToQueue = (queue: RenderQueue, items: RenderItem[]) => {
      for (const item of items) queue.items.push(item)
    }

    const addEntitiesToQueue = (queue: RenderQueue, entities: Entity[]) => {
      for (const entity of entities) {
        for (const component of Object.values(entity.components)) {
          if ((component as any)?.type === 'Model') {
            queue.items.push({ transform: entity, model: component as any })
          }
        }
      }
    }

    // Depth stage (optional): typically opaque only
    const depthPass = passes['Depth']
    if (depthPass) {
      const depthQueue = this.getQueue('Depth')
      if (depthQueue.items.length === 0) {
        addItemsToQueue(depthQueue, visibility.opaque)
      }
      depthQueue.sort()
      const depthPatched = options?.overrideStates?.['Depth'] ? ({ ...depthPass, ...options.overrideStates['Depth'] } as RenderPass) : depthPass
      this.renderQueue(renderer, depthQueue, depthPatched, {
        camera: context.camera,
        light: null,
        target: options?.overrideTargets?.['Depth'] ?? context.target,
        uniforms: options?.additionalUniforms?.['Depth']
      })
    }

    // Ambient/base stage (optional): opaque first
    const ambientPass = passes['Ambient']
    if (ambientPass) {
      const ambientQueue = this.getQueue('Ambient')
      if (ambientQueue.items.length === 0) {
        addItemsToQueue(ambientQueue, visibility.opaque)
      }
      ambientQueue.sort()
      const ambientPatched = options?.overrideStates?.['Ambient'] ? ({ ...ambientPass, ...options.overrideStates['Ambient'] } as RenderPass) : ambientPass
      this.renderQueue(renderer, ambientQueue, ambientPatched, {
        camera: context.camera,
        light: null,
        target: options?.overrideTargets?.['Ambient'] ?? context.target,
        uniforms: options?.additionalUniforms?.['Ambient']
      })
    }

    // Per-light stages: Shadow (into current target) then Light accumulation
    
    const lightPass = passes['Lighting']
    const shadowPass = passes['Shadowing']

    const lightQueue = lightPass ? this.getQueue('Lighting') : null
    let builtLightQueue = false
    const transparentPass = passes['Transparent']
    const transparentQueue = transparentPass ? this.getQueue('Transparent') : null
    let builtTransparentQueue = false

    for (const task of lighting) {
      if (shadowPass) {
        const shadowQueue = this.getQueue('Shadowing')
        shadowQueue.items.length = 0
        addEntitiesToQueue(shadowQueue, task.entities)
        shadowQueue.sort()
        const shadowPatched = options?.overrideStates?.['Shadowing'] ? ({ ...shadowPass, ...options.overrideStates['Shadowing'] } as RenderPass) : shadowPass
        this.renderQueue(renderer, shadowQueue, shadowPatched, {
          camera: task.light,
          light: null,
          target: options?.overrideTargets?.['Shadowing'] ?? context.target,
          uniforms: options?.additionalUniforms?.['Shadowing']
        })
      }

      if (lightPass && lightQueue) {
        if (!builtLightQueue && lightQueue.items.length === 0) {
          addItemsToQueue(lightQueue, visibility.opaque)
          builtLightQueue = true
        }
        lightQueue.sort()
        const lightPatched = options?.overrideStates?.['Lighting'] ? ({ ...lightPass, ...options.overrideStates['Lighting'] } as RenderPass) : lightPass
        this.renderQueue(renderer, lightQueue, lightPatched, {
          camera: context.camera,
          light: task.light,
          target: options?.overrideTargets?.['Lighting'] ?? context.target,
          scissor: task.scissor,
          uniforms: options?.additionalUniforms?.['Lighting']
        })
      }

      // Per-light transparent stage (optional)
      if (transparentPass && transparentQueue) {
        if (!builtTransparentQueue && transparentQueue.items.length === 0) {
          for (const item of visibility.transparent) transparentQueue.items.push(item)
          builtTransparentQueue = true
        }
        // Sort back-to-front for correct blending
        transparentQueue.sort((a, b) => (b.depth ?? 0) - (a.depth ?? 0))
        const transparentPatched = options?.overrideStates?.['Transparent'] ? ({ ...transparentPass, ...options.overrideStates['Transparent'] } as RenderPass) : transparentPass
        this.renderQueue(renderer, transparentQueue, transparentPatched, {
          camera: context.camera,
          light: task.light,
          target: options?.overrideTargets?.['Transparent'] ?? context.target,
          uniforms: options?.additionalUniforms?.['Transparent'] ?? options?.additionalUniforms?.['Lighting']
        })
      }
    }

    // Transparent handled per-light above

    // Overlay and Post are intentionally not auto-executed here because they
    // often require explicit full-screen geometry and custom uniforms.
  }

  // Utility to run a single stage queue with explicit context.
  renderQueue(renderer: Renderer, queue: RenderQueue, pass: RenderPass, context: RenderPassContext) {
    queue.render(renderer, pass, context)
  }
}
