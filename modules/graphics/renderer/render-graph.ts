import { Renderer } from './renderer'
import { RenderPass } from './pass'
import { RenderContext, RenderPassContext, VisibilitySet } from './contexts'
import { LightingTask } from './lighting-task'
import { RenderQueue } from './render-queue'
import { RenderItem } from './render-item'
import { Entity } from '@luz/core'
import { RenderTarget } from './target'
import type { PipelineDescriptor } from './pipeline'

export type RenderStage = 'Depth' | 'Ambient' | 'Shadowing' | 'Lighting' | 'Transparent' | 'Overlay' | 'Composite'

type RenderOptions = {
  // Per-stage render targets override; falls back to frame.target when missing
  overrideTargets?: Partial<Record<RenderStage, RenderTarget>>
  // Per-stage extra uniforms object merged into the pass uniforms
  additionalUniforms?: Partial<Record<RenderStage, Record<string, unknown>>>
  // Per-stage temporary pass-state overrides (e.g., cull mode for reflections)
  overrideStates?: Partial<Record<
    RenderStage,
    Partial<Pick<PipelineDescriptor, 'cullMode' | 'blendMode' | 'depthTest' | 'depthMask' | 'colorMask'>>
  >>
  // Optional overlay stage callback executed after transparent, if pass provided
  overlayCallback?: (renderer: Renderer, pass: RenderPass, frame: RenderContext) => void
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
      // Front-to-back to maximize early-Z
      depthQueue.sortOpaque()
      const _t0D = performance.now()
      this.renderQueue(renderer, depthQueue, depthPass, {
        camera: context.camera,
        light: null,
        target: options?.overrideTargets?.['Depth'] ?? context.target,
        uniforms: options?.additionalUniforms?.['Depth']
      }, options?.overrideStates?.['Depth'])
      renderer.stats.addStageTime('Depth', performance.now() - _t0D)
    }

    // Ambient/base stage (optional): opaque first
    const ambientPass = passes['Ambient']
    if (ambientPass) {
      const ambientQueue = this.getQueue('Ambient')
      if (ambientQueue.items.length === 0) {
        addItemsToQueue(ambientQueue, visibility.opaque)
      }
      // Front-to-back for opaque ambient/base
      ambientQueue.sortOpaque()
      const _t0A = performance.now()
      this.renderQueue(renderer, ambientQueue, ambientPass, {
        camera: context.camera,
        light: null,
        target: options?.overrideTargets?.['Ambient'] ?? context.target,
        uniforms: options?.additionalUniforms?.['Ambient']
      }, options?.overrideStates?.['Ambient'])
      renderer.stats.addStageTime('Ambient', performance.now() - _t0A)
    }

    // Per-light stages: Shadow (into current target) then Light accumulation
    
    const lightPass = passes['Lighting']
    const shadowPass = passes['Shadowing']

    const lightQueue = lightPass ? this.getQueue('Lighting') : null
    let builtLightQueue = false
    const transparentPass = passes['Transparent']
    const transparentQueue = transparentPass ? this.getQueue('Transparent') : null
    let groupedTransparentBuilt = false
    let transparentAlphaItems: RenderItem[] = []
    let transparentAdditiveItems: RenderItem[] = []

    for (const task of lighting) {
      if (shadowPass) {
        const shadowQueue = this.getQueue('Shadowing')
        shadowQueue.items.length = 0
        addEntitiesToQueue(shadowQueue, task.entities)
        shadowQueue.sort()
        const _t0S = performance.now()
        this.renderQueue(renderer, shadowQueue, shadowPass, {
          camera: task.light,
          light: null,
          target: options?.overrideTargets?.['Shadowing'] ?? context.target,
          uniforms: options?.additionalUniforms?.['Shadowing']
        }, options?.overrideStates?.['Shadowing'])
        renderer.stats.addStageTime('Shadowing', performance.now() - _t0S)
      }

      if (lightPass && lightQueue) {
        if (!builtLightQueue && lightQueue.items.length === 0) {
          addItemsToQueue(lightQueue, visibility.opaque)
          builtLightQueue = true
        }
        // Front-to-back for opaque lighting contributions
        lightQueue.sortOpaque()
        const _t0L = performance.now()
        this.renderQueue(renderer, lightQueue, lightPass, {
          camera: context.camera,
          light: task.light,
          target: options?.overrideTargets?.['Lighting'] ?? context.target,
          scissor: task.scissor,
          uniforms: options?.additionalUniforms?.['Lighting']
        }, options?.overrideStates?.['Lighting'])
        renderer.stats.addStageTime('Lighting', performance.now() - _t0L)
      }

      // Per-light transparent stage (optional), grouped by blend mode
      if (transparentPass && transparentQueue) {
        if (!groupedTransparentBuilt) {
          transparentAlphaItems = []
          transparentAdditiveItems = []
          for (const item of visibility.transparent) {
            let blend: string = 'Transparent'
            if (item.partitions && item.partitions.length > 0) {
              const name = item.partitions[0]
              const part: any = (item.model as any).partitions?.[name]
              const material = part?.mesh?.material
              blend = material?.blendMode ?? 'Transparent'
            }
            if (blend === 'Additive') transparentAdditiveItems.push(item)
            else transparentAlphaItems.push(item)
          }
          groupedTransparentBuilt = true
        }

        // Alpha-blended items: sort back-to-front
        transparentQueue.items.length = 0
        for (const it of transparentAlphaItems) transparentQueue.items.push(it)
        transparentQueue.sortTransparent()
        const _t0T = performance.now()
        this.renderQueue(renderer, transparentQueue, transparentPass, {
          camera: context.camera,
          light: task.light,
          target: options?.overrideTargets?.['Transparent'] ?? context.target,
          scissor: task.scissor,
          uniforms: options?.additionalUniforms?.['Transparent'] ?? options?.additionalUniforms?.['Lighting']
        }, options?.overrideStates?.['Transparent'])
        renderer.stats.addStageTime('Transparent', performance.now() - _t0T)

        // Additive items: blend mode override to Additive; order less critical
        if (transparentAdditiveItems.length > 0) {
          transparentQueue.items.length = 0
          for (const it of transparentAdditiveItems) transparentQueue.items.push(it)
          transparentQueue.sortTransparent()
          const transparentAdditiveOverride: Partial<Pick<PipelineDescriptor, 'cullMode' | 'blendMode' | 'depthTest' | 'depthMask' | 'colorMask'>> = {
            ...(options?.overrideStates?.['Transparent'] ?? {}),
            blendMode: 'Additive'
          }
          const _t0TA = performance.now()
          this.renderQueue(renderer, transparentQueue, transparentPass, {
            camera: context.camera,
            light: task.light,
            target: options?.overrideTargets?.['Transparent'] ?? context.target,
            scissor: task.scissor,
            uniforms: options?.additionalUniforms?.['Transparent'] ?? options?.additionalUniforms?.['Lighting']
          }, transparentAdditiveOverride)
          renderer.stats.addStageTime('Transparent', performance.now() - _t0TA)
        }
      }
    }

    // Transparent handled per-light above

    // Overlay stage (e.g., debug overlay) — not per-light
    const overlayPass = passes['Overlay']
    if (overlayPass && options?.overlayCallback) {
      const program = overlayPass.program
      if (program) {
        const desc: PipelineDescriptor = {
          program,
          cullMode: overlayPass.cullMode,
          blendMode: overlayPass.blendMode,
          depthTest: overlayPass.depthTest,
          depthMask: overlayPass.depthMask,
          colorMask: overlayPass.colorMask
        }
        const pipeline = renderer.pipelines.getOrCreate(desc)
        renderer.use(options?.overrideTargets?.['Overlay'] ?? context.target)
        renderer.bindPipeline(pipeline)
        renderer.bindFrameGroup(program, context.camera)
        const _t0O = performance.now()
        options.overlayCallback(renderer, overlayPass, context)
        renderer.stats.addStageTime('Overlay', performance.now() - _t0O)
      }
    }

    // Overlay and Post are intentionally not auto-executed here because they
    // often require explicit full-screen geometry and custom uniforms.
  }

  // Utility to run a single stage queue with explicit context.
  renderQueue(
    renderer: Renderer,
    queue: RenderQueue,
    pass: RenderPass,
    context: RenderPassContext,
    pipelineOverride?: Partial<Pick<PipelineDescriptor, 'cullMode' | 'blendMode' | 'depthTest' | 'depthMask' | 'colorMask'>>
  ) {
    queue.render(renderer, pass, context, pipelineOverride)
  }
}


