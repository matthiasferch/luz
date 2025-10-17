import { Renderer } from './renderer'
import { RenderPass } from './pass'
import { LightBatch } from './lighting-task'
import { RenderQueue } from './render-queue'
import { RenderBatch } from './render-item'
import { Camera, Entity, Light } from '@luz/core'
import { RenderTarget } from './target'
import type { RenderState } from './pipeline'
import { Scissor } from './scissor'

export type RenderStage = 'Depth' | 'Ambient' | 'Shadowing' | 'Lighting' | 'Transparent' | 'Overlay' | 'Composite'

export type FrameContext = {
  target: RenderTarget
  camera: Camera
  time: number
}

export type StageContext = {
  camera: Camera

  light?: Light
  scissor?: Scissor
}

export type QueueContext = {
  target: RenderTarget

  camera?: Camera

  light?: Light
  scissor?: Scissor

  uniforms?: Record<string, unknown>
}

export type VisibilitySet = {
  opaqueBatches: RenderBatch[]
  transparentBatches: RenderBatch[]
}

type RenderOptions = {
  overrideTargets?: Partial<Record<RenderStage, RenderTarget>>
  overrideStates?: Partial<Record<RenderStage, Partial<RenderState>>>

  additionalUniforms?: Partial<Record<RenderStage, Record<string, unknown>>>

  overlayStageCallback?: (renderer: Renderer, pass: RenderPass, frame: FrameContext) => void
}

// High-level orchestration of render stages. For Step 1, this is a thin
// container around stage queues; integration and behavior changes come later.
export class RenderGraph {
  private queues: Map<RenderStage, RenderQueue> = new Map()

