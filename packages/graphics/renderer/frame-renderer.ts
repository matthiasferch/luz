import type { RenderContext } from './render-pass'
import { executeRenderPass } from './render-pass'
import type { ClearOptions, RenderBackend, RenderState } from './render-backend'
import type { RenderPipeline, RenderStage } from './render-pipeline'
import type { LightBatch } from './light-batch'
import { RenderQueue } from './render-queue'
import type { RenderBatch } from './render-batch'
import type { Camera, Entity, Light, Projector } from '@luz/core'
import { isModel } from '../model'
import type { RenderTarget } from './render-target'
import type { Rectangle } from '@luz/core'
import type { Model } from '../model'
import type { RenderModel } from './render-model'
import type { Texture } from '../types/texture'

export type StageCallback = ({ pipeline, context }: { pipeline: RenderPipeline; context: FrameContext }) => void
export type TransmissionLayerCallback = (options: {
  pipeline: RenderPipeline
  context: FrameContext
  batch: RenderBatch
  layerIndex: number
  layerCount: number
}) => void
export type TransmissionLightingTarget = (batch: RenderBatch) => RenderTarget | undefined

export interface FrameContext {
  target: RenderTarget
  camera: Camera

  time: number
}

export interface StageContext {
  camera: Projector

  light?: Light
  scissor?: Rectangle
  viewport?: Rectangle
  uniforms?: object
}

export interface QueueContext extends RenderContext {
  camera?: Projector

  light?: Light
  scissor?: Rectangle

  uniforms?: object
}

export interface RenderOptions {
  resolveShadowTexture?: (batch: LightBatch) => Texture
  clear?: Partial<Record<RenderStage, Partial<ClearOptions>>>
  overrideTargets?: Partial<Record<RenderStage, RenderTarget>>
  overrideStates?: Partial<Record<RenderStage, Partial<RenderState>>>

  additionalUniforms?: Partial<Record<RenderStage, object>>
  volumetricBatches?: RenderBatch[]
  onStageRendering?: (stage: RenderStage) => void
  onStageRendered?: (stage: RenderStage) => void

  onTransmissionStagePreparing?: StageCallback
  onTransmissionLayerPreparing?: TransmissionLayerCallback
  resolveTransmissionLightingTarget?: TransmissionLightingTarget
  onOverlayStageRendered?: StageCallback
}

export class FrameRenderer {
  private queues: Map<RenderStage, RenderQueue> = new Map()

  constructor(
    private readonly backend: RenderBackend,
    private readonly resolveModel: (model: Model) => RenderModel
  ) {
    this.queues = new Map()
  }

  ensureQueue(stage: RenderStage): RenderQueue {
    let queue = this.queues.get(stage)

    if (!queue) {
      queue = new RenderQueue()

      this.queues.set(stage, queue)
    }

    return queue
  }

  clear() {
    this.queues.forEach((queue) => {
      queue.batches.length = 0
    })
  }

