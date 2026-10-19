import { ResourceScope } from '../resources/resource-scope'
import type { RenderBackend } from '../renderer/render-backend'
import type { RenderTarget } from '../renderer/render-target'
import type { Texture } from '../types/texture'

interface EffectContext {
  readonly backend: RenderBackend
  readonly viewport: { width: number; height: number }
}
export class TargetManager {
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
  areRenderTargetsPrepared = false
  arePersistentTexturesPrepared = false
  noiseTexture!: Texture
  sceneTexture!: Texture
  linearSceneTexture!: Texture
  linearSceneTarget!: RenderTarget
  compositeTexture!: Texture
  transmissionBackgroundTexture!: Texture
  transmissionDepthTexture!: Texture
  transmissionDepthTarget!: RenderTarget
  depthTexture!: Texture
  reflectanceLookupTexture!: Texture
  sceneTarget!: RenderTarget
  compositeTarget!: RenderTarget
  preparePersistentTextures() {
    if (this.arePersistentTexturesPrepared) {
      return
    }

    const { textures } = this.context.backend

    this.noiseTexture = textures.create({
      width: 512,
      height: 512,
      tiling: 'repeat',
      filtering: 'linear'
    })

    // Environment maps and the BRDF lookup do not depend on viewport size.
    // Keeping these textures alive preserves their loaded data across resizes.
    this.reflectanceLookupTexture = textures.create({ width: 256, height: 256, filtering: 'linear' })
    this.arePersistentTexturesPrepared = true
  }

  prepareRenderTargets(): void {
    this.areRenderTargetsPrepared = false

    this.preparePersistentTextures()

    const { textures, buffers } = this.context.backend

    if (this.sceneTarget?.frameBuffer) {
      buffers.destroy(this.sceneTarget.frameBuffer)
    }

    if (this.sceneTexture) {
      textures.destroy(this.sceneTexture)
    }

    if (this.depthTexture) {
      textures.destroy(this.depthTexture)
    }

    if (this.transmissionBackgroundTexture) {
      textures.destroy(this.transmissionBackgroundTexture)
    }

    this.sceneTexture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      precision: 32
    })
    this.transmissionBackgroundTexture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      precision: 32,
      filtering: 'bilinear'
    })
    this.depthTexture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      format: 'depth',
      precision: 24
    })

    const sceneBuffer = buffers.create('frameBuffer')

    buffers.attach(sceneBuffer, this.sceneTexture, 0x8ce0)
    buffers.attach(sceneBuffer, this.depthTexture, 0x8d00)

    this.sceneTarget = {
      width: this.sceneTexture.width,
      height: this.sceneTexture.height,
      frameBuffer: sceneBuffer
    }

    if (this.transmissionDepthTarget?.frameBuffer) {
      buffers.destroy(this.transmissionDepthTarget.frameBuffer)
    }

    if (this.transmissionDepthTexture) {
      textures.destroy(this.transmissionDepthTexture)
    }

    this.transmissionDepthTexture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      format: 'depth',
      precision: 24
    })

    const transmissionDepthBuffer = buffers.create('frameBuffer')

    buffers.attach(transmissionDepthBuffer, this.transmissionDepthTexture, 0x8d00)

    this.transmissionDepthTarget = {
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      frameBuffer: transmissionDepthBuffer
    }

    if (this.compositeTarget?.frameBuffer) {
      buffers.destroy(this.compositeTarget.frameBuffer)
    }

    if (this.compositeTexture) {
      textures.destroy(this.compositeTexture)
    }

    if (this.linearSceneTarget?.frameBuffer) {
      buffers.destroy(this.linearSceneTarget.frameBuffer)
    }

    if (this.linearSceneTexture) {
      textures.destroy(this.linearSceneTexture)
    }

    this.linearSceneTexture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      precision: 16,
      filtering: 'bilinear'
    })

    const linearSceneBuffer = buffers.create('frameBuffer')

    buffers.attach(linearSceneBuffer, this.linearSceneTexture, 0x8ce0)

    this.linearSceneTarget = {
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      frameBuffer: linearSceneBuffer
    }
    this.compositeTexture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      precision: 16,
      filtering: 'bilinear'
    })

    const compositeBuffer = buffers.create('frameBuffer')

    buffers.attach(compositeBuffer, this.compositeTexture, 0x8ce0)

    this.compositeTarget = {
      width: this.compositeTexture.width,
      height: this.compositeTexture.height,
      frameBuffer: compositeBuffer
    }
    this.areRenderTargetsPrepared = true
  }

  captureTransmissionDepth(target: RenderTarget): void {
    this.context.backend.copyDepth(target, this.transmissionDepthTarget)
  }

  captureTransmissionBackground(target: RenderTarget): void {
    this.context.backend.copyColorToTexture(target, this.transmissionBackgroundTexture)
  }
}