  constructor(private renderer: Renderer) {
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
      queue.batches.length = 0
    }
  }

  // Execute the graph. For Step 1 scaffolding this method is intentionally
  // conservative and does not alter current behavior by itself; callers can
  // delegate to existing Renderer.renderPass or use queues explicitly.
  render(
    renderer: Renderer,
    passes: Partial<Record<RenderStage, RenderPass>>,
    context: FrameContext,
    visibility: VisibilitySet,
    lightBatches: LightBatch[],
    options?: RenderOptions
  ) {
    // Helpers to keep stage code concise
    const pickTarget = (stage: RenderStage) => options?.overrideTargets?.[stage] ?? context.target
    const pickOverrides = (
      stage: RenderStage,
      extra?: Partial<RenderState>
    ) => ({ ...(options?.overrideStates?.[stage] ?? {}), ...(extra ?? {}) })

    const addItemsToQueue = (queue: RenderQueue, items: RenderBatch[]) => {
      for (const item of items) queue.batches.push(item)
    }

    const addEntitiesToQueue = (queue: RenderQueue, entities: Entity[]) => {
      for (const entity of entities) {
        for (const component of Object.values(entity.components)) {
          if ((component as any)?.type === 'Model') {
            queue.batches.push({ transform: entity, model: component as any })
          }
        }
      }
    }

    // Stage executor now moved to a private method; calls below delegate to it

    // Depth stage (optional): typically opaque only
    const depthPass = passes['Depth']
    if (depthPass) {
      const depthQueue = this.getQueue('Depth')
      if (depthQueue.batches.length === 0) {
        addItemsToQueue(depthQueue, visibility.opaqueBatches)
      }
      // Front-to-back to maximize early-Z
      depthQueue.sortOpaque()
      this.renderStage(renderer, 'Depth', depthQueue, depthPass, { camera: context.camera, light: null }, context, options)
    }

    // Ambient/base stage (optional): opaque first
    const ambientPass = passes['Ambient']
    if (ambientPass) {
      const ambientQueue = this.getQueue('Ambient')
      if (ambientQueue.batches.length === 0) {
        addItemsToQueue(ambientQueue, visibility.opaqueBatches)
      }
      // Front-to-back for opaque ambient/base
      ambientQueue.sortOpaque()
      this.renderStage(renderer, 'Ambient', ambientQueue, ambientPass, { camera: context.camera, light: null }, context, options)
    }

    // Per-light stages: Shadow (into current target) then Light accumulation

    const lightPass = passes['Lighting']
    const shadowPass = passes['Shadowing']

    const lightQueue = lightPass ? this.getQueue('Lighting') : null
    let builtLightQueue = false
    const transparentPass = passes['Transparent']
    const transparentQueue = transparentPass ? this.getQueue('Transparent') : null
    let groupedTransparentBuilt = false
    let transparentAlphaItems: RenderBatch[] = []
    let transparentAdditiveItems: RenderBatch[] = []

    for (const task of lightBatches) {
      if (shadowPass) {
        const shadowQueue = this.getQueue('Shadowing')
        shadowQueue.batches.length = 0
        addEntitiesToQueue(shadowQueue, task.entities)
        shadowQueue.sort()
        this.renderStage(renderer, 'Shadowing', shadowQueue, shadowPass, { camera: task.light, light: null }, context, options)
      }

      if (lightPass && lightQueue) {
        if (!builtLightQueue && lightQueue.batches.length === 0) {
          addItemsToQueue(lightQueue, visibility.opaqueBatches)
          builtLightQueue = true
        }
        // Front-to-back for opaque lighting contributions
        lightQueue.sortOpaque()
        this.renderStage(renderer, 'Lighting', lightQueue, lightPass, { camera: context.camera, light: task.light, scissor: task.scissor }, context, options)
      }

      // Per-light transparent stage (optional), grouped by blend mode
      if (transparentPass && transparentQueue) {
        if (!groupedTransparentBuilt) {
          transparentAlphaItems = []
          transparentAdditiveItems = []
          for (const item of visibility.transparentBatches) {
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
        transparentQueue.batches.length = 0
        for (const it of transparentAlphaItems) transparentQueue.batches.push(it)
        transparentQueue.sortTransparent()
        this.renderStage(renderer, 'Transparent', transparentQueue, transparentPass, { camera: context.camera, light: task.light, scissor: task.scissor }, context, options)

        // Additive items: blend mode override to Additive; order less critical
        if (transparentAdditiveItems.length > 0) {
          transparentQueue.batches.length = 0
          for (const it of transparentAdditiveItems) transparentQueue.batches.push(it)
          transparentQueue.sortTransparent()
          const additiveOverride = pickOverrides('Transparent', { blendMode: 'Additive' })
          this.renderStage(renderer, 'Transparent', transparentQueue, transparentPass, { camera: context.camera, light: task.light, scissor: task.scissor }, context, options, additiveOverride)
        }
      }
    }

    // Transparent handled per-light above

    // Overlay stage (e.g., debug overlay) — not per-light
    const overlayPass = passes['Overlay']
    if (overlayPass && options?.overlayStageCallback) {
      const desc = overlayPass.toPipelineDescriptor()
      if (desc) {
        const pipeline = renderer.pipelines.getOrCreate(desc)
        renderer.use(pickTarget('Overlay'))
        renderer.bindPipeline(pipeline)
        renderer.setCameraUniforms(desc.program, context.camera)
        options.overlayStageCallback(renderer, overlayPass, context)
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
    context: QueueContext,
    pipelineOverride?: Partial<RenderState>
  ) {
    queue.render(renderer, pass, context, pipelineOverride)
  }

  // Execute a stage with computed target/uniforms/overrides.
  // Kept as a method to reduce duplication in render().
  private renderStage(
    renderer: Renderer,
    stage: RenderStage,
    queue: RenderQueue,
    pass: RenderPass,
    passCtx: StageContext,
    frame: FrameContext,
    options?: RenderOptions,
    override?: Partial<RenderState>
  ) {
    const uniforms = options?.additionalUniforms?.[stage]
      ?? (stage === 'Transparent' ? options?.additionalUniforms?.['Lighting'] : undefined)
    const target = options?.overrideTargets?.[stage] ?? frame.target
    this.renderQueue(
      renderer,
      queue,
      pass,
      {
        camera: passCtx.camera,
        light: passCtx.light,
        scissor: passCtx.scissor,
        target,
        uniforms
      },
      override ?? options?.overrideStates?.[stage]
    )
  }
}