  renderFrame(
    pipelines: Partial<Record<RenderStage, RenderPipeline>>,
    frameContext: FrameContext,
    lightBatches: LightBatch[],
    opaqueBatches: RenderBatch[],
    transparentBatches: RenderBatch[],
    pipelineOverrides?: RenderOptions
  ) {
    lightBatches = lightBatches.filter((batch) => batch.light.isVisible)
    opaqueBatches = opaqueBatches.filter((batch) => batch.model.source.isVisible)
    transparentBatches = transparentBatches.filter((batch) => batch.model.source.isVisible)

    const mergeOverrides = (stage: RenderStage, overrideStates?: Partial<RenderState>) => ({
      ...(pipelineOverrides?.overrideStates?.[stage] ?? {}),
      ...(overrideStates ?? {})
    })

    const enqueueBatches = (queue: RenderQueue, batches: RenderBatch[]) => {
      for (const item of batches) {
        queue.batches.push(item)
      }
    }

    const enqueueShadowCasters = (queue: RenderQueue, entities: Entity[]) => {
      for (const entity of entities) {
        for (const component of Object.values(entity.components)) {
          if (!isModel(component) || !component.isVisible) {
            continue
          }

          const model = this.resolveModel(component)
          const meshes = Object.entries(model.primitives)
            .filter(([, primitive]) => primitive.material.isOpaque)
            .map(([name]) => name)

          if (meshes.length > 0) {
            queue.batches.push({ transform: entity, model, meshes })
          }
        }
      }
    }

    const transparentPipeline = pipelines['transparent']
    const transparentQueue = transparentPipeline ? this.ensureQueue('transparent') : null
    const transmissionPipeline = pipelines['transmission']
    const transmissionQueue = transmissionPipeline ? this.ensureQueue('transmission') : null

    const transparentAlphaBatches: RenderBatch[] = []
    const transparentAdditiveBatches: RenderBatch[] = []
    const transmissionBatches: RenderBatch[] = []

    for (const batch of transparentBatches) {
      const name = batch.meshes?.[0]
      const blendMode = name ? (batch.model.primitives[name]?.material.blendMode ?? 'transparent') : 'transparent'

      if (blendMode === 'transmissive') {
        transmissionBatches.push(batch)
      } else if (blendMode === 'additive') {
        transparentAdditiveBatches.push(batch)
      } else {
        transparentAlphaBatches.push(batch)
      }
    }

    const depthPipeline = pipelines['depth']
    const transmissionLightingQueue = new RenderQueue()
    const renderTransmissionLighting = (
      stage: 'ambient' | 'lighting',
      pipeline: RenderPipeline,
      stageContext: StageContext
    ) => {
      const resolveTarget = pipelineOverrides?.resolveTransmissionLightingTarget

      if (!resolveTarget) {
        return
      }

      for (const batch of transmissionBatches) {
        const target = resolveTarget(batch)

        if (!target) {
          continue
        }

        transmissionLightingQueue.batches.length = 0

        transmissionLightingQueue.batches.push(batch)

        if (stage === 'ambient' && depthPipeline) {
          this.renderQueue(
            transmissionLightingQueue,
            depthPipeline,
            {
              camera: stageContext.camera,
              target,
              clear: pipelineOverrides?.clear?.depth,
              uniforms: pipelineOverrides?.additionalUniforms?.depth
            },
            pipelineOverrides?.overrideStates?.depth
          )
        }

        this.renderQueue(
          transmissionLightingQueue,
          pipeline,
          {
            ...stageContext,
            target,
            clear: pipelineOverrides?.clear?.[stage],
            uniforms: { ...pipelineOverrides?.additionalUniforms?.[stage], ...stageContext.uniforms }
          },
          pipelineOverrides?.overrideStates?.[stage]
        )
      }
    }

    if (depthPipeline) {
      const depthQueue = this.ensureQueue('depth')

      if (depthQueue.batches.length === 0) {
        enqueueBatches(depthQueue, opaqueBatches)
      }

      depthQueue.sortByMaterialThenDepth()

      const depthContext: StageContext = {
        camera: frameContext.camera
      }

      this.renderStage('depth', depthQueue, depthPipeline, depthContext, frameContext, pipelineOverrides)
    }

    const ambientPipeline = pipelines['ambient']

    if (ambientPipeline) {
      const ambientQueue = this.ensureQueue('ambient')

      if (ambientQueue.batches.length === 0) {
        enqueueBatches(ambientQueue, opaqueBatches)
      }

      ambientQueue.sortByMaterialThenDepth()

      const ambientContext: StageContext = {
        camera: frameContext.camera
      }

      this.renderStage('ambient', ambientQueue, ambientPipeline, ambientContext, frameContext, pipelineOverrides)
      renderTransmissionLighting('ambient', ambientPipeline, ambientContext)
    }

    const lightingPipeline = pipelines['lighting']
    const shadowMappingPipeline = pipelines['shadowMapping']
    const volumetricLightingPipeline = pipelines['volumetricLighting']

    const lightQueue = lightingPipeline ? this.ensureQueue('lighting') : null
    const volumetricQueue = volumetricLightingPipeline ? this.ensureQueue('volumetricLighting') : null

    let isLightQueuePrepared = false
    let isVolumetricQueuePrepared = false

    const renderShadows = (batch: LightBatch): void => {
      if (!shadowMappingPipeline) {
        return
      }

      const target = pipelineOverrides?.overrideTargets?.shadowMapping ?? frameContext.target
      const faceSize = Math.floor(Math.min(target.width / 3, target.height / 2))

      batch.light.shadowCameras.forEach((camera, index) => {
        const shadowMappingQueue = this.ensureQueue('shadowMapping')
        const viewport = batch.light.isPoint
          ? { x: (index % 3) * faceSize, y: Math.floor(index / 3) * faceSize, width: faceSize, height: faceSize }
          : undefined

        shadowMappingQueue.batches.length = 0

        enqueueShadowCasters(shadowMappingQueue, batch.shadowEntities?.[index] ?? batch.entities)
        shadowMappingQueue.sortByMaterialThenDepth()
        this.renderStage(
          'shadowMapping',
          shadowMappingQueue,
          shadowMappingPipeline,
          { camera, viewport, scissor: viewport },
          frameContext,
          pipelineOverrides
        )
      })
    }

    for (const batch of lightBatches) {
      renderShadows(batch)

      const shadowTexture = pipelineOverrides?.resolveShadowTexture?.(batch)
      const shadowUniforms = shadowTexture ? { shadowTexture } : undefined

      if (lightingPipeline && lightQueue) {
        if (!isLightQueuePrepared && lightQueue.batches.length === 0) {
          enqueueBatches(lightQueue, opaqueBatches)

          isLightQueuePrepared = true
        }

        lightQueue.sortByMaterialThenDepth()

        const lightContext: StageContext = {
          camera: frameContext.camera,
          light: batch.light,
          uniforms: shadowUniforms,
          scissor: batch.scissor
        }

        this.renderStage('lighting', lightQueue, lightingPipeline, lightContext, frameContext, pipelineOverrides)
        renderTransmissionLighting('lighting', lightingPipeline, lightContext)
      }

      if (
        volumetricLightingPipeline &&
        volumetricQueue &&
        pipelineOverrides?.volumetricBatches?.length &&
        batch.light.volumetricIntensity > 0 &&
        batch.light.volumetricDensity > 0 &&
        batch.light.intensity > 0 &&
        (batch.light.isDirectional || batch.light.range > 0)
      ) {
        if (!isVolumetricQueuePrepared && volumetricQueue.batches.length === 0) {
          enqueueBatches(volumetricQueue, pipelineOverrides.volumetricBatches)

          isVolumetricQueuePrepared = true
        }

        const volumetricContext: StageContext = {
          camera: frameContext.camera,
          light: batch.light,
          uniforms: shadowUniforms
        }

        this.renderStage(
          'volumetricLighting',
          volumetricQueue,
          volumetricLightingPipeline,
          volumetricContext,
          frameContext,
          pipelineOverrides
        )
      }
    }

    if (transmissionPipeline && transmissionQueue && transmissionBatches.length > 0) {
      transmissionQueue.batches.length = 0

      enqueueBatches(transmissionQueue, transmissionBatches)
      transmissionQueue.sortBackToFront()
      pipelineOverrides?.onTransmissionStagePreparing?.({ pipeline: transmissionPipeline, context: frameContext })

      const sortedTransmissionBatches = [...transmissionQueue.batches]

      for (const [layerIndex, batch] of sortedTransmissionBatches.entries()) {
        pipelineOverrides?.onTransmissionLayerPreparing?.({
          pipeline: transmissionPipeline,
          context: frameContext,
          batch,
          layerIndex,
          layerCount: sortedTransmissionBatches.length
        })

        transmissionQueue.batches.length = 0

        transmissionQueue.batches.push(batch)
        this.renderStage(
          'transmission',
          transmissionQueue,
          transmissionPipeline,
          {
            camera: frameContext.camera
          },
          frameContext,
          pipelineOverrides
        )
      }
    }

    if (transparentPipeline && transparentQueue) {
      for (const lightBatch of lightBatches) {
        if (transparentAlphaBatches.length > 0 || transparentAdditiveBatches.length > 0) {
          renderShadows(lightBatch)
        }

        const transparentContext: StageContext = {
          camera: frameContext.camera,
          light: lightBatch.light,
          uniforms: pipelineOverrides?.resolveShadowTexture
            ? { shadowTexture: pipelineOverrides.resolveShadowTexture(lightBatch) }
            : undefined,
          scissor: lightBatch.scissor
        }

        transparentQueue.batches.length = 0

        enqueueBatches(transparentQueue, transparentAlphaBatches)
        transparentQueue.sortBackToFront()
        this.renderStage(
          'transparent',
          transparentQueue,
          transparentPipeline,
          transparentContext,
          frameContext,
          pipelineOverrides
        )

        if (transparentAdditiveBatches.length > 0) {
          transparentQueue.batches.length = 0

          enqueueBatches(transparentQueue, transparentAdditiveBatches)
          transparentQueue.sortBackToFront()

          const additiveOverride = mergeOverrides('transparent', { blendMode: 'additive' })

          this.renderStage(
            'transparent',
            transparentQueue,
            transparentPipeline,
            transparentContext,
            frameContext,
            pipelineOverrides,
            additiveOverride
          )
        }
      }
    }

    const overlayPipeline = pipelines['overlay']

    if (overlayPipeline && pipelineOverrides?.onOverlayStageRendered) {
      const overrideTarget = pipelineOverrides?.overrideTargets?.['overlay'] ?? frameContext.target

      executeRenderPass(
        this.backend,
        { pipeline: overlayPipeline, target: overrideTarget, clear: pipelineOverrides.clear?.overlay },
        () => {
          this.backend.bindCameraUniforms(overlayPipeline.program!, frameContext.camera)
          pipelineOverrides.onOverlayStageRendered!({ pipeline: overlayPipeline, context: frameContext })
        }
      )
    }
  }

  renderQueue(
    queue: RenderQueue,
    pipeline: RenderPipeline,
    queueContext: QueueContext,
    pipelineOverrides?: Partial<RenderState>
  ) {
    queue.render(this.backend, pipeline, queueContext, pipelineOverrides)
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
    const stageUniforms =
      renderOptions?.additionalUniforms?.[stage] ??
      (stage === 'transparent' ? renderOptions?.additionalUniforms?.['lighting'] : undefined)
    const uniforms = { ...stageUniforms, ...stageContext.uniforms }

    const baseTarget = renderOptions?.overrideTargets?.[stage] ?? frameContext.target
    const target = stageContext.viewport ? { ...baseTarget, viewport: stageContext.viewport } : baseTarget

    const queueContext: QueueContext = { ...stageContext, target, uniforms, clear: renderOptions?.clear?.[stage] }

    renderOptions?.onStageRendering?.(stage)

    try {
      this.renderQueue(queue, pipeline, queueContext, stateOverrides ?? renderOptions?.overrideStates?.[stage])
    } finally {
      renderOptions?.onStageRendered?.(stage)
    }
  }
}
