import { ResourceScope } from '../resources/resource-scope'
import type { Camera, Transform } from '@luz/core'
import { Vector2, Vector3, Vector4 } from '@luz/math'
import type { FrameRenderer, RenderOptions } from '../renderer/frame-renderer'
import type { LightBatch } from '../renderer/light-batch'
import type { RenderBackend } from '../renderer/render-backend'
import type { RenderBatch } from '../renderer/render-batch'
import type { RenderFlow } from '../renderer/render-flow'
import type { RenderPipeline } from '../renderer/render-pipeline'
import { RenderQueue } from '../renderer/render-queue'
import type { Texture } from '../types/texture'
import { createDepthOfFieldState } from './depth-of-field'
import type { LightingUniforms } from './render-uniforms'
import type { DepthOfFieldSettings, EnvironmentSettings } from './settings'
import { BoundingBoxCalculator } from './bounding-box-calculator'

const emptyVector = Vector4.createZero()

interface EffectContext {
  readonly viewport: { width: number; height: number }
  readonly backend: RenderBackend
  readonly frameRenderer: FrameRenderer
  readonly environmentSettings: EnvironmentSettings
  readonly calculateEnvironmentRotation: () => number
}
interface EffectFrame {
  readonly depthTexture: Texture
  readonly camera: Camera
  readonly elapsedTime: number
  readonly environmentDiffuseTexture: Texture
  readonly environmentSpecularTexture: Texture
  readonly reflectanceLookupTexture: Texture
  readonly environmentDiffuseCubeTexture: Texture | undefined
  readonly environmentSpecularCubeTexture: Texture | undefined
  readonly environmentSpecularCubeMaximumLevelOfDetail: number
  readonly environmentSpecular2DMaximumLevelOfDetail: number | undefined
  readonly isCubeEnvironmentEnabled: boolean
}

export class FocusEffect {
  private readonly scope: ResourceScope
  private readonly context: EffectContext
  private readonly boundingBoxes = new BoundingBoxCalculator()

  constructor(context: EffectContext) {
    this.scope = new ResourceScope(context.backend)
    this.context = Object.create(context) as EffectContext

    Object.defineProperty(this.context, 'backend', { value: this.scope.backend })
  }

  destroy(): void {
    this.scope.destroy()
    this.boundingBoxes.clear()
  }

  private frame!: EffectFrame

  beginFrame(frame: EffectFrame): void {
    this.frame = frame
  }
  readonly depthOfField = createDepthOfFieldState()

