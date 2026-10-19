import { ResourceScope } from '../resources/resource-scope'
import { createVolumetricDepthTarget } from './volumetric-effect'
import type { Entity, Reflector } from '@luz/core'
import { Camera, isReflector } from '@luz/core'
import type { Vector4 } from '@luz/math'
import { Matrix4, Vector2, Vector3 } from '@luz/math'
import type { Scene } from '@luz/scene'
import type { RenderBackend } from '../renderer/render-backend'
import type { RenderBatch } from '../renderer/render-batch'
import {
  createReflectionState,
  type ReflectorBinding,
  type ReflectorResources,
  type TransmissionResources
} from './reflections'
import { type RenderingSettings } from './settings'
import { calculateVolumetricTargetSize } from './volumetric-quality'

interface EffectContext {
  readonly backend: RenderBackend
  readonly viewport: { width: number; height: number }
  readonly renderingSettings: RenderingSettings
}
interface EffectFrame {
  readonly scene: Scene
  readonly camera: Camera
}

export class ReflectionRenderer {
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
  readonly reflections = createReflectionState()
  readonly reflectionCamera = new Camera()
  createReflectorResources(reflector: Reflector): ReflectorResources {
    const { textures, buffers } = this.context.backend
    const resolutionScale = Math.max(0.1, Math.min(1, reflector.resolutionScale))
    const width = Math.max(1, Math.round(this.context.viewport.width * resolutionScale))
    const height = Math.max(1, Math.round(this.context.viewport.height * resolutionScale))

    const texture = textures.create({
      width,
      height,
      precision: 32,
      filtering: 'linear'
    })
    const blurredTexture = textures.create({
      width,
      height,
      precision: 32,
      filtering: 'linear'
    })

    const frameBuffer = buffers.create('frameBuffer')
    const blurredFrameBuffer = buffers.create('frameBuffer')
    const colorFrameBuffer = buffers.create('frameBuffer')
    const volumetricFrameBuffer = buffers.create('frameBuffer')
    const depthTexture = textures.create({ width, height, format: 'depth', precision: 24 })
    const volumeSize = calculateVolumetricTargetSize(
      width,
      height,
      this.context.renderingSettings.volumetricLighting.quality
    )
    const volumetricTexture = textures.create({ ...volumeSize, precision: 32, filtering: 'bilinear' })
    const depthSnapshot = createVolumetricDepthTarget(this.context.backend, volumeSize)

    buffers.attach(frameBuffer, texture, 0x8ce0)
    buffers.attach(blurredFrameBuffer, blurredTexture, 0x8ce0)
    buffers.attach(frameBuffer, depthTexture, 0x8d00)

    // The resolve samples depth, so its destination must not attach that depth texture.
    buffers.attach(colorFrameBuffer, texture, 0x8ce0)
    buffers.attach(volumetricFrameBuffer, volumetricTexture, 0x8ce0)

    return {
      texture,
      blurredTexture,
      target: { width, height, frameBuffer },
      blurredTarget: { width, height, frameBuffer: blurredFrameBuffer },
      depthTexture,
      colorTarget: { width, height, frameBuffer: colorFrameBuffer },
      volumetricTexture,
      volumetricDepthTexture: depthSnapshot.texture,
      volumetricDepthTarget: depthSnapshot.target,
      volumetricTarget: { ...volumeSize, frameBuffer: volumetricFrameBuffer }
    }
  }

  destroyReflectorResources(resources: ReflectorResources): void {
    const { textures, buffers } = this.context.backend

    if (resources.target.frameBuffer) {
      buffers.destroy(resources.target.frameBuffer)
    }

    if (resources.blurredTarget.frameBuffer) {
      buffers.destroy(resources.blurredTarget.frameBuffer)
    }

    if (resources.colorTarget.frameBuffer) {
      buffers.destroy(resources.colorTarget.frameBuffer)
    }

    if (resources.volumetricTarget.frameBuffer) {
      buffers.destroy(resources.volumetricTarget.frameBuffer)
    }

    textures.destroy(resources.depthTexture)
    textures.destroy(resources.volumetricTexture)
    textures.destroy(resources.volumetricDepthTexture)

    if (resources.volumetricDepthTarget.frameBuffer) {
      buffers.destroy(resources.volumetricDepthTarget.frameBuffer)
    }

    textures.destroy(resources.texture)
    textures.destroy(resources.blurredTexture)
  }

