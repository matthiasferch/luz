import type { Light } from '@luz/core'
import type { FrameBuffer } from '../buffers/frame-buffer'
import type { ModelCompiler } from '../compilers/model-compiler'
import { FrameRenderer } from '../renderer/frame-renderer'
import type { LightBatch } from '../renderer/light-batch'
import type { RenderBackend } from '../renderer/render-backend'
import type { RenderPipeline } from '../renderer/render-pipeline'
import type { RenderTarget } from '../renderer/render-target'
import { ResourceScope } from '../resources/resource-scope'
import type { Texture } from '../types/texture'

interface ShadowMap {
  texture: Texture
  target: RenderTarget
}

export class ShadowRenderer {
  private readonly scope: ResourceScope
  private readonly renderer: FrameRenderer
  private readonly maps = new Map<Light, ShadowMap>()
  private readonly renderedLights = new Set<Light>()

  constructor(backend: RenderBackend, models: ModelCompiler) {
    this.scope = new ResourceScope(backend)
    this.renderer = new FrameRenderer(backend, (model) => models.requireCompiledModel(model))
  }

  beginFrame(lights: readonly Light[], isEnabled: boolean): void {
    const activeLights = new Set(isEnabled ? lights : [])

    this.renderedLights.clear()

    for (const [light, map] of this.maps) {
      if (!activeLights.has(light)) {
        this.scope.backend.buffers.destroy(map.target.frameBuffer!)
        this.scope.backend.textures.destroy(map.texture)
        this.maps.delete(light)
      }
    }
  }

  render(batch: LightBatch, pipeline: RenderPipeline): Texture {
    let map = this.maps.get(batch.light)

    if (!map) {
      const { textures, buffers } = this.scope.backend
      const texture = textures.create({ width: 2048, height: 2048, format: 'depth', precision: 32 })

      let frameBuffer: FrameBuffer | undefined

      try {
        frameBuffer = buffers.create('frameBuffer')

        buffers.attach(frameBuffer, texture, 0x8d00)
      } catch (error) {
        if (frameBuffer) {
          buffers.destroy(frameBuffer)
        }

        textures.destroy(texture)
        throw error
      }

      map = { texture, target: { width: texture.width, height: texture.height, frameBuffer } }

      this.maps.set(batch.light, map)
    }

    if (!this.renderedLights.has(batch.light)) {
      this.renderer.clear()
      this.renderer.renderFrame(
        { shadowMapping: pipeline },
        { camera: batch.light.shadowCamera, target: map.target, time: 0 },
        [batch],
        [],
        [],
        { clear: { shadowMapping: { depth: 1 } } }
      )
      this.renderedLights.add(batch.light)
    }

    return map.texture
  }

  destroy(): void {
    this.scope.destroy()
    this.maps.clear()
    this.renderedLights.clear()
  }
}