  depthOfFieldDilatePipeline!: RenderPipeline
  depthOfFieldPrefilterPipeline!: RenderPipeline
  depthOfFieldLayersPipeline!: RenderPipeline
  depthOfFieldBackingDepthPipeline!: RenderPipeline
  depthOfFieldBackingAmbientPipeline!: RenderPipeline
  depthOfFieldSurfacePipeline!: RenderPipeline
  prepareDepthOfFieldResources(isEnabled: boolean): void {
    if (!isEnabled) {
      this.destroyDepthOfFieldResources()

      return
    }

    if (
      this.depthOfField.surfaceTarget?.width === this.context.viewport.width &&
      this.depthOfField.surfaceTarget.height === this.context.viewport.height
    ) {
      return
    }

    this.destroyDepthOfFieldResources()

    const { textures, buffers } = this.context.backend

    this.depthOfField.surfaceTexture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      precision: 8,
      filtering: 'none'
    })

    const depthOfFieldSurfaceBuffer = buffers.create('frameBuffer')

    buffers.attach(depthOfFieldSurfaceBuffer, this.depthOfField.surfaceTexture, 0x8ce0)
    buffers.attach(depthOfFieldSurfaceBuffer, this.frame.depthTexture, 0x8d00)

    this.depthOfField.surfaceTarget = {
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      frameBuffer: depthOfFieldSurfaceBuffer
    }

    const depthOfFieldWidth = Math.max(1, Math.ceil(this.context.viewport.width / 2))
    const depthOfFieldHeight = Math.max(1, Math.ceil(this.context.viewport.height / 2))

    for (let index = 0; index < 2; ++index) {
      const texture = textures.create({
        width: depthOfFieldWidth,
        height: depthOfFieldHeight,
        format: 'red',
        precision: 16,
        filtering: 'bilinear'
      })
      const frameBuffer = buffers.create('frameBuffer')

      buffers.attach(frameBuffer, texture, 0x8ce0)
      this.depthOfField.radiusTextures.push(texture)
      this.depthOfField.radiusTargets.push({ width: depthOfFieldWidth, height: depthOfFieldHeight, frameBuffer })
    }

    this.depthOfField.prefilterTexture = textures.create({
      width: depthOfFieldWidth,
      height: depthOfFieldHeight,
      precision: 16,
      filtering: 'bilinear'
    })

    const depthOfFieldPrefilterBuffer = buffers.create('frameBuffer')

    buffers.attach(depthOfFieldPrefilterBuffer, this.depthOfField.prefilterTexture, 0x8ce0)

    this.depthOfField.prefilterTarget = {
      width: depthOfFieldWidth,
      height: depthOfFieldHeight,
      frameBuffer: depthOfFieldPrefilterBuffer
    }

    const depthOfFieldLayerBuffer = buffers.create('frameBuffer')

    for (let index = 0; index < 2; ++index) {
      const texture = textures.create({
        width: depthOfFieldWidth,
        height: depthOfFieldHeight,
        precision: 16,
        filtering: 'bilinear'
      })

      buffers.attach(depthOfFieldLayerBuffer, texture, 0x8ce0 + index)
      this.depthOfField.layerTextures.push(texture)
    }

    this.depthOfField.layerTarget = {
      width: depthOfFieldWidth,
      height: depthOfFieldHeight,
      frameBuffer: depthOfFieldLayerBuffer
    }
  }

  destroyDepthOfFieldResources(): void {
    const { textures, buffers } = this.context.backend

    if (this.depthOfField.prefilterTarget?.frameBuffer) {
      buffers.destroy(this.depthOfField.prefilterTarget.frameBuffer)
    }

    if (this.depthOfField.prefilterTexture) {
      textures.destroy(this.depthOfField.prefilterTexture)
    }

    this.depthOfField.prefilterTarget = undefined
    this.depthOfField.prefilterTexture = undefined

    this.destroyBackingResources()

    if (this.depthOfField.surfaceTarget?.frameBuffer) {
      buffers.destroy(this.depthOfField.surfaceTarget.frameBuffer)
    }

    if (this.depthOfField.surfaceTexture) {
      textures.destroy(this.depthOfField.surfaceTexture)
    }

    this.depthOfField.surfaceTarget = undefined
    this.depthOfField.surfaceTexture = undefined

    for (const target of this.depthOfField.radiusTargets) {
      if (target.frameBuffer) {
        buffers.destroy(target.frameBuffer)
      }
    }

    for (const texture of this.depthOfField.radiusTextures) {
      textures.destroy(texture)
    }

    this.depthOfField.radiusTargets = []
    this.depthOfField.radiusTextures = []

    if (this.depthOfField.layerTarget?.frameBuffer) {
      buffers.destroy(this.depthOfField.layerTarget.frameBuffer)
    }

    for (const texture of this.depthOfField.layerTextures) {
      textures.destroy(texture)
    }

    this.depthOfField.layerTarget = undefined
    this.depthOfField.layerTextures = []
  }

  private prepareBackingResources(): void {
    if (this.depthOfField.backingTarget) {
      return
    }

    const { textures, buffers } = this.context.backend

    this.depthOfField.backingTexture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      precision: 16,
      filtering: 'bilinear'
    })
    this.depthOfField.backingDepthTexture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      format: 'depth',
      precision: 24
    })

    const depthOfFieldBackingBuffer = buffers.create('frameBuffer')

    buffers.attach(depthOfFieldBackingBuffer, this.depthOfField.backingTexture, 0x8ce0)
    buffers.attach(depthOfFieldBackingBuffer, this.depthOfField.backingDepthTexture, 0x8d00)

    this.depthOfField.backingTarget = {
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      frameBuffer: depthOfFieldBackingBuffer
    }
  }

  private destroyBackingResources(): void {
    const { textures, buffers } = this.context.backend

    if (this.depthOfField.backingTarget?.frameBuffer) {
      buffers.destroy(this.depthOfField.backingTarget.frameBuffer)
    }

    if (this.depthOfField.backingTexture) {
      textures.destroy(this.depthOfField.backingTexture)
    }

    this.depthOfField.backingTarget = undefined
    this.depthOfField.backingTexture = undefined

    if (this.depthOfField.backingDepthTexture) {
      textures.destroy(this.depthOfField.backingDepthTexture)
    }

    this.depthOfField.backingDepthTexture = undefined
  }

  requiresBackingLayer(batches: readonly RenderBatch[], settings: DepthOfFieldSettings): boolean {
    if (settings.maximumBlurRadius <= 0.25) {
      return false
    }

    const camera = this.frame.camera
    const optics = settings.isCameraOverridden ? settings : camera
    const focalLength = Math.max(optics.focalLength * 0.001, 1e-6)
    const sensorHeight = Math.max(optics.sensorHeight * 0.001, 1e-6)
    const focusDistance = Math.max(optics.focusDistance, focalLength + 1e-4)
    const radiusScale =
      (0.5 * focalLength * focalLength * this.context.viewport.height) /
      (sensorHeight * Math.max(optics.fStop, 0.1) * (focusDistance - focalLength))
    const view = camera.viewMatrix

    return batches.some((batch) => {
      if (!batch.model.source.isVisible) {
        return false
      }

      const boundingBox = this.boundingBoxes.calculate(batch.model.source, batch.transform)

      if (!boundingBox) {
        return true
      }

      const { minimum, maximum } = boundingBox
      const nearestDepth = Math.max(
        camera.clipPlanes.x,
        focalLength + 1e-4,
        -view[14] -
          view[2] * (view[2] >= 0 ? maximum.x : minimum.x) -
          view[6] * (view[6] >= 0 ? maximum.y : minimum.y) -
          view[10] * (view[10] >= 0 ? maximum.z : minimum.z)
      )

      return nearestDepth < focusDistance && radiusScale * (focusDistance / nearestDepth - 1) > 0.25
    })
  }

  renderDepthOfFieldSurfaceOwnership(surfaceBatches: RenderBatch[]): void {
    if (!this.depthOfField.surfaceTarget || !this.depthOfField.surfaceTexture) {
      return
    }

    const surfaceQueue = new RenderQueue()
    const surfaceIds = new Map<Transform, Vector3>()

    // Zero is reserved for cleared/background pixels.
    let surfaceIndex = 1

    for (const batch of surfaceBatches) {
      let surfaceId = surfaceIds.get(batch.transform)

      if (!surfaceId) {
        if (surfaceIndex > 0xffffff) {
          throw new Error('Depth-of-field surface ownership exceeded the 24-bit identifier range')
        }

        surfaceId = new Vector3([
          (surfaceIndex & 0xff) / 255,
          ((surfaceIndex >> 8) & 0xff) / 255,
          ((surfaceIndex >> 16) & 0xff) / 255
        ])

        surfaceIds.set(batch.transform, surfaceId)

        surfaceIndex += 1
      }

      const meshNames = batch.meshes?.length ? batch.meshes : Object.keys(batch.model.primitives)

      for (const meshName of meshNames) {
        if (!batch.model.primitives[meshName]) {
          continue
        }

        surfaceQueue.batches.push({
          ...batch,
          meshes: [meshName],
          uniforms: {
            ...(batch.uniforms ?? {}),
            depthOfFieldSurfaceId: surfaceId
          }
        })
      }
    }

    surfaceQueue.sortByMaterialThenDepth()
    surfaceQueue.render(this.context.backend, this.depthOfFieldSurfacePipeline, {
      camera: this.frame.camera,
      target: this.depthOfField.surfaceTarget,
      clear: { color: emptyVector },
      uniforms: { clipPlane: emptyVector }
    })
  }

  renderDepthOfFieldBackingLayer(
    opaqueBatches: RenderBatch[],
    surfaceBatches: RenderBatch[],
    lightBatches: LightBatch[],
    pipelines: RenderFlow['pipelines'],
    lightStageUniforms: LightingUniforms,
    resolveShadowTexture: RenderOptions['resolveShadowTexture'],
    settings: DepthOfFieldSettings
  ): void {
    this.renderDepthOfFieldSurfaceOwnership(surfaceBatches)

    if (!this.requiresBackingLayer(surfaceBatches, settings) || opaqueBatches.length === 0) {
      this.destroyBackingResources()

      return
    }

    this.prepareBackingResources()

    const viewportSize = new Vector2([this.depthOfField.backingTarget!.width, this.depthOfField.backingTarget!.height])

    this.context.frameRenderer.clear()
    this.context.frameRenderer.renderFrame(
      {
        depth: this.depthOfFieldBackingDepthPipeline,
        ambient: this.depthOfFieldBackingAmbientPipeline,
        lighting: pipelines.lighting
      },
      {
        camera: this.frame.camera,
        time: this.frame.elapsedTime,
        target: this.depthOfField.backingTarget!
      },
      lightBatches,
      opaqueBatches,
      [],
      {
        clear: { depth: { depth: 1 }, ambient: { color: emptyVector } },
        resolveShadowTexture,
        overrideStates: {
          // Both shading stages must match the depth established by the peel
          // pass, otherwise fragments from the visible layer can leak back in.
          ambient: { depthTest: 'equal', depthMask: false },
          lighting: { depthTest: 'equal', depthMask: false }
        },
        additionalUniforms: {
          depth: {
            clipPlane: emptyVector,
            isDepthPeelingEnabled: true,
            depthPeelTexture: this.frame.depthTexture,
            depthPeelViewportSize: viewportSize
          },
          ambient: {
            ambientBrightness: this.context.environmentSettings.ambientBrightness,
            environmentDiffuseTexture: this.frame.environmentDiffuseTexture,
            environmentDiffuseStrength: this.context.environmentSettings.diffuseStrength,
            environmentSpecularTexture: this.frame.environmentSpecularTexture,
            reflectanceLookupTexture: this.frame.reflectanceLookupTexture,
            ...(this.frame.environmentDiffuseCubeTexture
              ? { environmentDiffuseCube: this.frame.environmentDiffuseCubeTexture }
              : {}),
            ...(this.frame.environmentSpecularCubeTexture
              ? { environmentSpecularCube: this.frame.environmentSpecularCubeTexture }
              : {}),
            environmentSpecularMaximumLevelOfDetail: this.frame.environmentSpecularCubeTexture
              ? this.frame.environmentSpecularCubeMaximumLevelOfDetail
              : (this.frame.environmentSpecular2DMaximumLevelOfDetail ??
                Math.floor(
                  Math.log2(
                    Math.max(this.frame.environmentSpecularTexture.width, this.frame.environmentSpecularTexture.height)
                  )
                )),
            environmentSpecularStrength: this.context.environmentSettings.specularStrength,
            environmentRotation: this.context.calculateEnvironmentRotation(),
            isCubeEnvironmentEnabled: this.frame.isCubeEnvironmentEnabled,
            clipPlane: emptyVector,
            isFrontFaceReversed: false,
            isPlanarReflectionEnabled: false,
            ambientOcclusionTexture: this.context.backend.defaultTexture,
            isScreenOcclusionEnabled: false,
            isAmbientOcclusionVisualized: false
          },
          lighting: {
            ...lightStageUniforms,
            ambientOcclusionTexture: this.context.backend.defaultTexture,
            isScreenOcclusionEnabled: false
          }
        }
      }
    )
  }
}
