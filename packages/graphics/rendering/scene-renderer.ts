import type { Light, Camera } from '@luz/core'
import { isLight, Transform } from '@luz/core'
import { Vector2, Vector4 } from '@luz/math'
import type { Scene } from '@luz/scene'
import type { ModelCompiler } from '../compilers/model-compiler'
import type { PipelineCompiler } from '../compilers/pipeline-compiler'
import type { Environment } from '../loaders/environment-loader'
import type { ImageDecoder } from '../loaders/image-loader'
import { isModel, Model } from '../model'
import { FrameRenderer, type FrameContext } from '../renderer/frame-renderer'
import type { LightBatch } from '../renderer/light-batch'
import { Mesh } from '../renderer/mesh'
import type { RenderBackend } from '../renderer/render-backend'
import type { RenderBatch } from '../renderer/render-batch'
import type { RenderFlow } from '../renderer/render-flow'
import type { RenderModel } from '../renderer/render-model'
import type { RenderPipeline } from '../renderer/render-pipeline'
import type { RenderTarget } from '../renderer/render-target'
import { ResourceScope } from '../resources/resource-scope'
import { AmbientOcclusion } from './ambient-occlusion-effect'
import { BloomEffect } from './bloom-effect'
import { Culling } from './culling'
import { EnvironmentManager } from './environment-manager'
import { FocusEffect } from './focus-effect'
import type { CullingStatistics, FrameResult } from './frame-result'
import { MotionBlur } from './motion-blur-effect'
import { PostProcessing } from './post-processing'
import { ReflectionRenderer } from './reflection-renderer'
import type { LightingUniforms } from './render-uniforms'
import { SeparableBlurEffect, type BlurConfiguration } from './separable-blur'
import {
  normalizeRenderingSettings,
  normalizeRenderingSetting,
  normalizeEnvironmentSettings,
  normalizeEnvironmentSetting,
  DEBUG_VISUALIZATION_KEYS,
  type AntialiasingMode,
  type EnvironmentSettings,
  type RenderingSettings,
  type RenderingOptions
} from './settings'
import {
  compileBuiltinPipeline,
  createBlurConfiguration,
  createPipelineCompiler,
  createRenderFlow
} from './shader-catalog'
import { TargetManager } from './target-manager'
import { ShadowRenderer } from './shadow-renderer'
import { TemporalHistory } from './temporal-history'
import reflectanceImage from './textures/brdfLUT.png'
import noiseImage from './textures/noise.png'
import { VolumetricLighting } from './volumetric-effect'
import { VOLUMETRIC_QUALITY } from './volumetric-quality'

const origin = Transform.createOrigin()
const emptyVector = Vector4.createZero()

export interface RendererOptions {
  backend: RenderBackend
  models: ModelCompiler
  decodeImage: ImageDecoder
  signal?: AbortSignal
  settings?: RenderingOptions
  environmentSettings?: Partial<EnvironmentSettings>
}
export class SceneRenderer {
  private readonly postProcessing: PostProcessing
  private readonly environment: EnvironmentManager
  private readonly history: TemporalHistory
  private readonly occlusion: AmbientOcclusion
  private readonly motion: MotionBlur
  private readonly focus: FocusEffect
  private readonly bloomEffect: BloomEffect
  private readonly reflection: ReflectionRenderer
  private readonly volume: VolumetricLighting
  private readonly targets: TargetManager
  private readonly shadows: ShadowRenderer

  private elapsedTime = 0
  private isDestroyed = false

  private readonly requests = new AbortController()
  private readonly backend: RenderBackend
  private readonly pipelineCompiler: PipelineCompiler
  private readonly previousVisibility = new WeakMap<Model | Light, boolean>()
  private readonly blurEffect: SeparableBlurEffect
  private readonly frameRenderer: FrameRenderer

  private canvasTarget!: RenderTarget
  private shadowMappingPipeline!: RenderPipeline
  private transparentPipeline!: RenderPipeline
  private gaussianBlurPipeline!: RenderPipeline
  private depthPipeline!: RenderPipeline
  private lightingPipeline!: RenderPipeline
  private compositePipeline!: RenderPipeline
  private skyPipeline!: RenderPipeline
  private fxaaPipeline!: RenderPipeline
  private presentPipeline!: RenderPipeline
  private ambientPipeline!: RenderPipeline
  private renderFlow!: RenderFlow
  private blurEffectConfiguration!: BlurConfiguration
  private scene!: Scene
  private camera!: Camera
  private requireActive(): void {
    if (this.isDestroyed) {
      throw new Error('Renderer has been destroyed')
    }
  }

  setRenderingSetting<Section extends keyof RenderingSettings, Key extends keyof RenderingSettings[Section]>(
    section: Section,
    key: Key,
    value: RenderingSettings[Section][Key]
  ): RenderingSettings[Section][Key] {
    this.requireActive()

    const sectionSettings = this.renderingSettings[section]
    const currentValue = sectionSettings[key]

    const acceptedValue = normalizeRenderingSetting(section, key, value, currentValue)

    if (acceptedValue === currentValue) {
      return acceptedValue
    }

    sectionSettings[key] = acceptedValue

    if (section === 'shadows' && key === 'softness') {
      this.applyShadowSoftness(acceptedValue as number)
    }

    if (section === 'volumetricLighting' && key === 'quality' && this.targets.areRenderTargetsPrepared) {
      this.volume.prepareVolumetricTarget()
    }

    if (section === 'volumetricLighting' && key !== 'isEnabled' && key !== 'intensityMultiplier') {
      this.applyVolumetricSettings()
    }

    this.history.invalidateHistory()

    return acceptedValue
  }

  setAntialiasingMode(mode: AntialiasingMode): AntialiasingMode {
    this.requireActive()

    return this.setRenderingSetting('antialiasing', 'method', mode)
  }

