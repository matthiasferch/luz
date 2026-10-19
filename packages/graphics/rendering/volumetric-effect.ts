import { ResourceScope } from '../resources/resource-scope'
import { Transform } from '@luz/core'
import { Vector2 } from '@luz/math'
import type { FrameRenderer } from '../renderer/frame-renderer'
import type { RenderBackend } from '../renderer/render-backend'
import type { RenderModel } from '../renderer/render-model'
import type { RenderPipeline } from '../renderer/render-pipeline'
import { RenderQueue } from '../renderer/render-queue'
import type { RenderTarget } from '../renderer/render-target'
import type { Texture } from '../types/texture'
import { type RenderingSettings } from './settings'
import { createVolumetricLightingState } from './volumetric-lighting'
import { calculateVolumetricTargetSize } from './volumetric-quality'

interface VolumetricTarget {
  texture: Texture
  target: RenderTarget
}

const origin = Transform.createOrigin()

interface EffectContext {
  readonly backend: RenderBackend
  readonly fullscreenModel: RenderModel
  readonly frameRenderer: FrameRenderer
  readonly viewport: { width: number; height: number }
  readonly renderingSettings: RenderingSettings
}
export class VolumetricLighting {
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
  readonly volumetricLighting = createVolumetricLightingState()

  volumetricCompositePipeline!: RenderPipeline
  volumetricDepthPipeline!: RenderPipeline
  captureVolumetricDepth(depthTexture: Texture, target: RenderTarget): void {
    const queue = new RenderQueue()

    queue.batches.push({ transform: origin, model: this.context.fullscreenModel })
    this.context.frameRenderer.renderQueue(queue, this.volumetricDepthPipeline, {
      target,
      uniforms: { depthTexture, destinationSize: new Vector2([target.width, target.height]) }
    })
  }

  prepareVolumetricTarget(): void {
    const { textures, buffers } = this.context.backend
    const size = calculateVolumetricTargetSize(
      this.context.viewport.width,
      this.context.viewport.height,
      this.context.renderingSettings.volumetricLighting.quality
    )

    if (this.volumetricLighting.target?.width === size.width && this.volumetricLighting.target.height === size.height) {
      return
    }

    if (this.volumetricLighting.target?.frameBuffer) {
      buffers.destroy(this.volumetricLighting.target.frameBuffer)
    }

    if (this.volumetricLighting.texture) {
      textures.destroy(this.volumetricLighting.texture)
    }

    if (this.volumetricLighting.depthTarget?.frameBuffer) {
      buffers.destroy(this.volumetricLighting.depthTarget.frameBuffer)
    }

    if (this.volumetricLighting.depthTexture) {
      textures.destroy(this.volumetricLighting.depthTexture)
    }

    const depthSnapshot = createVolumetricDepthTarget(this.context.backend, size)

    this.volumetricLighting.depthTexture = depthSnapshot.texture
    this.volumetricLighting.depthTarget = depthSnapshot.target
    this.volumetricLighting.texture = textures.create({ ...size, precision: 32, filtering: 'bilinear' })

    const frameBuffer = buffers.create('frameBuffer')

    buffers.attach(frameBuffer, this.volumetricLighting.texture, 0x8ce0)

    this.volumetricLighting.target = { ...size, frameBuffer }
  }
}

export function createVolumetricDepthTarget(
  backend: RenderBackend,
  size: { width: number; height: number }
): VolumetricTarget {
  const texture = backend.textures.create({ ...size, format: 'red', precision: 32, filtering: 'none' })
  const frameBuffer = backend.buffers.create('frameBuffer')

  backend.buffers.attach(frameBuffer, texture, 0x8ce0)

  return { texture, target: { ...size, frameBuffer } }
}
