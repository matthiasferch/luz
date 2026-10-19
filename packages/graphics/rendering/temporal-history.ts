import { Vector4 } from '@luz/math'
import { ResourceScope } from '../resources/resource-scope'
import type { Camera, Transform } from '@luz/core'
import { Matrix4 } from '@luz/math'
import type { Scene } from '@luz/scene'
import type { ModelCompiler } from '../compilers/model-compiler'
import type { FrameRenderer } from '../renderer/frame-renderer'
import type { RenderBackend } from '../renderer/render-backend'
import type { RenderModel } from '../renderer/render-model'
import type { RenderPipeline } from '../renderer/render-pipeline'
import type { RenderQueue } from '../renderer/render-queue'
import type { Texture } from '../types/texture'
import { captureEntityMotionHistory } from './motion-history'
import type { TemporalAntialiasingUniforms } from './render-uniforms'
import { type RenderingSettings } from './settings'
import { createTemporalState } from './temporal-antialiasing'

import type { AmbientOcclusionState } from './ambient-occlusion'
import type { BlurState } from './motion-blur'

const MAXIMUM_TEMPORAL_SURFACE_ID = 0xffff

interface EffectContext {
  readonly viewport: { width: number; height: number }
  readonly backend: RenderBackend
  readonly ambientOcclusion: AmbientOcclusionState
  readonly motionBlur: BlurState
  readonly renderingSettings: RenderingSettings
  readonly frameRenderer: FrameRenderer
  readonly models: ModelCompiler
}
interface EffectFrame {
  readonly camera: Camera
  readonly depthTexture: Texture
  readonly scene: Scene
}

export class TemporalHistory {
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
  readonly temporalAntialiasing = createTemporalState()

  isMotionHistoryInitialized = false
  previousModelMatrices = new WeakMap<Transform, Matrix4>()
  previousBoneMatrices = new WeakMap<RenderModel, Float32Array>()
  temporalSurfaceIds = new WeakMap<Transform, number>()
  nextTemporalSurfaceId = 1
  temporalAntialiasingPipeline!: RenderPipeline
  prepareTemporalResources(isEnabled: boolean): void {
    if (!isEnabled) {
      this.destroyTemporalResources()

      return
    }

    if (
      this.temporalAntialiasing.historyTargets[0]?.width === this.context.viewport.width &&
      this.temporalAntialiasing.historyTargets[0].height === this.context.viewport.height
    ) {
      return
    }

    this.destroyTemporalResources()

    const { textures, buffers } = this.context.backend

    for (let index = 0; index < 2; ++index) {
      const texture = textures.create({
        width: this.context.viewport.width,
        height: this.context.viewport.height,
        precision: 16,
        filtering: 'bilinear'
      })
      const metadataTexture = textures.create({
        width: this.context.viewport.width,
        height: this.context.viewport.height,
        precision: 8,
        filtering: 'none'
      })
      const luminanceTexture = textures.create({
        width: this.context.viewport.width,
        height: this.context.viewport.height,
        precision: 8,
        filtering: 'none'
      })
      const frameBuffer = buffers.create('frameBuffer')

      buffers.attach(frameBuffer, texture, 0x8ce0)
      buffers.attach(frameBuffer, metadataTexture, 0x8ce1)
      buffers.attach(frameBuffer, luminanceTexture, 0x8ce2)
      this.temporalAntialiasing.historyTextures.push(texture)
      this.temporalAntialiasing.historyMetadataTextures.push(metadataTexture)
      this.temporalAntialiasing.historyLuminanceTextures.push(luminanceTexture)
      this.temporalAntialiasing.historyTargets.push({
        width: this.context.viewport.width,
        height: this.context.viewport.height,
        frameBuffer
      })
    }

    this.invalidateHistory()
  }

  destroyTemporalResources(): void {
    const { textures, buffers } = this.context.backend

    for (const target of this.temporalAntialiasing.historyTargets) {
      if (target.frameBuffer) {
        buffers.destroy(target.frameBuffer)
      }
    }

    for (const texture of [
      ...this.temporalAntialiasing.historyTextures,
      ...this.temporalAntialiasing.historyMetadataTextures,
      ...this.temporalAntialiasing.historyLuminanceTextures
    ]) {
      textures.destroy(texture)
    }

    this.temporalAntialiasing.historyTargets = []
    this.temporalAntialiasing.historyTextures = []
    this.temporalAntialiasing.historyMetadataTextures = []
    this.temporalAntialiasing.historyLuminanceTextures = []
    this.temporalAntialiasing.isHistoryValid = false
  }

