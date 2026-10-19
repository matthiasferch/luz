import { ResourceScope } from '../resources/resource-scope'
import type { Camera } from '@luz/core'
import { Transform } from '@luz/core'
import { Vector2, Vector4 } from '@luz/math'
import type { FrameRenderer } from '../renderer/frame-renderer'
import type { RenderBackend } from '../renderer/render-backend'
import type { RenderBatch } from '../renderer/render-batch'
import type { RenderModel } from '../renderer/render-model'
import type { RenderPipeline } from '../renderer/render-pipeline'
import { RenderQueue } from '../renderer/render-queue'
import type { RenderTarget } from '../renderer/render-target'
import type { Texture } from '../types/texture'
import { createAmbientOcclusionState } from './ambient-occlusion'
import { AMBIENT_OCCLUSION_QUALITY } from './ambient-occlusion-quality'
import type { SeparableBlurEffect } from './separable-blur'
import { type BlurConfiguration } from './separable-blur'
import { type RenderingSettings } from './settings'

import type { BlurState } from './motion-blur'

const origin = Transform.createOrigin()
const emptyVector = Vector4.createZero()

interface EffectContext {
  readonly backend: RenderBackend
  readonly viewport: { width: number; height: number }
  readonly motionBlur: BlurState
  readonly frameRenderer: FrameRenderer
  readonly fullscreenModel: RenderModel
  readonly renderingSettings: RenderingSettings
  readonly blurEffect: SeparableBlurEffect
}
interface EffectFrame {
  readonly depthTexture: Texture
  readonly camera: Camera
}

export class AmbientOcclusion {
  private readonly scope: ResourceScope
  private readonly context: EffectContext

  constructor(context: EffectContext) {
    this.scope = new ResourceScope(context.backend)
    this.context = Object.create(context) as EffectContext

    Object.defineProperty(this.context, 'backend', { value: this.scope.backend })
  }

  destroy(): void {
    this.scope.destroy()
  }

  private frame!: EffectFrame

  beginFrame(frame: EffectFrame): void {
    this.frame = frame
  }
  readonly ambientOcclusion = createAmbientOcclusionState()

  ambientOcclusionBlurPipeline!: RenderPipeline
  ambientOcclusionPipeline!: RenderPipeline
  ambientOcclusionNormalPipeline!: RenderPipeline
  ambientOcclusionTemporalPipeline!: RenderPipeline
  ambientOcclusionUpsamplePipeline!: RenderPipeline
  ambientOcclusionBlurEffectConfiguration!: BlurConfiguration
  destroyAmbientOcclusionResources(): void {
    const { textures, buffers } = this.context.backend
    const targets = [
      this.ambientOcclusion.normalTarget,
      this.ambientOcclusion.rawTarget,
      this.ambientOcclusion.blurredTarget,
      this.ambientOcclusion.target,
      ...this.ambientOcclusion.historyTargets
    ]
    const resources = [
      this.ambientOcclusion.normalTexture,
      this.ambientOcclusion.rawTexture,
      this.ambientOcclusion.blurredTexture,
      this.ambientOcclusion.texture,
      ...this.ambientOcclusion.historyTextures,
      ...this.ambientOcclusion.historyMetadataTextures
    ]

    for (const target of targets) {
      if (target?.frameBuffer) {
        buffers.destroy(target.frameBuffer)
      }
    }

    for (const texture of resources) {
      if (texture) {
        textures.destroy(texture)
      }
    }

    this.ambientOcclusion.normalTarget = undefined
    this.ambientOcclusion.rawTarget = undefined
    this.ambientOcclusion.blurredTarget = undefined
    this.ambientOcclusion.target = undefined
    this.ambientOcclusion.normalTexture = undefined
    this.ambientOcclusion.rawTexture = undefined
    this.ambientOcclusion.blurredTexture = undefined
    this.ambientOcclusion.texture = undefined
    this.ambientOcclusion.historyTargets = []
    this.ambientOcclusion.historyTextures = []
    this.ambientOcclusion.historyMetadataTextures = []
    this.ambientOcclusion.historyIndex = 0
    this.ambientOcclusion.isHistoryValid = false
    this.ambientOcclusion.frameIndex = 0
  }