  setEnvironmentSetting(key: keyof EnvironmentSettings, value: number): number {
    this.requireActive()

    const currentValue = this.environmentSettings[key]
    const acceptedValue = normalizeEnvironmentSetting(key, value, currentValue)

    if (acceptedValue !== currentValue) {
      this.environmentSettings[key] = acceptedValue

      this.history.invalidateHistory()
    }

    return acceptedValue
  }

  private applyShadowSoftness(softness: number): void {
    if (!this.scene) {
      return
    }

    const lights = this.scene
      .collectEntities()
      .flatMap(({ components }) => Object.values(components))
      .filter((component) => isLight(component))

    lights.forEach((light) => {
      light.softness = softness
    })
  }

  private applyVolumetricSettings(): void {
    if (!this.scene) {
      return
    }

    const lights = this.scene
      .collectEntities()
      .flatMap(({ components }) => Object.values(components))
      .filter((component) => isLight(component))

    lights.forEach((light) => {
      light.volumetricDensity = this.renderingSettings.volumetricLighting.density
      light.volumetricAnisotropy = this.renderingSettings.volumetricLighting.anisotropy
      light.volumetricNoiseScale = this.renderingSettings.volumetricLighting.noiseScale
      light.volumetricNoiseSpeed = this.renderingSettings.volumetricLighting.noiseSpeed
      light.volumetricNoiseStrength = this.renderingSettings.volumetricLighting.noiseStrength
    })
  }

