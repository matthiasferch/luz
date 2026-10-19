import { Vector4 } from '@luz/math'
import { ResourceScope } from '../resources/resource-scope'
import type { Camera } from '@luz/core'
import { Vector2 } from '@luz/math'
import type { FrameRenderer } from '../renderer/frame-renderer'
import type { RenderBackend } from '../renderer/render-backend'
import type { RenderBatch } from '../renderer/render-batch'
import type { RenderPipeline } from '../renderer/render-pipeline'
import { RenderQueue } from '../renderer/render-queue'
import type { Texture } from '../types/texture'
import { createMotionBlurState } from './motion-blur'
import type { MotionBlurUniforms } from './render-uniforms'
import { type RenderingSettings } from './settings'

import type { TemporalHistory } from './temporal-history'

const MOTION_BLUR_TILE_SIZE = 16

interface EffectContext {
  readonly viewport: { width: number; height: number }
  readonly backend: RenderBackend
  readonly frameRenderer: FrameRenderer
  readonly renderingSettings: RenderingSettings
}
interface EffectFrame {
  readonly history: TemporalHistory
  readonly depthTexture: Texture
  readonly camera: Camera
}

export class MotionBlur {
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
  readonly motionBlur = createMotionBlurState()

  motionVectorPipeline!: RenderPipeline
  motionBlurTilePipeline!: RenderPipeline
  motionBlurNeighborPipeline!: RenderPipeline
  motionBlurPipeline!: RenderPipeline
  resize(depthTexture: Texture): void {
    this.destroyMotionBlurResources()

    const { textures, buffers } = this.context.backend

    if (this.motionBlur.vectorTarget?.frameBuffer) {
      buffers.destroy(this.motionBlur.vectorTarget.frameBuffer)
    }

    if (this.motionBlur.vectorTexture) {
      textures.destroy(this.motionBlur.vectorTexture)
    }

    this.motionBlur.vectorTexture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      precision: 32,
      filtering: 'none'
    })

    const motionVectorBuffer = buffers.create('frameBuffer')

    buffers.attach(motionVectorBuffer, this.motionBlur.vectorTexture, 0x8ce0)
    buffers.attach(motionVectorBuffer, depthTexture, 0x8d00)

    this.motionBlur.vectorTarget = {
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      frameBuffer: motionVectorBuffer
    }
  }

  prepareObjectMotionResources(isEnabled: boolean): void {
    if (!isEnabled) {
      this.destroyObjectMotionResources()

      return
    }

    if (
      this.motionBlur.objectTarget?.width === this.context.viewport.width &&
      this.motionBlur.objectTarget.height === this.context.viewport.height
    ) {
      return
    }

    this.destroyObjectMotionResources()

    const { textures, buffers } = this.context.backend

    this.motionBlur.objectTexture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      precision: 32,
      filtering: 'none'
    })

    const frameBuffer = buffers.create('frameBuffer')

    buffers.attach(frameBuffer, this.motionBlur.objectTexture, 0x8ce0)
    buffers.attach(frameBuffer, this.frame.depthTexture, 0x8d00)

    this.motionBlur.objectTarget = {
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      frameBuffer
    }
  }

  destroyObjectMotionResources(): void {
    if (this.motionBlur.objectTarget?.frameBuffer) {
      this.context.backend.buffers.destroy(this.motionBlur.objectTarget.frameBuffer)
    }

    if (this.motionBlur.objectTexture) {
      this.context.backend.textures.destroy(this.motionBlur.objectTexture)
    }

    this.motionBlur.objectTarget = undefined
    this.motionBlur.objectTexture = undefined
  }

  prepareMotionBlurResources(isEnabled: boolean): void {
    if (!isEnabled) {
      this.destroyMotionBlurResources()

      return
    }

    if (
      this.motionBlur.target?.width === this.context.viewport.width &&
      this.motionBlur.target.height === this.context.viewport.height
    ) {
      return
    }

    this.destroyMotionBlurResources()

    const { textures, buffers } = this.context.backend

    const velocityTileWidth = Math.max(1, Math.ceil(this.context.viewport.width / MOTION_BLUR_TILE_SIZE))
    const velocityTileHeight = Math.max(1, Math.ceil(this.context.viewport.height / MOTION_BLUR_TILE_SIZE))

    this.motionBlur.tileVelocityTexture = textures.create({
      width: velocityTileWidth,
      height: velocityTileHeight,
      precision: 32,
      filtering: 'none'
    })

    const motionBlurTileVelocityBuffer = buffers.create('frameBuffer')

    buffers.attach(motionBlurTileVelocityBuffer, this.motionBlur.tileVelocityTexture, 0x8ce0)

    this.motionBlur.tileVelocityTarget = {
      width: velocityTileWidth,
      height: velocityTileHeight,
      frameBuffer: motionBlurTileVelocityBuffer
    }
    this.motionBlur.neighborVelocityTexture = textures.create({
      width: velocityTileWidth,
      height: velocityTileHeight,
      precision: 32,
      filtering: 'none'
    })

    const motionBlurNeighborVelocityBuffer = buffers.create('frameBuffer')

    buffers.attach(motionBlurNeighborVelocityBuffer, this.motionBlur.neighborVelocityTexture, 0x8ce0)

    this.motionBlur.neighborVelocityTarget = {
      width: velocityTileWidth,
      height: velocityTileHeight,
      frameBuffer: motionBlurNeighborVelocityBuffer
    }
    this.motionBlur.texture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      precision: 16,
      filtering: 'bilinear'
    })

    const motionBlurBuffer = buffers.create('frameBuffer')

    buffers.attach(motionBlurBuffer, this.motionBlur.texture, 0x8ce0)

    this.motionBlur.target = {
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      frameBuffer: motionBlurBuffer
    }
  }

  destroyMotionBlurResources(): void {
    this.destroyObjectMotionResources()

    const { textures, buffers } = this.context.backend

    if (this.motionBlur.tileVelocityTarget?.frameBuffer) {
      buffers.destroy(this.motionBlur.tileVelocityTarget.frameBuffer)
    }

    if (this.motionBlur.tileVelocityTexture) {
      textures.destroy(this.motionBlur.tileVelocityTexture)
    }

    this.motionBlur.tileVelocityTarget = undefined
    this.motionBlur.tileVelocityTexture = undefined

    if (this.motionBlur.neighborVelocityTarget?.frameBuffer) {
      buffers.destroy(this.motionBlur.neighborVelocityTarget.frameBuffer)
    }

    if (this.motionBlur.neighborVelocityTexture) {
      textures.destroy(this.motionBlur.neighborVelocityTexture)
    }

    this.motionBlur.neighborVelocityTarget = undefined
    this.motionBlur.neighborVelocityTexture = undefined

    if (this.motionBlur.target?.frameBuffer) {
      buffers.destroy(this.motionBlur.target.frameBuffer)
    }

    if (this.motionBlur.texture) {
      textures.destroy(this.motionBlur.texture)
    }

    this.motionBlur.target = undefined
    this.motionBlur.texture = undefined
  }

  renderMotionVectors(surfaceBatches: RenderBatch[], isObjectOnlyBlurEnabled = false): void {
    const target = isObjectOnlyBlurEnabled ? this.motionBlur.objectTarget : this.motionBlur.vectorTarget

    if (!target) {
      return
    }

    const queue = new RenderQueue()

    for (const batch of surfaceBatches) {
      const currentBoneMatrices = batch.model.source.boneMatrices

      queue.batches.push({
        ...batch,
        uniforms: {
          ...(batch.uniforms ?? {}),
          temporalSurfaceId: this.frame.history.resolveTemporalSurfaceId(batch.transform),
          previousModelMatrix:
            this.frame.history.previousModelMatrices.get(batch.transform) ?? batch.transform.modelMatrix,
          ...(currentBoneMatrices
            ? {
                previousBoneMatrices: this.frame.history.previousBoneMatrices.get(batch.model) ?? currentBoneMatrices
              }
            : {})
        }
      })
    }

    // The target shares the opaque depth buffer. LessEqual keeps hidden
    // surfaces out while back-to-front ordering lets the nearest transparent
    // or transmissive surface replace the velocity beneath it.
    queue.sortBackToFront()
    this.context.frameRenderer.renderQueue(queue, this.motionVectorPipeline, {
      clear: { color: new Vector4([0, 0, 1, 0]) },
      camera: this.frame.camera,
      target,
      uniforms: {
        currentViewProjectionMatrix: this.frame.history.temporalAntialiasing.currentViewProjectionMatrix,

        // Project both object poses through the current unjittered camera for
        // object-only blur. TAA and AO keep the full camera-aware velocities.
        previousViewProjectionMatrix: isObjectOnlyBlurEnabled
          ? this.frame.history.temporalAntialiasing.currentViewProjectionMatrix
          : this.frame.history.temporalAntialiasing.previousViewProjectionMatrix
      }
    })
  }

  renderMotionBlur(queue: RenderQueue, currentTexture: Texture): Texture {
    const hasCameraMotion = this.context.renderingSettings.motionBlur.isCameraBlurEnabled
    const motionVectorTexture = hasCameraMotion ? this.motionBlur.vectorTexture : this.motionBlur.objectTexture

    if (
      !motionVectorTexture ||
      !this.motionBlur.tileVelocityTexture ||
      !this.motionBlur.tileVelocityTarget ||
      !this.motionBlur.neighborVelocityTexture ||
      !this.motionBlur.neighborVelocityTarget ||
      !this.motionBlur.texture ||
      !this.motionBlur.target
    ) {
      return currentTexture
    }

    this.context.frameRenderer.renderQueue(queue, this.motionBlurTilePipeline, {
      target: this.motionBlur.tileVelocityTarget,
      uniforms: { motionVectorTexture }
    })
    this.context.frameRenderer.renderQueue(queue, this.motionBlurNeighborPipeline, {
      target: this.motionBlur.neighborVelocityTarget,
      uniforms: {
        tileVelocityTexture: this.motionBlur.tileVelocityTexture,
        motionResolution: new Vector2([currentTexture.width, currentTexture.height]),
        maximumRadius: this.context.renderingSettings.motionBlur.maximumRadius
      }
    })

    const uniforms: MotionBlurUniforms = {
      isCameraBlurEnabled: hasCameraMotion,
      currentTexture,
      motionVectorTexture,
      neighborVelocityTexture: this.motionBlur.neighborVelocityTexture,
      depthTexture: this.frame.depthTexture,
      currentViewProjectionMatrix: this.frame.history.temporalAntialiasing.currentViewProjectionMatrix,
      previousViewProjectionMatrix: this.frame.history.temporalAntialiasing.previousViewProjectionMatrix,
      shutterAngle: this.context.renderingSettings.motionBlur.shutterAngle,
      maximumRadius: this.context.renderingSettings.motionBlur.maximumRadius,
      maximumSamples: this.context.renderingSettings.motionBlur.maximumSamples
    }

    this.context.frameRenderer.renderQueue(queue, this.motionBlurPipeline, {
      target: this.motionBlur.target,
      camera: this.frame.camera,
      uniforms
    })

    return this.motionBlur.texture
  }
}
