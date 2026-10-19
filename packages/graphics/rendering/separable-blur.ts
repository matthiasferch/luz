import type { Camera } from '@luz/core'
import { Transform } from '@luz/core'
import { Vector2 } from '@luz/math'
import { Model } from '../model'
import { Mesh } from '../renderer/mesh'
import type { ClearOptions, RenderBackend } from '../renderer/render-backend'
import type { RenderModel } from '../renderer/render-model'
import type { RenderPipeline } from '../renderer/render-pipeline'
import { RenderQueue } from '../renderer/render-queue'
import type { RenderTarget } from '../renderer/render-target'
import type { Texture } from '../types/texture'

export interface BlurConfiguration {
  pipeline: RenderPipeline
  clear?: Partial<ClearOptions>
  sourceUniform: string
  directionUniform: string
  isCameraRequired: boolean
  parameters: object
}

export class SeparableBlurEffect {
  private readonly origin = Transform.createOrigin()

  private overlayModel: RenderModel | null = null
  private temporaryCache = new Map<string, { texture: Texture; target: RenderTarget }>()
  private temporaryTexture: Texture | null = null
  private temporaryTarget: RenderTarget | null = null

  constructor(private backend: RenderBackend) {}

  render(
    pipeline: RenderPipeline,
    sourceTexture: Texture,
    destinationTarget: RenderTarget,
    extraUniforms?: object,
    camera?: Camera | null,
    uniformConfiguration?: { sourceUniform?: string; directionUniform?: string; clear?: Partial<ClearOptions> }
  ) {
    const sourceUniform = uniformConfiguration?.sourceUniform ?? 'baseTexture'
    const directionUniform = uniformConfiguration?.directionUniform ?? 'direction'

    const overlay = this.ensureOverlayModel()
    const temporaryTarget = this.ensureTemporaryTarget(destinationTarget, sourceTexture)
    const temporaryTexture = this.temporaryTexture!

    const queue = new RenderQueue()

    queue.batches.push({
      transform: this.origin,
      model: overlay
    })
    queue.sortByMaterialThenDepth()
    queue.render(this.backend, pipeline, {
      camera: camera ?? undefined,
      clear: uniformConfiguration?.clear,
      target: temporaryTarget,
      uniforms: {
        ...(extraUniforms ?? {}),
        [sourceUniform]: sourceTexture,
        [directionUniform]: new Vector2([1.0, 0.0])
      }
    })
    queue.render(this.backend, pipeline, {
      camera: camera ?? undefined,
      clear: uniformConfiguration?.clear,
      target: destinationTarget,
      uniforms: {
        ...(extraUniforms ?? {}),
        [sourceUniform]: temporaryTexture,
        [directionUniform]: new Vector2([0.0, 1.0])
      }
    })
  }

  private ensureOverlayModel() {
    if (this.overlayModel) {
      return this.overlayModel
    }

    const vertices = [
      -1, -1, 0, 0, 0, 1, 0, 0, 1, -1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, -1, 1, 0, 0, 0, 1, 0, 1
    ] as number[]

    const indices = [0, 1, 2, 0, 2, 3]

    const mesh = new Mesh({ topology: 'triangles', vertices, indices, weights: [] })
    const model = new Model({ meshes: { quad: mesh } })

    this.overlayModel = {
      source: model,
      materials: {},
      primitives: {
        quad: this.backend.primitives.create(mesh, this.backend.defaultMaterial)
      }
    }

    return this.overlayModel
  }

  private ensureTemporaryTarget(destination: RenderTarget, likeTexture: Texture) {
    const isFloat = likeTexture.dataType === 0x1406
    const precision = isFloat ? 32 : 8
    const key = `${destination.width}x${destination.height}_${precision}`

    let entry = this.temporaryCache.get(key)

    if (!entry) {
      const temporaryTexture = this.backend.textures.create({
        width: destination.width,
        height: destination.height,
        precision,
        filtering: 'linear'
      })

      const frameBuffer = this.backend.buffers.create('frameBuffer')

      this.backend.buffers.attach(frameBuffer, temporaryTexture, 0x8ce0)

      entry = {
        texture: temporaryTexture,
        target: { width: destination.width, height: destination.height, frameBuffer }
      }

      this.temporaryCache.set(key, entry)
    }

    this.temporaryTexture = entry.texture
    this.temporaryTarget = entry.target

    return this.temporaryTarget
  }

  clearCache() {
    for (const { texture, target } of this.temporaryCache.values()) {
      this.backend.textures.destroy(texture)

      if (target.frameBuffer) {
        this.backend.buffers.destroy(target.frameBuffer)
      }
    }

    this.temporaryCache.clear()

    this.temporaryTexture = null
    this.temporaryTarget = null
  }
}