  prepareAmbientOcclusionResources(isEnabled: boolean): void {
    if (!isEnabled) {
      this.destroyAmbientOcclusionResources()

      return
    }

    if (
      this.ambientOcclusion.target?.width === this.context.viewport.width &&
      this.ambientOcclusion.target.height === this.context.viewport.height
    ) {
      return
    }

    this.destroyAmbientOcclusionResources()

    const { textures, buffers } = this.context.backend

    this.ambientOcclusion.normalTexture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      format: 'redGreen',
      precision: 8,
      filtering: 'none'
    })

    const ambientOcclusionNormalBuffer = buffers.create('frameBuffer')

    buffers.attach(ambientOcclusionNormalBuffer, this.ambientOcclusion.normalTexture, 0x8ce0)
    buffers.attach(ambientOcclusionNormalBuffer, this.frame.depthTexture, 0x8d00)

    this.ambientOcclusion.normalTarget = {
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      frameBuffer: ambientOcclusionNormalBuffer
    }

    const ambientOcclusionWidth = Math.max(1, Math.ceil(this.context.viewport.width / 2))
    const ambientOcclusionHeight = Math.max(1, Math.ceil(this.context.viewport.height / 2))
    const makeAoTarget = (format: 'red' | 'color', precision: 8 | 32): { texture: Texture; target: RenderTarget } => {
      const texture = textures.create({
        width: ambientOcclusionWidth,
        height: ambientOcclusionHeight,
        format,
        precision,
        filtering: 'bilinear'
      })
      const frameBuffer = buffers.create('frameBuffer')

      buffers.attach(frameBuffer, texture, 0x8ce0)

      return { texture, target: { width: ambientOcclusionWidth, height: ambientOcclusionHeight, frameBuffer } }
    }

    const rawAmbientOcclusion = makeAoTarget('red', 8)

    this.ambientOcclusion.rawTexture = rawAmbientOcclusion.texture
    this.ambientOcclusion.rawTarget = rawAmbientOcclusion.target

    const blurredAo = makeAoTarget('red', 8)

    this.ambientOcclusion.blurredTexture = blurredAo.texture
    this.ambientOcclusion.blurredTarget = blurredAo.target

    for (let index = 0; index < 2; ++index) {
      const history = makeAoTarget('color', 8)
      const metadata = textures.create({
        width: ambientOcclusionWidth,
        height: ambientOcclusionHeight,
        precision: 8,
        filtering: 'none'
      })

      buffers.attach(history.target.frameBuffer!, metadata, 0x8ce1)
      this.ambientOcclusion.historyTextures.push(history.texture)
      this.ambientOcclusion.historyMetadataTextures.push(metadata)
      this.ambientOcclusion.historyTargets.push(history.target)
    }

    this.ambientOcclusion.texture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      format: 'red',
      precision: 8,
      filtering: 'bilinear'
    })

    const ambientOcclusionBuffer = buffers.create('frameBuffer')

    buffers.attach(ambientOcclusionBuffer, this.ambientOcclusion.texture, 0x8ce0)

    this.ambientOcclusion.target = {
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      frameBuffer: ambientOcclusionBuffer
    }
  }

  renderAmbientOcclusion(surfaceBatches: RenderBatch[]): void {
    if (
      !this.ambientOcclusion.normalTexture ||
      !this.ambientOcclusion.normalTarget ||
      !this.ambientOcclusion.rawTexture ||
      !this.ambientOcclusion.rawTarget ||
      !this.ambientOcclusion.blurredTexture ||
      !this.ambientOcclusion.blurredTarget ||
      !this.ambientOcclusion.texture ||
      !this.ambientOcclusion.target ||
      this.ambientOcclusion.historyTextures.length !== 2 ||
      this.ambientOcclusion.historyTargets.length !== 2 ||
      this.ambientOcclusion.historyMetadataTextures.length !== 2 ||
      !this.context.motionBlur.vectorTexture
    ) {
      this.ambientOcclusion.isHistoryValid = false

      return
    }

    const normalQueue = new RenderQueue()

    normalQueue.batches.push(...surfaceBatches)
    normalQueue.sortByMaterialThenDepth()
    this.context.frameRenderer.renderQueue(normalQueue, this.ambientOcclusionNormalPipeline, {
      clear: { color: new Vector4([0.5, 0.5, 0, 1]) },
      camera: this.frame.camera,
      target: this.ambientOcclusion.normalTarget,
      uniforms: { clipPlane: emptyVector }
    })

    const overlayQueue = new RenderQueue()

    overlayQueue.batches.push({ transform: origin, model: this.context.fullscreenModel })
    overlayQueue.sortByMaterialThenDepth()

    const quality = AMBIENT_OCCLUSION_QUALITY[this.context.renderingSettings.ambientOcclusion.quality]
    const ambientOcclusionResolution = new Vector2([
      this.ambientOcclusion.rawTarget.width,
      this.ambientOcclusion.rawTarget.height
    ])

    this.context.frameRenderer.renderQueue(overlayQueue, this.ambientOcclusionPipeline, {
      clear: { color: new Vector4([1, 1, 1, 1]) },
      camera: this.frame.camera,
      target: this.ambientOcclusion.rawTarget,
      uniforms: {
        depthTexture: this.frame.depthTexture,
        normalTexture: this.ambientOcclusion.normalTexture,
        ambientOcclusionRadius: this.context.renderingSettings.ambientOcclusion.radius,
        ambientOcclusionIntensity: this.context.renderingSettings.ambientOcclusion.intensity,
        ambientOcclusionFalloff: this.context.renderingSettings.ambientOcclusion.falloff,
        ambientOcclusionThickness: this.context.renderingSettings.ambientOcclusion.thickness,
        ambientOcclusionDirectionCount: quality.directionCount,
        ambientOcclusionStepCount: quality.stepCount,
        ambientOcclusionFrameIndex: this.ambientOcclusion.frameIndex,
        ambientOcclusionResolution
      }
    })

    const historyWriteIndex = 1 - this.ambientOcclusion.historyIndex

    this.context.frameRenderer.renderQueue(overlayQueue, this.ambientOcclusionTemporalPipeline, {
      clear: { color: new Vector4([1, 1, 0.5, 0.5]) },
      camera: this.frame.camera,
      target: this.ambientOcclusion.historyTargets[historyWriteIndex],
      uniforms: {
        currentAmbientOcclusionTexture: this.ambientOcclusion.rawTexture,
        historyTexture: this.ambientOcclusion.historyTextures[this.ambientOcclusion.historyIndex],
        historyMetadataTexture: this.ambientOcclusion.historyMetadataTextures[this.ambientOcclusion.historyIndex],
        motionVectorTexture: this.context.motionBlur.vectorTexture,
        depthTexture: this.frame.depthTexture,
        normalTexture: this.ambientOcclusion.normalTexture,
        isHistoryValid: this.ambientOcclusion.isHistoryValid,
        temporalStability: this.context.renderingSettings.ambientOcclusion.temporalStability,
        ambientOcclusionResolution
      }
    })

    this.ambientOcclusion.historyIndex = historyWriteIndex
    this.ambientOcclusion.isHistoryValid = true
    this.ambientOcclusion.frameIndex = (this.ambientOcclusion.frameIndex + 1) % 64

    this.context.blurEffect.render(
      this.ambientOcclusionBlurPipeline,
      this.ambientOcclusion.historyTextures[this.ambientOcclusion.historyIndex],
      this.ambientOcclusion.blurredTarget,
      {
        ...this.ambientOcclusionBlurEffectConfiguration.parameters,
        depthTexture: this.frame.depthTexture,
        normalTexture: this.ambientOcclusion.normalTexture
      },
      this.ambientOcclusionBlurEffectConfiguration.isCameraRequired ? this.frame.camera : null,
      {
        clear: this.ambientOcclusionBlurEffectConfiguration.clear,
        sourceUniform: this.ambientOcclusionBlurEffectConfiguration.sourceUniform,
        directionUniform: this.ambientOcclusionBlurEffectConfiguration.directionUniform
      }
    )
    this.context.frameRenderer.renderQueue(overlayQueue, this.ambientOcclusionUpsamplePipeline, {
      clear: { color: new Vector4([1, 1, 1, 1]) },
      camera: this.frame.camera,
      target: this.ambientOcclusion.target,
      uniforms: {
        baseTexture: this.ambientOcclusion.blurredTexture,
        depthTexture: this.frame.depthTexture,
        normalTexture: this.ambientOcclusion.normalTexture
      }
    })
  }
}