  private async preparePipelines() {
    this.volume.volumetricDepthPipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'volumetric-depth.pipeline.json'
    )
    this.blurEffectConfiguration = createBlurConfiguration(this.pipelineCompiler, false)
    this.gaussianBlurPipeline = this.blurEffectConfiguration.pipeline
    this.depthPipeline = compileBuiltinPipeline(this.pipelineCompiler, 'depth.pipeline.json')
    this.ambientPipeline = compileBuiltinPipeline(this.pipelineCompiler, 'ambient.pipeline.json')
    this.lightingPipeline = compileBuiltinPipeline(this.pipelineCompiler, 'lighting.pipeline.json')
    this.shadowMappingPipeline = compileBuiltinPipeline(this.pipelineCompiler, 'shadowing.pipeline.json')
    this.transparentPipeline = compileBuiltinPipeline(this.pipelineCompiler, 'transparent.pipeline.json')
    this.compositePipeline = compileBuiltinPipeline(this.pipelineCompiler, 'composite.pipeline.json')
    this.focus.depthOfFieldDilatePipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'depth-of-field-dilate.pipeline.json'
    )
    this.focus.depthOfFieldPrefilterPipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'depth-of-field-prefilter.pipeline.json'
    )
    this.focus.depthOfFieldLayersPipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'depth-of-field-layers.pipeline.json'
    )
    this.focus.depthOfFieldBackingDepthPipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'depth-of-field-backing-depth.pipeline.json'
    )
    this.focus.depthOfFieldBackingAmbientPipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'depth-of-field-backing-ambient.pipeline.json'
    )
    this.focus.depthOfFieldSurfacePipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'depth-of-field-surface.pipeline.json'
    )
    this.skyPipeline = compileBuiltinPipeline(this.pipelineCompiler, 'sky.pipeline.json')
    this.volume.volumetricCompositePipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'volumetric-composite.pipeline.json'
    )
    this.fxaaPipeline = compileBuiltinPipeline(this.pipelineCompiler, 'fxaa.pipeline.json')
    this.motion.motionVectorPipeline = compileBuiltinPipeline(this.pipelineCompiler, 'motion-vectors.pipeline.json')
    this.motion.motionBlurTilePipeline = compileBuiltinPipeline(this.pipelineCompiler, 'motion-blur-tile.pipeline.json')
    this.motion.motionBlurNeighborPipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'motion-blur-neighbor.pipeline.json'
    )
    this.motion.motionBlurPipeline = compileBuiltinPipeline(this.pipelineCompiler, 'motion-blur.pipeline.json')
    this.history.temporalAntialiasingPipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'temporal-antialiasing.pipeline.json'
    )
    this.presentPipeline = compileBuiltinPipeline(this.pipelineCompiler, 'present.pipeline.json')
    this.occlusion.ambientOcclusionNormalPipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'ambient-occlusion-normal.pipeline.json'
    )
    this.occlusion.ambientOcclusionPipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'ambient-occlusion.pipeline.json'
    )
    this.occlusion.ambientOcclusionTemporalPipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'ambient-occlusion-temporal.pipeline.json'
    )
    this.occlusion.ambientOcclusionBlurEffectConfiguration = createBlurConfiguration(this.pipelineCompiler, true)
    this.occlusion.ambientOcclusionBlurPipeline = this.occlusion.ambientOcclusionBlurEffectConfiguration.pipeline
    this.occlusion.ambientOcclusionUpsamplePipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'ambient-occlusion-upsample.pipeline.json'
    )
    this.bloomEffect.bloomExtractPipeline = compileBuiltinPipeline(this.pipelineCompiler, 'bloom-extract.pipeline.json')
    this.bloomEffect.bloomDownsamplePipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'bloom-downsample.pipeline.json'
    )
    this.bloomEffect.bloomUpsamplePipeline = compileBuiltinPipeline(
      this.pipelineCompiler,
      'bloom-upsample.pipeline.json'
    )
    this.renderFlow = await createRenderFlow(this.pipelineCompiler)
  }
  private readonly scope: ResourceScope
  private readonly models: ModelCompiler
  private readonly renderingSettings: RenderingSettings
  private readonly environmentSettings: EnvironmentSettings
  private readonly fullscreenModel: RenderModel
  private readonly viewport = { width: 1, height: 1 }

  private culling: CullingStatistics = {
    visibleBodyCount: 0,
    culledBodyCount: 0,
    visibleLightCount: 0,
    culledLightCount: 0
  }
  private constructor(options: RendererOptions) {
    this.scope = new ResourceScope(options.backend)
    this.backend = this.scope.backend
    this.models = options.models
    this.renderingSettings = normalizeRenderingSettings(options.settings)
    this.environmentSettings = normalizeEnvironmentSettings(options.environmentSettings)
    this.pipelineCompiler = createPipelineCompiler(this.backend)
    this.frameRenderer = new FrameRenderer(this.backend, (model) => this.models.requireCompiledModel(model))
    this.blurEffect = new SeparableBlurEffect(this.backend)

    const mesh = new Mesh({
      topology: 'triangles',
      vertices: [-1, -1, 0, 0, 0, 0, 0, 0, -1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, -1, 0, 1, 0, 0, 0, 0],
      indices: [0, 3, 2, 2, 1, 0]
    })
    const model = new Model({ meshes: { fullscreen: mesh } })

    this.fullscreenModel = {
      source: model,
      materials: {},
      primitives: { fullscreen: this.backend.primitives.create(mesh, this.backend.defaultMaterial) }
    }
    this.targets = new TargetManager({
      backend: this.backend,
      viewport: this.viewport
    })
    this.environment = new EnvironmentManager({
      backend: this.backend,
      environmentSettings: this.environmentSettings
    })
    this.motion = new MotionBlur({
      viewport: this.viewport,
      backend: this.backend,
      frameRenderer: this.frameRenderer,
      renderingSettings: this.renderingSettings
    })
    this.occlusion = new AmbientOcclusion({
      backend: this.backend,
      viewport: this.viewport,
      motionBlur: this.motion.motionBlur,
      frameRenderer: this.frameRenderer,
      fullscreenModel: this.fullscreenModel,
      renderingSettings: this.renderingSettings,
      blurEffect: this.blurEffect
    })
    this.history = new TemporalHistory({
      viewport: this.viewport,
      backend: this.backend,
      ambientOcclusion: this.occlusion.ambientOcclusion,
      motionBlur: this.motion.motionBlur,
      renderingSettings: this.renderingSettings,
      frameRenderer: this.frameRenderer,
      models: this.models
    })
    this.shadows = new ShadowRenderer(this.backend, this.models)
    this.focus = new FocusEffect({
      viewport: this.viewport,
      backend: this.backend,
      frameRenderer: this.frameRenderer,
      environmentSettings: this.environmentSettings,
      calculateEnvironmentRotation: this.environment.calculateEnvironmentRotation.bind(this.environment)
    })
    this.bloomEffect = new BloomEffect({
      viewport: this.viewport,
      backend: this.backend
    })
    this.volume = new VolumetricLighting({
      backend: this.backend,
      fullscreenModel: this.fullscreenModel,
      frameRenderer: this.frameRenderer,
      viewport: this.viewport,
      renderingSettings: this.renderingSettings
    })
    this.reflection = new ReflectionRenderer({
      backend: this.backend,
      viewport: this.viewport,
      renderingSettings: this.renderingSettings
    })
    this.postProcessing = new PostProcessing({
      frameRenderer: this.frameRenderer,
      fullscreenModel: this.fullscreenModel,
      targets: this.targets,
      occlusion: this.occlusion,
      backend: this.backend,
      bloomEffect: this.bloomEffect,
      volume: this.volume,
      environment: this.environment,
      renderingSettings: this.renderingSettings,
      focus: this.focus,
      history: this.history,
      viewport: this.viewport,
      motion: this.motion
    })
  }

  static async create(options: RendererOptions): Promise<SceneRenderer> {
    options.signal?.throwIfAborted()

    const renderer = new SceneRenderer(options)
    const onAbort = () => renderer.requests.abort(options.signal?.reason)

    options.signal?.addEventListener('abort', onAbort, { once: true })

    try {
      renderer.targets.preparePersistentTextures()
      renderer.environment.setEnvironment(null)

      await renderer.preparePipelines()

      const signal = renderer.requests.signal
      const images = await Promise.all(
        [noiseImage, reflectanceImage].map(async (source) =>
          options.decodeImage(await (await fetch(source, { signal })).blob(), signal)
        )
      )

      renderer.requests.signal.throwIfAborted()
      renderer.requireActive()
      renderer.backend.textures.update(renderer.targets.noiseTexture, images[0])
      renderer.backend.textures.update(renderer.targets.reflectanceLookupTexture, images[1])

      return renderer
    } catch (error) {
      renderer.destroy()
      throw error
    } finally {
      options.signal?.removeEventListener('abort', onAbort)
    }
  }

  destroy(): void {
    if (this.isDestroyed) {
      return
    }

    this.isDestroyed = true

    this.requests.abort()
    this.frameRenderer.clear()
    this.blurEffect.clearCache()
    this.pipelineCompiler.clear()
    this.targets.destroy()
    this.environment.destroy()
    this.motion.destroy()
    this.occlusion.destroy()
    this.history.destroy()
    this.focus.destroy()
    this.shadows.destroy()
    this.bloomEffect.destroy()
    this.volume.destroy()
    this.reflection.destroy()
    this.scope.destroy()
  }

  render(scene: Scene, context: FrameContext): FrameResult {
    this.requireActive()

    if (
      !Number.isInteger(context.target.width) ||
      !Number.isInteger(context.target.height) ||
      context.target.width < 1 ||
      context.target.height < 1
    ) {
      throw new Error('Render target dimensions must be positive integers')
    }

    if (this.scene !== scene || this.camera !== context.camera) {
      this.history.isMotionHistoryInitialized = false

      this.history.invalidateHistory()
    }

    const isSceneChanged = this.scene !== scene

    this.scene = scene
    this.camera = context.camera
    this.elapsedTime = context.time
    this.canvasTarget = context.target

    if (isSceneChanged) {
      this.history.temporalSurfaceIds = new WeakMap()
      this.history.nextTemporalSurfaceId = 1

      this.applyShadowSoftness(this.renderingSettings.shadows.softness)
      this.applyVolumetricSettings()
    }

    if (
      !this.targets.areRenderTargetsPrepared ||
      this.viewport.width !== context.target.width ||
      this.viewport.height !== context.target.height
    ) {
      this.viewport.width = context.target.width
      this.viewport.height = context.target.height

      this.reflection.destroyTransmissionLightingResources()
      this.occlusion.destroyAmbientOcclusionResources()
      this.history.destroyTemporalResources()
      this.focus.destroyDepthOfFieldResources()
      this.bloomEffect.destroyBloomResources()
      this.targets.prepareRenderTargets()
      this.motion.resize(this.targets.depthTexture)
      this.volume.prepareVolumetricTarget()
      this.blurEffect.clearCache()

      this.history.isMotionHistoryInitialized = false

      this.history.invalidateHistory()
    }

    this.motion.beginFrame({
      history: this.history,
      depthTexture: this.targets.depthTexture,
      camera: this.camera
    })
    this.occlusion.beginFrame({
      depthTexture: this.targets.depthTexture,
      camera: this.camera
    })
    this.history.beginFrame({
      camera: this.camera,
      depthTexture: this.targets.depthTexture,
      scene: this.scene
    })
    this.focus.beginFrame({
      depthTexture: this.targets.depthTexture,
      camera: this.camera,
      elapsedTime: this.elapsedTime,
      environmentDiffuseTexture: this.environment.environmentDiffuseTexture,
      environmentSpecularTexture: this.environment.environmentSpecularTexture,
      reflectanceLookupTexture: this.targets.reflectanceLookupTexture,
      environmentDiffuseCubeTexture: this.environment.environmentDiffuseCubeTexture,
      environmentSpecularCubeTexture: this.environment.environmentSpecularCubeTexture,
      environmentSpecularCubeMaximumLevelOfDetail: this.environment.environmentSpecularCubeMaximumLevelOfDetail,
      environmentSpecular2DMaximumLevelOfDetail: this.environment.environmentSpecular2DMaximumLevelOfDetail,
      isCubeEnvironmentEnabled: this.environment.isCubeEnvironmentEnabled
    })
    this.reflection.beginFrame({
      scene: this.scene,
      camera: this.camera
    })
    this.postProcessing.beginFrame({
      elapsedTime: this.elapsedTime,
      compositePipeline: this.compositePipeline,
      camera: this.camera,
      canvasTarget: this.canvasTarget,
      presentPipeline: this.presentPipeline,
      fxaaPipeline: this.fxaaPipeline
    })

    const projection = this.camera.projectionMatrix.clone()
    const reconstruction = this.camera.reconstructionMatrix.clone()

    this.backend.statistics.reset()

    try {
      const lightBatches = this.renderScene()
      const depthJitter = new Vector2([
        (projection[8] - this.camera.projectionMatrix[8]) * 0.5,
        (projection[9] - this.camera.projectionMatrix[9]) * 0.5
      ])

      return {
        width: context.target.width,
        height: context.target.height,
        target: context.target,
        depthTexture: this.targets.depthTexture,
        depthJitter,
        lightBatches,
        cullingStatistics: { ...this.culling },
        renderedReflectorCount: this.reflection.reflections.renderedCount,
        reflectorCount: this.reflection.reflections.bindings.length
      }
    } catch (error) {
      this.history.isMotionHistoryInitialized = false

      this.history.invalidateHistory()
      throw error
    } finally {
      projection.copyTo(this.camera.projectionMatrix)
      reconstruction.copyTo(this.camera.reconstructionMatrix)
    }
  }

  private renderScene(): LightBatch[] {
    const isCompositingEnabled = true
    const areShadowsEnabled = this.renderingSettings.shadows.isEnabled
    const { method: antialiasingMethod } = this.renderingSettings.antialiasing
    const { isEnabled: isAmbientOcclusionEnabled } = this.renderingSettings.ambientOcclusion
    const { isEnabled: isVolumeEnabled } = this.renderingSettings.volumetricLighting
    const { isEnabled: isBlurEnabled } = this.renderingSettings.motionBlur
    const {
      isDepthVisualized: isDepthVisualized,
      isScreenOcclusionVisualized: isScreenOcclusionVisualized,
      areMotionVectorsVisualized: areMotionVectorsVisualized,
      isVolumetricLightVisualized: isVolumetricLightVisualized
    } = this.renderingSettings.debug
    const isAntialiasingEnabled = antialiasingMethod !== 'off'
    const isTemporalModeSelected = antialiasingMethod === 'taa'
    const isDebugViewActive = DEBUG_VISUALIZATION_KEYS.some((key) => this.renderingSettings.debug[key])

    for (const entity of this.scene.collectEntities()) {
      for (const component of Object.values(entity.components)) {
        if (!isModel(component) && !isLight(component)) {
          continue
        }

        const wasVisible = this.previousVisibility.get(component)

        if (wasVisible !== undefined && wasVisible !== component.isVisible) {
          this.history.invalidateHistory()
        }

        this.previousVisibility.set(component, component.isVisible)
      }
    }

    this.reflection.synchronizeReflectorResources()

    const intermediateTarget = isCompositingEnabled ? this.targets.sceneTarget : this.canvasTarget

    const { opaqueBatches, transparentBatches, allLights, visibleLights } = Culling.cullScene(
      this.scene,
      this.camera,
      this.models
    )

    const entities = this.scene.collectEntities()

    this.culling = {
      visibleBodyCount: opaqueBatches.length + transparentBatches.length,
      culledBodyCount: entities.length - (opaqueBatches.length + transparentBatches.length),
      visibleLightCount: visibleLights.length,
      culledLightCount: allLights.length - visibleLights.length
    }

    const lightBatches = Culling.buildLightingTasks(
      entities,
      visibleLights,
      this.camera,
      intermediateTarget.width,
      intermediateTarget.height,
      this.renderingSettings.lighting.scissorMargin
    )

    const { pipelines } = this.renderFlow
    const shadowPipeline = pipelines.shadowMapping
    const scenePipelines = { ...pipelines, overlay: undefined, shadowMapping: undefined }
    const resolveShadowTexture =
      areShadowsEnabled && shadowPipeline
        ? (batch: LightBatch) => this.shadows.render(batch, shadowPipeline)
        : undefined

    this.shadows.beginFrame(allLights, areShadowsEnabled)

    const volumeProfile = VOLUMETRIC_QUALITY[this.renderingSettings.volumetricLighting.quality]
    const areVolumesEnabled =
      isCompositingEnabled && isVolumeEnabled && this.renderingSettings.volumetricLighting.intensityMultiplier > 0

    for (const batch of [...opaqueBatches, ...transparentBatches]) {
      batch.uniforms = {
        ...(batch.uniforms ?? {}),
        isPlanarReflectionEnabled: false
      }
    }

    const visibleReflectors = this.renderingSettings.planarReflections.isEnabled
      ? this.reflection.reflections.bindings.filter((binding) => {
          return this.reflection.isReflectorVisible(binding, [...opaqueBatches, ...transparentBatches])
        })
      : []

    this.reflection.reflections.renderedCount = visibleReflectors.filter(({ reflector }) =>
      this.reflection.reflections.resources.has(reflector)
    ).length

    for (const { entity: reflectorEntity, reflector } of visibleReflectors) {
      const resources = this.reflection.reflections.resources.get(reflector)

      if (!resources) {
        continue
      }

      const reflectionClipPlane = this.reflection.updateReflectorCamera(reflector)
      const reflectionOpaqueBatches: RenderBatch[] = []

      for (const entity of entities) {
        if (entity === reflectorEntity) {
          continue
        }

        for (const component of Object.values(entity.components)) {
          if (isModel(component) && component.isVisible) {
            const renderModel = this.models.requireCompiledModel(component)
            const meshes = Object.entries(renderModel.primitives)
              .filter(([, primitive]) => primitive.material.isOpaque)
              .map(([name]) => name)

            if (meshes.length > 0) {
              reflectionOpaqueBatches.push({ transform: entity, model: renderModel, meshes })
            }
          }
        }
      }

      const reflectionLightBatches = Culling.buildLightingTasks(
        entities,
        allLights,
        this.reflection.reflectionCamera,
        resources.target.width,
        resources.target.height,
        this.renderingSettings.lighting.scissorMargin
      ).map(({ light, entities, shadowEntities }) => ({ light, entities, shadowEntities }))

      const areReflectionVolumesEnabled =
        areVolumesEnabled &&
        reflectionLightBatches.some(
          ({ light }) =>
            light.volumetricIntensity > 0 &&
            light.volumetricDensity > 0 &&
            light.intensity > 0 &&
            (light.isDirectional || light.range > 0)
        )

      if (areReflectionVolumesEnabled) {
        this.backend.bindTarget(resources.volumetricTarget)

        this.backend.scissor = null

        this.backend.clear({ color: emptyVector })
      }

      this.frameRenderer.clear()
      this.frameRenderer.renderFrame(
        {
          depth: pipelines.depth,
          ambient: pipelines.ambient,
          lighting: pipelines.lighting,
          volumetricLighting: pipelines.volumetricLighting
        },
        {
          camera: this.reflection.reflectionCamera,
          time: this.elapsedTime,
          target: resources.target
        },
        reflectionLightBatches,
        reflectionOpaqueBatches,
        [],
        {
          resolveShadowTexture,
          clear: {
            depth: { color: emptyVector, depth: 1 },
            ambient: { color: emptyVector },
            shadowMapping: { depth: 1 }
          },
          volumetricBatches: areReflectionVolumesEnabled ? [{ transform: origin, model: this.fullscreenModel }] : [],
          overrideTargets: {
            volumetricLighting: resources.volumetricTarget
          },
          additionalUniforms: {
            depth: {
              clipPlane: reflectionClipPlane
            },
            volumetricLighting: {
              depthTexture: resources.volumetricDepthTexture,
              shadowTexture: this.backend.defaultTexture,
              noiseTexture: this.targets.noiseTexture,
              volumetricResolution: new Vector2([resources.volumetricTarget.width, resources.volumetricTarget.height]),
              elapsedTime: this.elapsedTime,
              volumetricIntensityMultiplier: this.renderingSettings.volumetricLighting.intensityMultiplier,
              volumetricSampleCount: volumeProfile.sampleCount,
              clipPlane: reflectionClipPlane,
              areShadowsEnabled: areShadowsEnabled
            },
            ambient: {
              ambientBrightness: this.environmentSettings.ambientBrightness,
              environmentDiffuseTexture: this.environment.environmentDiffuseTexture,
              environmentDiffuseStrength: this.environmentSettings.diffuseStrength,
              environmentSpecularTexture: this.environment.environmentSpecularTexture,
              reflectanceLookupTexture: this.targets.reflectanceLookupTexture,
              ...(this.environment.environmentDiffuseCubeTexture
                ? { environmentDiffuseCube: this.environment.environmentDiffuseCubeTexture }
                : {}),
              ...(this.environment.environmentSpecularCubeTexture
                ? { environmentSpecularCube: this.environment.environmentSpecularCubeTexture }
                : {}),
              environmentSpecularMaximumLevelOfDetail: this.environment.environmentSpecularCubeTexture
                ? this.environment.environmentSpecularCubeMaximumLevelOfDetail
                : (this.environment.environmentSpecular2DMaximumLevelOfDetail ??
                  Math.floor(
                    Math.log2(
                      Math.max(
                        this.environment.environmentSpecularTexture.width,
                        this.environment.environmentSpecularTexture.height
                      )
                    )
                  )),
              environmentSpecularStrength: this.environmentSettings.specularStrength,
              environmentRotation: this.environment.calculateEnvironmentRotation(),
              isCubeEnvironmentEnabled: this.environment.isCubeEnvironmentEnabled,
              clipPlane: reflectionClipPlane,
              isFrontFaceReversed: true,
              isPlanarReflectionEnabled: false,
              ambientOcclusionTexture: this.backend.defaultTexture,
              isScreenOcclusionEnabled: false,
              isAmbientOcclusionVisualized: false
            },
            lighting: {
              shadowTexture: this.backend.defaultTexture,
              ambientOcclusionTexture: this.backend.defaultTexture,
              areShadowsEnabled: areShadowsEnabled,
              isScreenOcclusionEnabled: false,
              isSubsurfaceLightingEnabled: this.renderingSettings.lighting.isSubsurfaceLightingEnabled,
              isEmissionSuppressed: false,
              isFrontFaceReversed: true,
              shadowGrain: this.renderingSettings.shadows.grain,
              clipPlane: reflectionClipPlane,
              areWorldNormalsVisualized: this.renderingSettings.debug.areWorldNormalsVisualized,
              areCameraNormalsVisualized: this.renderingSettings.debug.areCameraNormalsVisualized,
              isRoughnessVisualized: this.renderingSettings.debug.isRoughnessVisualized,
              isMetallicVisualized: this.renderingSettings.debug.isMetallicVisualized,
              isAmbientOcclusionVisualized: this.renderingSettings.debug.isAmbientOcclusionVisualized,
              isNormalLightDotVisualized: this.renderingSettings.debug.isNormalLightDotVisualized,
              areShadowsVisualized: this.renderingSettings.debug.areShadowsVisualized
            }
          },
          overrideStates: {
            depth: { cullMode: 'front' },
            ambient: { cullMode: 'front' },
            lighting: { cullMode: 'front' }
          },
          onStageRendered: (stage) => {
            if (stage === 'depth' && areReflectionVolumesEnabled) {
              this.volume.captureVolumetricDepth(resources.depthTexture, resources.volumetricDepthTarget)
            }
          }
        }
      )

      const reflectionSkyQueue = this.frameRenderer.ensureQueue('composite')

      reflectionSkyQueue.batches.length = 0

      reflectionSkyQueue.batches.push({
        transform: origin,
        model: this.fullscreenModel
      })
      this.frameRenderer.renderQueue(reflectionSkyQueue, this.skyPipeline, {
        camera: this.reflection.reflectionCamera,
        target: resources.target,
        uniforms: {
          skyTexture: this.environment.environmentSkyTexture ?? this.environment.environmentSpecularTexture,
          skyCube:
            this.environment.environmentSkyCubeTexture ??
            this.environment.environmentSpecularCubeTexture ??
            this.backend.defaultTexture,
          environmentRotation: this.environment.calculateEnvironmentRotation(),
          isCubeSkyEnabled: Boolean(
            this.environment.environmentSkyCubeTexture || this.environment.environmentSpecularCubeTexture
          ),
          skyViewportSize: new Vector2([resources.target.width, resources.target.height])
        }
      })

      if (areReflectionVolumesEnabled) {
        this.frameRenderer.renderQueue(reflectionSkyQueue, this.volume.volumetricCompositePipeline, {
          camera: this.reflection.reflectionCamera,
          target: resources.colorTarget,
          uniforms: {
            depthTexture: resources.depthTexture,
            volumetricTexture: resources.volumetricTexture,
            volumetricDepthTexture: resources.volumetricDepthTexture,
            isVolumetricLightingEnabled: true,
            destinationSize: new Vector2([resources.target.width, resources.target.height])
          }
        })
      }

      this.blurEffect.render(
        this.gaussianBlurPipeline,
        resources.texture,
        resources.blurredTarget,
        { ...this.blurEffectConfiguration.parameters },
        this.blurEffectConfiguration.isCameraRequired ? this.reflection.reflectionCamera : null,
        {
          sourceUniform: this.blurEffectConfiguration.sourceUniform,
          directionUniform: this.blurEffectConfiguration.directionUniform
        }
      )
      this.reflection.applyReflectorToBatches(opaqueBatches, reflectorEntity, reflector, resources)
      this.reflection.applyReflectorToBatches(transparentBatches, reflectorEntity, reflector, resources)
    }

    const transmissionBatchesForLighting = transparentBatches.filter((batch) => {
      const name = batch.meshes?.[0]

      return Boolean(name && batch.model.primitives[name]?.material.blendMode === 'transmissive')
    })

    this.reflection.synchronizeTransmissionLightingResources(transmissionBatchesForLighting.length)

    const transmissionLightingTargets = new Map<RenderBatch, RenderTarget>()

    transmissionBatchesForLighting.forEach((batch, index) => {
      const resources = this.reflection.reflections.transmissionLighting[index]

      transmissionLightingTargets.set(batch, resources.target)

      batch.uniforms = {
        ...(batch.uniforms ?? {}),
        transmissionSurfaceTexture: resources.texture,
        isEmissionSuppressed: true,

        // The AO buffer contains opaque receiver depth. Sampling it while
        // compiling a transmissive layer would shade that layer with whatever
        // happens to be behind it.
        isScreenOcclusionEnabled: false
      }
    })

    const isVolumetricLightingEnabled =
      isCompositingEnabled &&
      (isVolumetricLightVisualized || (!isDebugViewActive && isVolumeEnabled)) &&
      this.renderingSettings.volumetricLighting.intensityMultiplier > 0 &&
      lightBatches.some(
        ({ light }) =>
          light.volumetricIntensity > 0 &&
          light.volumetricDensity > 0 &&
          light.intensity > 0 &&
          (light.isDirectional || light.range > 0)
      )

    if (isVolumetricLightingEnabled) {
      this.backend.bindTarget(this.volume.volumetricLighting.target)

      this.backend.scissor = null

      this.backend.clear({ color: emptyVector })
    }

    const isTemporalAntialiasingEnabled =
      !isDebugViewActive && isCompositingEnabled && isAntialiasingEnabled && isTemporalModeSelected
    const isMotionBlurEnabled =
      !isDebugViewActive &&
      isCompositingEnabled &&
      isBlurEnabled &&
      this.renderingSettings.motionBlur.shutterAngle > 0 &&
      this.renderingSettings.motionBlur.maximumRadius > 0
    const isMotionVisualizationEnabled = isCompositingEnabled && areMotionVectorsVisualized
    const isScreenOcclusionEnabled = isCompositingEnabled && (isAmbientOcclusionEnabled || isScreenOcclusionVisualized)
    const requiresMotionVectors =
      isTemporalAntialiasingEnabled ||
      (isMotionBlurEnabled && this.renderingSettings.motionBlur.isCameraBlurEnabled) ||
      isMotionVisualizationEnabled ||
      isScreenOcclusionEnabled

    this.history.prepareTemporalResources(isTemporalAntialiasingEnabled || isMotionVisualizationEnabled)
    this.motion.prepareMotionBlurResources(isMotionBlurEnabled)
    this.motion.prepareObjectMotionResources(
      isMotionBlurEnabled && !this.renderingSettings.motionBlur.isCameraBlurEnabled
    )
    this.occlusion.prepareAmbientOcclusionResources(isScreenOcclusionEnabled)
    this.bloomEffect.prepareBloomResources(!isDebugViewActive && this.renderingSettings.bloom.isEnabled)
    this.history.prepareTemporalFrame(isTemporalAntialiasingEnabled)
    this.frameRenderer.clear()

    const lightStageUniforms: LightingUniforms = {
      shadowTexture: this.backend.defaultTexture,
      ambientOcclusionTexture: this.occlusion.ambientOcclusion.texture ?? this.backend.defaultTexture,
      areShadowsEnabled: areShadowsEnabled,
      isScreenOcclusionEnabled: !isDebugViewActive && isAmbientOcclusionEnabled,
      isSubsurfaceLightingEnabled: this.renderingSettings.lighting.isSubsurfaceLightingEnabled,
      isEmissionSuppressed: false,
      isFrontFaceReversed: false,
      shadowGrain: this.renderingSettings.shadows.grain,
      clipPlane: emptyVector,
      areWorldNormalsVisualized: this.renderingSettings.debug.areWorldNormalsVisualized,
      areCameraNormalsVisualized: this.renderingSettings.debug.areCameraNormalsVisualized,
      isRoughnessVisualized: this.renderingSettings.debug.isRoughnessVisualized,
      isMetallicVisualized: this.renderingSettings.debug.isMetallicVisualized,
      isAmbientOcclusionVisualized: this.renderingSettings.debug.isAmbientOcclusionVisualized,
      isNormalLightDotVisualized: this.renderingSettings.debug.isNormalLightDotVisualized,
      areShadowsVisualized: this.renderingSettings.debug.areShadowsVisualized
    }

    this.frameRenderer.renderFrame(
      scenePipelines,
      {
        camera: this.camera,
        time: this.elapsedTime,
        target: intermediateTarget
      },
      lightBatches,
      opaqueBatches,
      transparentBatches,
      {
        clear: {
          depth: { color: emptyVector, depth: 1 },
          ambient: { color: emptyVector },
          shadowMapping: { depth: 1 }
        },
        volumetricBatches: isVolumetricLightingEnabled ? [{ transform: origin, model: this.fullscreenModel }] : [],
        resolveShadowTexture,
        resolveTransmissionLightingTarget: (batch) => transmissionLightingTargets.get(batch),
        overrideTargets: {
          volumetricLighting: this.volume.volumetricLighting.target
        },
        additionalUniforms: {
          depth: {
            clipPlane: emptyVector
          },
          ambient: {
            ambientBrightness: this.environmentSettings.ambientBrightness,
            environmentDiffuseTexture: this.environment.environmentDiffuseTexture,
            environmentDiffuseStrength: this.environmentSettings.diffuseStrength,
            environmentSpecularTexture: this.environment.environmentSpecularTexture,
            reflectanceLookupTexture: this.targets.reflectanceLookupTexture,
            ...(this.environment.environmentDiffuseCubeTexture
              ? { environmentDiffuseCube: this.environment.environmentDiffuseCubeTexture }
              : {}),
            ...(this.environment.environmentSpecularCubeTexture
              ? { environmentSpecularCube: this.environment.environmentSpecularCubeTexture }
              : {}),
            environmentSpecularMaximumLevelOfDetail: this.environment.environmentSpecularCubeTexture
              ? this.environment.environmentSpecularCubeMaximumLevelOfDetail
              : (this.environment.environmentSpecular2DMaximumLevelOfDetail ??
                Math.floor(
                  Math.log2(
                    Math.max(
                      this.environment.environmentSpecularTexture.width,
                      this.environment.environmentSpecularTexture.height
                    )
                  )
                )),
            environmentSpecularStrength: this.environmentSettings.specularStrength,
            environmentRotation: this.environment.calculateEnvironmentRotation(),
            isCubeEnvironmentEnabled: this.environment.isCubeEnvironmentEnabled,
            clipPlane: emptyVector,
            isFrontFaceReversed: false,
            isPlanarReflectionEnabled: false,
            ambientOcclusionTexture: this.occlusion.ambientOcclusion.texture ?? this.backend.defaultTexture,
            isScreenOcclusionEnabled: !isDebugViewActive && isAmbientOcclusionEnabled,
            isAmbientOcclusionVisualized: this.renderingSettings.debug.isAmbientOcclusionVisualized
          },
          lighting: lightStageUniforms,
          transparent: {
            ...lightStageUniforms,
            isSubsurfaceLightingEnabled: this.renderingSettings.lighting.isSubsurfaceLightingEnabled,
            isFrontFaceReversed: false
          },
          volumetricLighting: {
            depthTexture: this.volume.volumetricLighting.depthTexture,
            shadowTexture: this.backend.defaultTexture,
            noiseTexture: this.targets.noiseTexture,
            volumetricResolution: new Vector2([
              this.volume.volumetricLighting.target.width,
              this.volume.volumetricLighting.target.height
            ]),
            elapsedTime: this.elapsedTime,
            volumetricIntensityMultiplier: this.renderingSettings.volumetricLighting.intensityMultiplier,
            volumetricSampleCount: volumeProfile.sampleCount,
            clipPlane: emptyVector,
            areShadowsEnabled: areShadowsEnabled
          },
          transmission: {
            transmissionBackgroundTexture: this.targets.transmissionBackgroundTexture,
            depthTexture: isCompositingEnabled ? this.targets.transmissionDepthTexture : this.backend.defaultTexture,
            volumetricTexture: this.volume.volumetricLighting.texture,
            volumetricDepthTexture: this.volume.volumetricLighting.depthTexture,
            isVolumetricLightingEnabled: isVolumetricLightingEnabled,
            skyTexture: this.environment.environmentSkyTexture ?? this.environment.environmentSpecularTexture,
            skyCube:
              this.environment.environmentSkyCubeTexture ??
              this.environment.environmentSpecularCubeTexture ??
              this.backend.defaultTexture,
            reflectanceLookupTexture: this.targets.reflectanceLookupTexture,
            maximumTransmissionLevelOfDetail: Math.floor(
              Math.log2(Math.max(intermediateTarget.width, intermediateTarget.height))
            ),
            environmentSpecularStrength: this.environmentSettings.specularStrength,
            environmentRotation: this.environment.calculateEnvironmentRotation(),
            isTransmissionVisualized: this.renderingSettings.debug.isTransmissionVisualized,
            isFrontFaceReversed: false,
            isCubeSkyEnabled: Boolean(
              this.environment.environmentSkyCubeTexture || this.environment.environmentSpecularCubeTexture
            ),
            isPlanarReflectionEnabled: false,
            planarReflectionTexture: this.backend.defaultTexture,
            blurredPlanarReflectionTexture: this.backend.defaultTexture,
            planarReflectionViewportSize: new Vector2([this.viewport.width, this.viewport.height]),
            planarReflectionIntensity: 1,
            planarReflectionMaximumRoughness: 0.8,
            transmissionSurfaceTexture: this.backend.defaultTexture
          }
        },
        onStageRendered: (stage) => {
          if (stage !== 'depth') {
            return
          }

          if (isVolumetricLightingEnabled) {
            // Glass later writes scene depth and subtracts a volume residual.
            // Preserve the opaque guide so bloom/composite add that same volume.
            this.targets.captureTransmissionDepth(intermediateTarget)
            this.volume.captureVolumetricDepth(
              this.targets.transmissionDepthTexture,
              this.volume.volumetricLighting.depthTarget
            )
          }

          // AO depth and normals describe opaque geometry. Resolve its history
          // before transparent surfaces replace those velocities for TAA/blur.
          if (isScreenOcclusionEnabled) {
            this.motion.renderMotionVectors(opaqueBatches)
            this.occlusion.renderAmbientOcclusion(opaqueBatches)
          }

          if (requiresMotionVectors && (!isScreenOcclusionEnabled || transparentBatches.length > 0)) {
            this.motion.renderMotionVectors([...opaqueBatches, ...transparentBatches])
          }

          if (this.motion.motionBlur.objectTarget) {
            this.motion.renderMotionVectors([...opaqueBatches, ...transparentBatches], true)
          }
        },

        onTransmissionStagePreparing: () => {
          if (isCompositingEnabled && !isVolumetricLightingEnabled) {
            this.targets.captureTransmissionDepth(intermediateTarget)
          }
        },

        onTransmissionLayerPreparing: () => {
          this.targets.captureTransmissionBackground(intermediateTarget)
        }
      }
    )

    if (!isTemporalAntialiasingEnabled && !isMotionVisualizationEnabled) {
      this.history.temporalAntialiasing.isHistoryValid = false
    }

    if (!isScreenOcclusionEnabled) {
      this.occlusion.ambientOcclusion.isHistoryValid = false
    }

    const isDepthOfFieldEnabled =
      !isDebugViewActive &&
      isCompositingEnabled &&
      this.renderingSettings.depthOfField.isEnabled &&
      this.renderingSettings.depthOfField.maximumBlurRadius > 0 &&
      this.camera.isDepthOfFieldEnabled

    this.focus.prepareDepthOfFieldResources(isDepthOfFieldEnabled)

    if (isDepthOfFieldEnabled) {
      this.focus.renderDepthOfFieldBackingLayer(
        opaqueBatches,
        [...opaqueBatches, ...transmissionBatchesForLighting],
        lightBatches,
        pipelines,
        lightStageUniforms,
        resolveShadowTexture,
        this.renderingSettings.depthOfField
      )
    }

    this.postProcessing.render({
      isDebugViewActive,
      isDepthOfFieldEnabled,
      isTemporalAntialiasingEnabled,
      isMotionVisualizationEnabled,
      isMotionBlurEnabled,
      isAntialiasingEnabled,
      isDepthVisualized,
      isScreenOcclusionVisualized,
      isVolumetricLightingEnabled
    })
    this.history.captureMotionHistory()

    return lightBatches
  }

  get environmentDiagnostics() {
    return {
      diffuseEnvironment: this.environment.ktxDiffuseHeader,
      specularEnvironment: this.environment.ktxSpecularHeader,
      isCubeEnvironmentEnabled: this.environment.isCubeEnvironmentEnabled
    }
  }

  invalidateHistory(): void {
    this.history.invalidateHistory()
  }

  setEnvironment(sources: Environment | null): void {
    this.requireActive()
    this.environment.setEnvironment(sources)
    this.history.invalidateHistory()
  }
}
