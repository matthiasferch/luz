import { Renderer } from './renderer'
import { RenderPass } from './pass'
import { RenderStage } from './render-stage'
import { RenderContext, RenderPassContext, VisibilitySet } from './contexts'
import { LightingTask } from './lighting-task'
import { RenderQueue } from './render-queue'
import { Entity, isModel } from '@luz/core'
import { RenderTarget } from './target'

export type RenderOptions = {
  // Per-stage render targets override; falls back to frame.target when missing
  targets?: Partial<Record<RenderStage, RenderTarget>>
  // Per-stage extra uniforms object merged into the pass uniforms
  uniforms?: Partial<Record<RenderStage, Record<string, unknown>>>
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
    const addEntitiesToQueue = (queue: RenderQueue, entities: Entity[]) => {
      for (const entity of entities) {
        for (const component of Object.values(entity.components)) {
          if (isModel(component)) {
            queue.items.push({ transform: entity, model: component })
          }
        }
      }
    }

    // Depth stage (optional): typically opaque only
    const depthPass = passes['Depth']
    if (depthPass) {
      const depthQueue = this.getQueue('Depth')
      if (depthQueue.items.length === 0) {
        addEntitiesToQueue(depthQueue, visibility.opaque)
      }
      depthQueue.sort()
      this.renderQueue(renderer, depthQueue, depthPass, {
        camera: context.camera,
        light: null,
        target: options?.targets?.['Depth'] ?? context.target,
        uniforms: options?.uniforms?.['Depth']
      })
    }

    // Ambient/base stage (optional): opaque first
    const ambientPass = passes['Ambient']
    if (ambientPass) {
      const ambientQueue = this.getQueue('Ambient')
      if (ambientQueue.items.length === 0) {
        addEntitiesToQueue(ambientQueue, visibility.opaque)
      }
      ambientQueue.sort()
      this.renderQueue(renderer, ambientQueue, ambientPass, {
        camera: context.camera,
        light: null,
        target: options?.targets?.['Ambient'] ?? context.target,
        uniforms: options?.uniforms?.['Ambient']
      })
    }

    // Per-light stages: Shadow (into current target) then Light accumulation
    const shadowPass = passes['Shadow']
    const lightPass = passes['Light']

    const lightQueue = lightPass ? this.getQueue('Light') : null
    let builtLightQueue = false

    for (const task of lighting) {
      if (shadowPass) {
        const shadowQueue = this.getQueue('Shadow')
        shadowQueue.items.length = 0
        addEntitiesToQueue(shadowQueue, task.entities)
        shadowQueue.sort()
        this.renderQueue(renderer, shadowQueue, shadowPass, {
          camera: task.light as any,
          light: null,
          target: options?.targets?.['Shadow'] ?? context.target,
          uniforms: options?.uniforms?.['Shadow']
        })
      }

      if (lightPass && lightQueue) {
        if (!builtLightQueue && lightQueue.items.length === 0) {
          addEntitiesToQueue(lightQueue, visibility.opaque)
          builtLightQueue = true
        }
        lightQueue.sort()
        this.renderQueue(renderer, lightQueue, lightPass, {
          camera: context.camera,
          light: task.light,
          target: options?.targets?.['Light'] ?? context.target,
          scissor: task.scissor,
          uniforms: options?.uniforms?.['Light']
        })
      }
    }

    // Transparent stage (optional)
    const transparentPass = passes['Transparent']
    if (transparentPass) {
      const transparentQueue = this.getQueue('Transparent')
      if (transparentQueue.items.length === 0) {
        addEntitiesToQueue(transparentQueue, visibility.transparent)
      }
      transparentQueue.sort()
      this.renderQueue(renderer, transparentQueue, transparentPass, {
        camera: context.camera,
        light: null,
        target: options?.targets?.['Transparent'] ?? context.target,
        uniforms: options?.uniforms?.['Transparent']
      })
    }

    // Overlay and Post are intentionally not auto-executed here because they
    // often require explicit full-screen geometry and custom uniforms.
  }

  // Utility to run a single stage queue with explicit context.
  renderQueue(renderer: Renderer, queue: RenderQueue, pass: RenderPass, context: RenderPassContext) {
    queue.render(renderer, pass, context)
  }
}
