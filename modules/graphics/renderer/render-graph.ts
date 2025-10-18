import { Renderer } from './renderer'
import { RenderPass } from './render-pass'
import { LightBatch } from './lighting-task'
import { RenderQueue } from './render-queue'
import { RenderBatch } from './render-batch'
import { Camera, Entity, isModel, Light } from '@luz/core'
import { RenderTarget } from './target'
import { Scissor } from './scissor'
import { State } from './state'

type StageCallback = ({ renderPass, context }: { renderPass: RenderPass, context: FrameContext }) => void

export type RenderState = {
  cullMode: State.CullMode
  blendMode: State.BlendMode
  depthTest: State.DepthTest

  depthMask: boolean
  colorMask: boolean[]
}

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
  overrideTargets?: Partial<Record<RenderPass.Stage, RenderTarget>>
  overrideStates?: Partial<Record<RenderPass.Stage, Partial<RenderState>>>

  additionalUniforms?: Partial<Record<RenderPass.Stage, Record<string, unknown>>>

  overlayStageRendered?: StageCallback
}

// High-level orchestration of render stages. For Step 1, this is a thin
// container around stage queues; integration and behavior changes come later.
export class RenderGraph {
  private queues: Map<RenderPass.Stage, RenderQueue> = new Map()

  constructor(private renderer: Renderer) {
    this.queues = new Map()
  }

  getQueue(stage: RenderPass.Stage): RenderQueue {
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
    passes: Partial<Record<RenderPass.Stage, RenderPass>>,
    context: FrameContext,
    lightBatches: LightBatch[],
    opaqueBatches: RenderBatch[],
    transparentBatches: RenderBatch[],
    options?: RenderOptions
  ) {
    const resolveTarget = (stage: RenderPass.Stage) => {
      return options?.overrideTargets?.[stage] ?? context.target
    }

    const mergeOverrides = (
      stage: RenderPass.Stage,
      extra?: Partial<RenderState>
    ) => ({ ...(options?.overrideStates?.[stage] ?? {}), ...(extra ?? {}) })

    const enqueueBatches = (queue: RenderQueue, batches: RenderBatch[]) => {
      for (const item of batches) {
        queue.batches.push(item)
      }
    }

    const enqueueEntities = (queue: RenderQueue, entities: Entity[]) => {
      for (const entity of entities) {
        for (const component of Object.values(entity.components)) {
          if (isModel(component)) {
            queue.batches.push({ transform: entity, model: component })
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
        enqueueBatches(depthQueue, opaqueBatches)
      }
      // Front-to-back to maximize early-Z
      depthQueue.sortOpaqueBatches()
      this.renderStage('Depth', depthQueue, depthPass, { camera: context.camera }, context, options)
    }

    // Ambient/base stage (optional): opaque first
    const ambientPass = passes['Ambient']
    if (ambientPass) {
      const ambientQueue = this.getQueue('Ambient')
      if (ambientQueue.batches.length === 0) {
        enqueueBatches(ambientQueue, opaqueBatches)
      }
      // Front-to-back for opaque ambient/base
      ambientQueue.sortOpaqueBatches()
      this.renderStage('Ambient', ambientQueue, ambientPass, { camera: context.camera }, context, options)
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
        enqueueEntities(shadowQueue, task.entities)
        shadowQueue.sort()
        this.renderStage('Shadowing', shadowQueue, shadowPass, { camera: task.light }, context, options)
      }

      if (lightPass && lightQueue) {
        if (!builtLightQueue && lightQueue.batches.length === 0) {
          enqueueBatches(lightQueue, opaqueBatches)
          builtLightQueue = true
        }
        // Front-to-back for opaque lighting contributions
        lightQueue.sortOpaqueBatches()
        this.renderStage('Lighting', lightQueue, lightPass, { camera: context.camera, light: task.light, scissor: task.scissor }, context, options)
      }

      // Per-light transparent stage (optional), grouped by blend mode
      if (transparentPass && transparentQueue) {
        if (!groupedTransparentBuilt) {
          transparentAlphaItems = []
          transparentAdditiveItems = []
          for (const item of transparentBatches) {
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
        transparentQueue.sortTransparentBatches()
        this.renderStage('Transparent', transparentQueue, transparentPass, { camera: context.camera, light: task.light, scissor: task.scissor }, context, options)

        // Additive items: blend mode override to Additive; order less critical
        if (transparentAdditiveItems.length > 0) {
          transparentQueue.batches.length = 0
          for (const it of transparentAdditiveItems) transparentQueue.batches.push(it)
          transparentQueue.sortTransparentBatches()
          const additiveOverride = mergeOverrides('Transparent', { blendMode: 'Additive' })
          this.renderStage('Transparent', transparentQueue, transparentPass, { camera: context.camera, light: task.light, scissor: task.scissor }, context, options, additiveOverride)
        }
      }
    }

    // Transparent handled per-light above

    // Overlay stage (e.g., debug overlay) — not per-light
    const overlayPass = passes['Overlay']
    if (overlayPass && options?.overlayStageRendered) {
      this.renderer.use(resolveTarget('Overlay'))
      this.renderer.bindPipeline(overlayPass, mergeOverrides('Overlay'))

      this.renderer.setCameraUniforms(overlayPass.program!, context.camera)

      options.overlayStageRendered({ renderPass: overlayPass, context })
    }

    // Overlay and Post are intentionally not auto-executed here because they
    // often require explicit full-screen geometry and custom uniforms.
  }

  // Utility to run a single stage queue with explicit context.
  renderQueue(
    queue: RenderQueue,
    pass: RenderPass,
    context: QueueContext,
    pipelineOverride?: Partial<RenderState>
  ) {
    queue.render(this.renderer, pass, context, pipelineOverride)
  }

  private renderStage(
    stage: RenderPass.Stage,
    queue: RenderQueue,
    pass: RenderPass,
    stageContext: StageContext,
    frameContext: FrameContext,
    renderOptions?: RenderOptions,
    stateOverrides?: Partial<RenderState>
  ) {
    const uniforms = renderOptions?.additionalUniforms?.[stage]
      ?? (stage === 'Transparent' ? renderOptions?.additionalUniforms?.['Lighting'] : undefined)

    const target = renderOptions?.overrideTargets?.[stage] ?? frameContext.target

    const { camera, light, scissor } = stageContext

    this.renderQueue(
      queue,
      pass,
      {
        camera,
        light,
        scissor,
        target,
        uniforms
      },
      stateOverrides ?? renderOptions?.overrideStates?.[stage]
    )
  }
}


