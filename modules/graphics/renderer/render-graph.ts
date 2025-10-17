import { Renderer } from './renderer'
import { RenderPass } from './pass'
import { LightingTask } from './lighting-task'
import { RenderQueue } from './render-queue'
import { RenderItem } from './render-item'
import { Camera, Entity, Light } from '@luz/core'
import { RenderTarget } from './target'
import type { PipelineDescriptor, RenderState } from './pipeline'
import { Scissor } from './scissor'

export type RenderStage = 'Depth' | 'Ambient' | 'Shadowing' | 'Lighting' | 'Transparent' | 'Overlay' | 'Composite'

export type FrameContext = {
  time: number
  camera: Camera
  target: RenderTarget
}

export type LightContext = {
  light: Light | null
  camera: Camera
  scissor?: Scissor
}

export type RenderContext = {
  // Active camera for this pass (camera or light-as-camera)
  camera: Camera | null
  // Active light for this pass (null for camera-only passes like Ambient/Depth)
  light: Light | null
  // Render target for this pass
  target: RenderTarget
  // Optional scissor rectangle in pixels (origin bottom-left)
  scissor?: Scissor
  // Optional extra uniforms provided by the pass
  uniforms?: Record<string, unknown>
}

export type VisibilitySet = {
  opaqueItems: RenderItem[]
  transparentItems: RenderItem[]
}

type RenderOptions = {
  // Per-stage render targets override; falls back to frame.target when missing
  overrideTargets?: Partial<Record<RenderStage, RenderTarget>>

  // Per-stage temporary pass-state overrides (e.g., cull mode for reflections)
  overrideStates?: Partial<Record<RenderStage, Partial<RenderState>>>

  // Per-stage extra uniforms object merged into the pass uniforms
  additionalUniforms?: Partial<Record<RenderStage, Record<string, unknown>>>

  // Optional overlay stage callback executed after transparent, if pass provided
  overlayCallback?: (renderer: Renderer, pass: RenderPass, frame: FrameContext) => void
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
    context: FrameContext,
    visibility: VisibilitySet,
    lighting: LightingTask[],
    options?: RenderOptions
  ) {
    // Helpers to keep stage code concise
    const pickTarget = (stage: RenderStage) => options?.overrideTargets?.[stage] ?? context.target
    const pickUniforms = (stage: RenderStage, fallback?: RenderStage) =>
      options?.additionalUniforms?.[stage] ?? (fallback ? options?.additionalUniforms?.[fallback] : undefined)
    const pickOverrides = (
      stage: RenderStage,
      extra?: Partial<RenderState>
    ) => ({ ...(options?.overrideStates?.[stage] ?? {}), ...(extra ?? {}) })

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

    const runStage = (
      stage: RenderStage,
      queue: RenderQueue,
      pass: RenderPass,
      passCtx: LightContext,
      override?: Partial<RenderState>
    ) => {
      const uniforms = pickUniforms(stage, stage === 'Transparent' ? 'Lighting' : undefined)
      this.renderQueue(
        renderer,
        queue,
        pass,
        {
          camera: passCtx.camera,
          light: passCtx.light,
          scissor: passCtx.scissor,
          target: pickTarget(stage),
          uniforms
        },
        override ?? options?.overrideStates?.[stage]
      )
    }

    // Depth stage (optional): typically opaque only
    const depthPass = passes['Depth']
    if (depthPass) {
      const depthQueue = this.getQueue('Depth')
      if (depthQueue.items.length === 0) {
        addItemsToQueue(depthQueue, visibility.opaqueItems)
      }
      // Front-to-back to maximize early-Z
      depthQueue.sortOpaque()
      runStage('Depth', depthQueue, depthPass, { camera: context.camera, light: null })
    }

    // Ambient/base stage (optional): opaque first
    const ambientPass = passes['Ambient']
    if (ambientPass) {
      const ambientQueue = this.getQueue('Ambient')
      if (ambientQueue.items.length === 0) {
        addItemsToQueue(ambientQueue, visibility.opaqueItems)
      }
      // Front-to-back for opaque ambient/base
      ambientQueue.sortOpaque()
      runStage('Ambient', ambientQueue, ambientPass, { camera: context.camera, light: null })
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
        runStage('Shadowing', shadowQueue, shadowPass, { camera: task.light, light: null })
      }

      if (lightPass && lightQueue) {
        if (!builtLightQueue && lightQueue.items.length === 0) {
          addItemsToQueue(lightQueue, visibility.opaqueItems)
          builtLightQueue = true
        }
        // Front-to-back for opaque lighting contributions
        lightQueue.sortOpaque()
        runStage('Lighting', lightQueue, lightPass, { camera: context.camera, light: task.light, scissor: task.scissor })
      }

      // Per-light transparent stage (optional), grouped by blend mode
      if (transparentPass && transparentQueue) {
        if (!groupedTransparentBuilt) {
          transparentAlphaItems = []
          transparentAdditiveItems = []
          for (const item of visibility.transparentItems) {
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
        runStage('Transparent', transparentQueue, transparentPass, { camera: context.camera, light: task.light, scissor: task.scissor })

        // Additive items: blend mode override to Additive; order less critical
        if (transparentAdditiveItems.length > 0) {
          transparentQueue.items.length = 0
          for (const it of transparentAdditiveItems) transparentQueue.items.push(it)
          transparentQueue.sortTransparent()
          const additiveOverride = pickOverrides('Transparent', { blendMode: 'Additive' })
          runStage('Transparent', transparentQueue, transparentPass, { camera: context.camera, light: task.light, scissor: task.scissor }, additiveOverride)
        }
      }
    }

    // Transparent handled per-light above

    // Overlay stage (e.g., debug overlay) — not per-light
    const overlayPass = passes['Overlay']
    if (overlayPass && options?.overlayCallback) {
      const desc = overlayPass.toPipelineDescriptor()
      if (desc) {
        const pipeline = renderer.pipelines.getOrCreate(desc)
        renderer.use(pickTarget('Overlay'))
        renderer.bindPipeline(pipeline)
        renderer.setCameraUniforms(desc.program, context.camera)
        options.overlayCallback(renderer, overlayPass, context)
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
    context: RenderContext,
    pipelineOverride?: Partial<RenderState>
  ) {
    queue.render(renderer, pass, context, pipelineOverride)
  }
}


