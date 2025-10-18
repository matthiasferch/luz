import { Renderer } from './renderer'
import { RenderPipeline, RenderStage } from './render-pass'
import { LightBatch } from './lighting-task'
import { RenderQueue } from './render-queue'
import { RenderBatch } from './render-batch'
import { Camera, Entity, isModel, Light } from '@luz/core'
import { RenderTarget } from './target'
import { Scissor } from './scissor'
import { State } from './state'

type StageCallback = ({ pipeline, context }: { pipeline: RenderPipeline, context: FrameContext }) => void

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

type RenderOptions = {
  overrideTargets?: Partial<Record<RenderStage, RenderTarget>>
  overrideStates?: Partial<Record<RenderStage, Partial<RenderState>>>

  additionalUniforms?: Partial<Record<RenderStage, Record<string, unknown>>>

  overlayStageRendered?: StageCallback
}

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

  render(
    pipelines: Partial<Record<RenderStage, RenderPipeline>>,
    frameContext: FrameContext,
    lightBatches: LightBatch[],
    opaqueBatches: RenderBatch[],
    transparentBatches: RenderBatch[],
    pipelineOverrides?: RenderOptions
  ) {
    const mergeOverrides = (
      stage: RenderStage,
      overrideStates?: Partial<RenderState>
    ) => ({
      ...(pipelineOverrides?.overrideStates?.[stage] ?? {}),
      ...(overrideStates ?? {})
    })

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

    const depthPass = pipelines['Depth']

    if (depthPass) {
      const depthQueue = this.getQueue('Depth')

      if (depthQueue.batches.length === 0) {
        enqueueBatches(depthQueue, opaqueBatches)
      }

      depthQueue.sortFrontToBack()

      const depthContext: StageContext = {
        camera: frameContext.camera
      }

      this.renderStage('Depth', depthQueue, depthPass, depthContext, frameContext, pipelineOverrides)
    }

    const ambientPipeline = pipelines['Ambient']

    if (ambientPipeline) {
      const ambientQueue = this.getQueue('Ambient')

      if (ambientQueue.batches.length === 0) {
        enqueueBatches(ambientQueue, opaqueBatches)
      }

      ambientQueue.sortFrontToBack()

      const ambientContext: StageContext = {
        camera: frameContext.camera
      }

      this.renderStage('Ambient', ambientQueue, ambientPipeline, ambientContext, frameContext, pipelineOverrides)
    }

    const lightingPipeline = pipelines['Lighting']
    const shadowMappingPipeline = pipelines['ShadowMapping']

    const lightQueue = lightingPipeline ? this.getQueue('Lighting') : null

    let builtLightQueue = false

    const transparentPipeline = pipelines['Transparent']
    const transparentQueue = transparentPipeline ? this.getQueue('Transparent') : null

    let groupedTransparentBuilt = false

    let transparentAlphaBatches: RenderBatch[] = []
    let transparentAdditiveBatches: RenderBatch[] = []

    for (const batch of lightBatches) {
      if (shadowMappingPipeline) {
        const shadowMappingQueue = this.getQueue('ShadowMapping')

        shadowMappingQueue.batches.length = 0

        enqueueEntities(shadowMappingQueue, batch.entities)

        shadowMappingQueue.sortFrontToBack()

        const shadowMappingContext: StageContext = {
          camera: batch.light
        }

        this.renderStage('ShadowMapping', shadowMappingQueue, shadowMappingPipeline, shadowMappingContext, frameContext, pipelineOverrides)
      }

      if (lightingPipeline && lightQueue) {
        if (!builtLightQueue && lightQueue.batches.length === 0) {
          enqueueBatches(lightQueue, opaqueBatches)

          builtLightQueue = true
        }

        lightQueue.sortFrontToBack()

        const lightContext: StageContext = {
          camera: frameContext.camera,
          light: batch.light,
          scissor: batch.scissor
        }

        this.renderStage('Lighting', lightQueue, lightingPipeline, lightContext, frameContext, pipelineOverrides)
      }

      if (transparentPipeline && transparentQueue) {
        if (!groupedTransparentBuilt) {
          transparentAlphaBatches = []
          transparentAdditiveBatches = []

          for (const batch of transparentBatches) {
            let blendMode: State.BlendMode = 'Transparent'

            if (batch.partitions && batch.partitions.length > 0) {
              const name = batch.partitions[0]

              const partition = batch.model.partitions?.[name]
              const meshMaterial = partition?.mesh?.material

              blendMode = meshMaterial?.blendMode ?? 'Transparent'
            }

            if (blendMode === 'Additive') {
              transparentAdditiveBatches.push(batch)
            }

            else transparentAlphaBatches.push(batch)
          }

          groupedTransparentBuilt = true
        }

        transparentQueue.batches.length = 0

        for (const batch of transparentAlphaBatches) {
          transparentQueue.batches.push(batch)
        }

        transparentQueue.sortBackToFront()

        const transparentContext: StageContext = {
          camera: frameContext.camera,
          light: batch.light,
          scissor: batch.scissor
        }

        this.renderStage('Transparent', transparentQueue, transparentPipeline, transparentContext, frameContext, pipelineOverrides)

        if (transparentAdditiveBatches.length > 0) {
          transparentQueue.batches.length = 0

          for (const batch of transparentAdditiveBatches) {
            transparentQueue.batches.push(batch)
          }

          transparentQueue.sortBackToFront()

          const additiveOverride = mergeOverrides('Transparent', {
            blendMode: 'Additive'
          })

          this.renderStage('Transparent', transparentQueue, transparentPipeline, transparentContext, frameContext, pipelineOverrides, additiveOverride)
        }
      }
    }

    const overlayPipeline = pipelines['Overlay']

    if (overlayPipeline && pipelineOverrides?.overlayStageRendered) {
      const overrideTarget = pipelineOverrides?.overrideTargets?.['Overlay'] ?? frameContext.target

      this.renderer.bindTarget(overrideTarget)
      this.renderer.bindPipeline(overlayPipeline)

      this.renderer.bindCameraUniforms(overlayPipeline.program!, frameContext.camera)

      pipelineOverrides.overlayStageRendered({ pipeline: overlayPipeline, context: frameContext })
    }
  }
  renderQueue(
    queue: RenderQueue,
    pipeline: RenderPipeline,
    queueContext: QueueContext,
    pipelineOverrides?: Partial<RenderState>
  ) {
    queue.render(this.renderer, pipeline, queueContext, pipelineOverrides)
  }

  private renderStage(
    stage: RenderStage,
    queue: RenderQueue,
    pipeline: RenderPipeline,
    stageContext: StageContext,
    frameContext: FrameContext,
    renderOptions?: RenderOptions,
    stateOverrides?: Partial<RenderState>
  ) {
    const uniforms = renderOptions?.additionalUniforms?.[stage]
      ?? (stage === 'Transparent' ? renderOptions?.additionalUniforms?.['Lighting'] : undefined)

    const target = renderOptions?.overrideTargets?.[stage] ?? frameContext.target

    const queueContext: QueueContext = { ...stageContext, target, uniforms }

    this.renderQueue(queue, pipeline, queueContext, stateOverrides ?? renderOptions?.overrideStates?.[stage])
  }
}


