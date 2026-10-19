import { ResourceScope } from '../resources/resource-scope'
import type { RenderBackend } from '../renderer/render-backend'
import type { RenderPipeline } from '../renderer/render-pipeline'
import type { RenderTarget } from '../renderer/render-target'
import { createBloomState } from './bloom'

interface EffectContext {
  readonly viewport: { width: number; height: number }
  readonly backend: RenderBackend
}
export class BloomEffect {
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
  readonly bloom = createBloomState()

  bloomDownsamplePipeline!: RenderPipeline
  bloomUpsamplePipeline!: RenderPipeline
  bloomExtractPipeline!: RenderPipeline
  prepareBloomResources(isEnabled: boolean): void {
    if (!isEnabled) {
      this.destroyBloomResources()

      return
    }

    if (
      this.bloom.targets[0]?.width === Math.max(1, Math.floor(this.context.viewport.width / 2)) &&
      this.bloom.targets[0].height === Math.max(1, Math.floor(this.context.viewport.height / 2))
    ) {
      return
    }

    this.destroyBloomResources()

    const { textures, buffers } = this.context.backend

    let levelWidth = Math.max(1, Math.floor(this.context.viewport.width / 2))
    let levelHeight = Math.max(1, Math.floor(this.context.viewport.height / 2))

    const brightTexture = textures.create({
      width: levelWidth,
      height: levelHeight,
      precision: 16,
      filtering: 'bilinear'
    })
    const brightBuffer = buffers.create('frameBuffer')

    buffers.attach(brightBuffer, brightTexture, 0x8ce0)

    const brightTarget: RenderTarget = {
      width: brightTexture.width,
      height: brightTexture.height,
      frameBuffer: brightBuffer
    }

    this.bloom.levels.push(brightTexture)
    this.bloom.targets.push(brightTarget)

    levelWidth = Math.max(1, Math.floor(levelWidth / 2))
    levelHeight = Math.max(1, Math.floor(levelHeight / 2))

    const maximumLevels = 5

    while (this.bloom.levels.length < maximumLevels && levelWidth >= 2 && levelHeight >= 2) {
      const texture = textures.create({
        width: levelWidth,
        height: levelHeight,
        precision: 16,
        filtering: 'bilinear'
      })
      const framebuffer = buffers.create('frameBuffer')

      buffers.attach(framebuffer, texture, 0x8ce0)

      const target: RenderTarget = { width: levelWidth, height: levelHeight, frameBuffer: framebuffer }

      this.bloom.levels.push(texture)
      this.bloom.targets.push(target)

      levelWidth = Math.max(1, Math.floor(levelWidth / 2))
      levelHeight = Math.max(1, Math.floor(levelHeight / 2))
    }
  }

  destroyBloomResources(): void {
    const { textures, buffers } = this.context.backend

    for (const target of this.bloom.targets) {
      if (target.frameBuffer) {
        buffers.destroy(target.frameBuffer)
      }
    }

    for (const texture of this.bloom.levels) {
      textures.destroy(texture)
    }

    this.bloom.targets = []
    this.bloom.levels = []
    this.bloom.texture = undefined
  }
}