  invalidateHistory(): void {
    this.isMotionHistoryInitialized = false
    this.previousModelMatrices = new WeakMap()
    this.previousBoneMatrices = new WeakMap()
    this.temporalAntialiasing.isHistoryValid = false
    this.temporalAntialiasing.historyLength = 0
    this.temporalAntialiasing.jitterIndex = 0
    this.context.ambientOcclusion.isHistoryValid = false
    this.context.ambientOcclusion.frameIndex = 0
  }

  calculateHalton(index: number, base: number): number {
    let result = 0
    let fraction = 1
    let value = index

    while (value > 0) {
      fraction /= base
      result += fraction * (value % base)
      value = Math.floor(value / base)
    }

    return result
  }

  prepareTemporalFrame(isJitterEnabled: boolean): void {
    Matrix4.multiply(
      this.frame.camera.projectionMatrix,
      this.frame.camera.viewMatrix,
      this.temporalAntialiasing.currentViewProjectionMatrix
    )

    if (!this.isMotionHistoryInitialized) {
      this.temporalAntialiasing.currentViewProjectionMatrix.copyTo(
        this.temporalAntialiasing.previousViewProjectionMatrix
      )
    }

    if (isJitterEnabled) {
      const sampleIndex = this.temporalAntialiasing.jitterIndex + 1
      const jitterX = this.calculateHalton(sampleIndex, 2) - 0.5
      const jitterY = this.calculateHalton(sampleIndex, 3) - 0.5

      this.frame.camera.projectionMatrix[8] += (2 * jitterX) / this.context.viewport.width
      this.frame.camera.projectionMatrix[9] += (2 * jitterY) / this.context.viewport.height

      Matrix4.multiply(
        this.frame.camera.projectionMatrix,
        this.frame.camera.viewMatrix,
        this.frame.camera.reconstructionMatrix
      ).invert()

      this.temporalAntialiasing.jitterIndex = (this.temporalAntialiasing.jitterIndex + 1) % 8
    }
  }

  resolveTemporalAntialiasing(queue: RenderQueue, currentTexture: Texture): Texture {
    if (
      !this.context.motionBlur.vectorTexture ||
      this.temporalAntialiasing.historyTargets.length !== 2 ||
      this.temporalAntialiasing.historyMetadataTextures.length !== 2 ||
      this.temporalAntialiasing.historyLuminanceTextures.length !== 2
    ) {
      return currentTexture
    }

    const writeIndex = 1 - this.temporalAntialiasing.historyIndex
    const uniforms: TemporalAntialiasingUniforms = {
      currentTexture,
      historyTexture: this.temporalAntialiasing.historyTextures[this.temporalAntialiasing.historyIndex],
      historyMetadataTexture: this.temporalAntialiasing.historyMetadataTextures[this.temporalAntialiasing.historyIndex],
      historyLuminanceTexture:
        this.temporalAntialiasing.historyLuminanceTextures[this.temporalAntialiasing.historyIndex],
      motionVectorTexture: this.context.motionBlur.vectorTexture,
      depthTexture: this.frame.depthTexture,
      currentViewProjectionMatrix: this.temporalAntialiasing.currentViewProjectionMatrix,
      previousViewProjectionMatrix: this.temporalAntialiasing.previousViewProjectionMatrix,
      isHistoryValid: this.temporalAntialiasing.isHistoryValid,
      historyLength: this.temporalAntialiasing.historyLength,
      areMotionVectorsVisualized: this.context.renderingSettings.debug.areMotionVectorsVisualized
    }

    this.context.frameRenderer.renderQueue(queue, this.temporalAntialiasingPipeline, {
      clear: { color: new Vector4([0, 0, 0, 1]) },
      target: this.temporalAntialiasing.historyTargets[writeIndex],
      camera: this.frame.camera,
      uniforms
    })

    this.temporalAntialiasing.historyIndex = writeIndex
    this.temporalAntialiasing.isHistoryValid = true
    this.temporalAntialiasing.historyLength = Math.min(this.temporalAntialiasing.historyLength + 1, 32)

    return this.temporalAntialiasing.historyTextures[writeIndex]
  }

  resolveTemporalSurfaceId(transform: Transform): number {
    const existingId = this.temporalSurfaceIds.get(transform)

    if (existingId !== undefined) {
      return existingId
    }

    if (this.nextTemporalSurfaceId > MAXIMUM_TEMPORAL_SURFACE_ID) {
      throw new Error('Temporal surface ownership exceeded the 16-bit identifier range')
    }

    const id = this.nextTemporalSurfaceId++

    this.temporalSurfaceIds.set(transform, id)

    return id
  }

  captureMotionHistory(): void {
    this.temporalAntialiasing.currentViewProjectionMatrix.copyTo(this.temporalAntialiasing.previousViewProjectionMatrix)
    captureEntityMotionHistory(
      this.frame.scene,
      this.previousModelMatrices,
      this.previousBoneMatrices,
      this.context.models
    )

    this.isMotionHistoryInitialized = true
  }
}
