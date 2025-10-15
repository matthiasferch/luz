import { Renderer } from './renderer'
import { RenderPass } from './pass'
import { RenderStage } from './render-stage'
import { FrameContext, PassContext, VisibilitySet } from './contexts'
import { LightingTask } from './lighting-task'
import { RenderQueue } from './render-queue'
import { Entity, isModel, Model } from '@luz/core'

// High-level orchestration of render stages. For Step 1, this is a thin
// container around stage queues; integration and behavior changes come later.
export class RenderGraph {
  private queues: Map<RenderStage, RenderQueue>

  constructor() {
    this.queues = new Map()
  }

  getQueue(stage: RenderStage): RenderQueue {
    let q = this.queues.get(stage)
    if (!q) {
      q = new RenderQueue()
      this.queues.set(stage, q)
    }
    return q
  }

  clear() {
    for (const q of this.queues.values()) q.clear()
  }

  // Execute the graph. For Step 1 scaffolding this method is intentionally
  // conservative and does not alter current behavior by itself; callers can
  // delegate to existing Renderer.renderPass or use queues explicitly.
  execute(
    renderer: Renderer,
    passes: Partial<Record<RenderStage, RenderPass>>,
    frame: FrameContext,
    visibility: VisibilitySet,
    lighting: LightingTask[]
  ) {
    const addEntitiesToQueue = (queue: RenderQueue, entities: Entity[]) => {
      for (const entity of entities) {
        for (const component of Object.values(entity.components)) {
          if (isModel(component)) {
            queue.add({ transform: entity, model: component as Model })
          }
        }
      }
    }

    // Depth stage (optional): typically opaque only
    const depthPass = passes[RenderStage.Depth]
    if (depthPass) {
      const depthQueue = this.getQueue(RenderStage.Depth)
      if (depthQueue.size() === 0) {
        addEntitiesToQueue(depthQueue, visibility.opaque)
      }
      depthQueue.sort()
      this.runStage(renderer, RenderStage.Depth, depthPass, {
        camera: frame.camera,
        light: null,
        target: frame.target
      })
    }

    // Ambient/base stage (optional): opaque first
    const ambientPass = passes[RenderStage.Ambient]
    if (ambientPass) {
      const ambientQueue = this.getQueue(RenderStage.Ambient)
      if (ambientQueue.size() === 0) {
        addEntitiesToQueue(ambientQueue, visibility.opaque)
      }
      ambientQueue.sort()
      this.runStage(renderer, RenderStage.Ambient, ambientPass, {
        camera: frame.camera,
        light: null,
        target: frame.target
      })
    }

    // Per-light stages: Shadow (into current target) then Light accumulation
    const shadowPass = passes[RenderStage.Shadow]
    const lightPass = passes[RenderStage.Light]
    const lightQueue = lightPass ? this.getQueue(RenderStage.Light) : null
    let builtLightQueue = false

    for (const task of lighting) {
      if (shadowPass) {
        const shadowQueue = this.getQueue(RenderStage.Shadow)
        shadowQueue.clear()
        addEntitiesToQueue(shadowQueue, task.entities)
        shadowQueue.sort()
        this.runStage(renderer, RenderStage.Shadow, shadowPass, {
          camera: task.light as any,
          light: null,
          target: frame.target
        })
      }

      if (lightPass && lightQueue) {
        if (!builtLightQueue && lightQueue.size() === 0) {
          addEntitiesToQueue(lightQueue, visibility.opaque)
          builtLightQueue = true
        }
        lightQueue.sort()
        this.runStage(renderer, RenderStage.Light, lightPass, {
          camera: frame.camera,
          light: task.light,
          target: frame.target,
          scissor: task.scissor
        })
      }
    }

    // Transparent stage (optional)
    const transparentPass = passes[RenderStage.Transparent]
    if (transparentPass) {
      const transparentQueue = this.getQueue(RenderStage.Transparent)
      if (transparentQueue.size() === 0) {
        addEntitiesToQueue(transparentQueue, visibility.transparent)
      }
      transparentQueue.sort()
      this.runStage(renderer, RenderStage.Transparent, transparentPass, {
        camera: frame.camera,
        light: null,
        target: frame.target
      })
    }

    // Overlay and Post are intentionally not auto-executed here because they
    // often require explicit full-screen geometry and custom uniforms.
  }

  // Utility to run a single stage queue with explicit context.
  runStage(renderer: Renderer, stage: RenderStage, pass: RenderPass, ctx: PassContext) {
    const q = this.getQueue(stage)
    q.sort()
    q.execute(renderer, pass, ctx)
  }
}