  createTransmissionLightingResources(): TransmissionResources {
    const { textures, buffers } = this.context.backend
    const texture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      precision: 32
    })
    const depthTexture = textures.create({
      width: this.context.viewport.width,
      height: this.context.viewport.height,
      format: 'depth',
      precision: 24
    })
    const frameBuffer = buffers.create('frameBuffer')

    buffers.attach(frameBuffer, texture, 0x8ce0)
    buffers.attach(frameBuffer, depthTexture, 0x8d00)

    return {
      texture,
      depthTexture,
      target: { width: texture.width, height: texture.height, frameBuffer }
    }
  }

  destroyTransmissionLightingResources(): void {
    const { textures, buffers } = this.context.backend

    for (const resources of this.reflections.transmissionLighting) {
      if (resources.target.frameBuffer) {
        buffers.destroy(resources.target.frameBuffer)
      }

      textures.destroy(resources.depthTexture)
      textures.destroy(resources.texture)
    }

    this.reflections.transmissionLighting = []
  }

  synchronizeTransmissionLightingResources(count: number): void {
    while (this.reflections.transmissionLighting.length > count) {
      const resources = this.reflections.transmissionLighting.pop()!

      if (resources.target.frameBuffer) {
        this.context.backend.buffers.destroy(resources.target.frameBuffer)
      }

      this.context.backend.textures.destroy(resources.depthTexture)
      this.context.backend.textures.destroy(resources.texture)
    }

    while (this.reflections.transmissionLighting.length < count) {
      this.reflections.transmissionLighting.push(this.createTransmissionLightingResources())
    }
  }

  synchronizeReflectorResources(): void {
    const bindings: ReflectorBinding[] = []

    for (const entity of this.frame.scene.collectEntities()) {
      for (const component of Object.values(entity.components)) {
        if (isReflector(component)) {
          bindings.push({ entity, reflector: component })
        }
      }
    }

    this.reflections.bindings = bindings

    const areReflectionsEnabled = this.context.renderingSettings.planarReflections.isEnabled
    const activeReflectors = new Set(areReflectionsEnabled ? bindings.map(({ reflector }) => reflector) : [])

    for (const [reflector, resources] of this.reflections.resources) {
      if (!activeReflectors.has(reflector)) {
        this.destroyReflectorResources(resources)
        this.reflections.resources.delete(reflector)
      }
    }

    if (!areReflectionsEnabled) {
      this.reflections.renderedCount = 0

      return
    }

    for (const { reflector } of bindings) {
      const resolutionScale = Math.max(0.1, Math.min(1, reflector.resolutionScale))
      const width = Math.max(1, Math.round(this.context.viewport.width * resolutionScale))
      const height = Math.max(1, Math.round(this.context.viewport.height * resolutionScale))
      const resources = this.reflections.resources.get(reflector)
      const volumeSize = calculateVolumetricTargetSize(
        width,
        height,
        this.context.renderingSettings.volumetricLighting.quality
      )

      if (
        resources &&
        resources.target.width === width &&
        resources.target.height === height &&
        resources.volumetricTarget.width === volumeSize.width &&
        resources.volumetricTarget.height === volumeSize.height
      ) {
        continue
      }

      if (resources) {
        this.destroyReflectorResources(resources)
      }

      this.reflections.resources.set(reflector, this.createReflectorResources(reflector))
    }
  }

  updateReflectorCamera(reflector: Reflector): Vector4 {
    const reflectionPlane = reflector.worldPlane.clone()
    const cameraPosition = this.frame.camera.viewMatrix.invert(new Matrix4()).transformVector3(Vector3.createZero())
    const cameraDistance =
      reflectionPlane.x * cameraPosition.x +
      reflectionPlane.y * cameraPosition.y +
      reflectionPlane.z * cameraPosition.z +
      reflectionPlane.w

    if (cameraDistance < 0) {
      reflectionPlane.negate()
    }

    const reflectionMatrix = Matrix4.createReflection(reflectionPlane)

    Matrix4.multiply(this.frame.camera.viewMatrix, reflectionMatrix, this.reflectionCamera.viewMatrix)
    this.frame.camera.projectionMatrix.copyTo(this.reflectionCamera.projectionMatrix)
    Matrix4.multiply(
      this.reflectionCamera.projectionMatrix,
      this.reflectionCamera.viewMatrix,
      this.reflectionCamera.reconstructionMatrix
    ).invert()
    this.frame.camera.clipPlanes.copyTo(this.reflectionCamera.clipPlanes)

    this.reflectionCamera.aspect = this.frame.camera.aspect
    this.reflectionCamera.fieldOfView = this.frame.camera.fieldOfView

    const clipPlane = reflectionPlane.clone()

    // Keep a small margin behind the reflector plane. Subtracting the bias
    // instead would discard geometry on the visible side and create a gap.
    clipPlane.w += Math.max(0, reflector.clipBias)

    return clipPlane
  }

  applyReflectorToBatches(
    batches: RenderBatch[],
    reflectorEntity: Entity,
    reflector: Reflector,
    resources: ReflectorResources
  ): void {
    const reflectionUniforms = {
      isPlanarReflectionEnabled: true,
      planarReflectionTexture: resources.texture,
      blurredPlanarReflectionTexture: resources.blurredTexture,
      planarReflectionViewportSize: new Vector2([this.context.viewport.width, this.context.viewport.height]),
      planarReflectionIntensity: Math.max(0, reflector.intensity),
      planarReflectionMaximumRoughness: Math.max(0.04, Math.min(1, reflector.maximumRoughness))
    }

    for (const batch of [...batches]) {
      if (batch.transform !== reflectorEntity) {
        continue
      }

      const batchMeshes = batch.meshes ?? Object.keys(batch.model.primitives)
      const reflectedMeshes =
        reflector.meshes.length === 0 ? batchMeshes : batchMeshes.filter((name) => reflector.meshes.includes(name))

      if (reflectedMeshes.length === 0) {
        continue
      }

      if (reflectedMeshes.length === batchMeshes.length) {
        batch.uniforms = { ...(batch.uniforms ?? {}), ...reflectionUniforms }
        continue
      }

      batch.meshes = batchMeshes.filter((name) => !reflectedMeshes.includes(name))

      batches.push({
        ...batch,
        meshes: reflectedMeshes,
        uniforms: { ...(batch.uniforms ?? {}), ...reflectionUniforms }
      })
    }
  }

  isReflectorVisible({ entity, reflector }: ReflectorBinding, batches: RenderBatch[]): boolean {
    return batches.some((batch) => {
      if (batch.transform !== entity) {
        return false
      }

      if (reflector.meshes.length === 0) {
        return true
      }

      const batchMeshes = batch.meshes ?? Object.keys(batch.model.primitives)

      return batchMeshes.some((name) => reflector.meshes.includes(name))
    })
  }
}
