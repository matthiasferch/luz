import { Vector4 } from '@luz/math'
import type { Camera } from '@luz/core'
import { Transform } from '@luz/core'
import { Vector2 } from '@luz/math'
import type { FrameRenderer } from '../renderer/frame-renderer'
import type { RenderBackend } from '../renderer/render-backend'
import type { RenderModel } from '../renderer/render-model'
import type { RenderPipeline } from '../renderer/render-pipeline'
import type { RenderTarget } from '../renderer/render-target'
import type { AmbientOcclusion } from './ambient-occlusion-effect'
import type { BloomEffect } from './bloom-effect'
import type { EnvironmentManager } from './environment-manager'
import type { FocusEffect } from './focus-effect'
import type { MotionBlur } from './motion-blur-effect'
import type { CompositeUniforms } from './render-uniforms'
import { type RenderingSettings } from './settings'
import type { TargetManager } from './target-manager'
import type { TemporalHistory } from './temporal-history'
import type { VolumetricLighting } from './volumetric-effect'

interface EffectContext {
  readonly frameRenderer: FrameRenderer
  readonly fullscreenModel: RenderModel
  readonly targets: TargetManager
  readonly occlusion: AmbientOcclusion
  readonly backend: RenderBackend
  readonly bloomEffect: BloomEffect
  readonly volume: VolumetricLighting
  readonly environment: EnvironmentManager
  readonly renderingSettings: RenderingSettings
  readonly focus: FocusEffect
  readonly history: TemporalHistory
  readonly viewport: { width: number; height: number }
  readonly motion: MotionBlur
}
export interface ProcessingOptions {
  isDebugViewActive: boolean
  isDepthOfFieldEnabled: boolean
  isTemporalAntialiasingEnabled: boolean
  isMotionVisualizationEnabled: boolean
  isMotionBlurEnabled: boolean
  isAntialiasingEnabled: boolean
  isDepthVisualized: boolean
  isScreenOcclusionVisualized: boolean
  isVolumetricLightingEnabled: boolean
}

const origin = Transform.createOrigin()

interface EffectFrame {
  readonly elapsedTime: number
  readonly compositePipeline: RenderPipeline
  readonly camera: Camera
  readonly canvasTarget: RenderTarget
  readonly presentPipeline: RenderPipeline
  readonly fxaaPipeline: RenderPipeline
}

export class PostProcessing {
  constructor(private readonly context: EffectContext) {}

  private frame!: EffectFrame

  beginFrame(frame: EffectFrame): void {
    this.frame = frame
  }

  render(options: ProcessingOptions): void {
    const {
      isDebugViewActive,
      isDepthOfFieldEnabled,
      isTemporalAntialiasingEnabled,
      isMotionVisualizationEnabled,
      isMotionBlurEnabled,
      isAntialiasingEnabled,
      isDepthVisualized,
      isScreenOcclusionVisualized,
      isVolumetricLightingEnabled
    } = options
    const compositeQueue = this.context.frameRenderer.ensureQueue('composite')

    compositeQueue.batches.length = 0

    compositeQueue.batches.push({
      transform: origin,
      model: this.context.fullscreenModel
    })
    compositeQueue.sortByMaterialThenDepth()

    const compositeStageUniforms: CompositeUniforms = {
      sceneTexture: this.context.targets.sceneTexture,
      depthTexture: this.context.targets.depthTexture,
      ambientOcclusionTexture: this.context.occlusion.ambientOcclusion.texture ?? this.context.backend.defaultTexture,
      bloomTexture: this.context.bloomEffect.bloom.texture ?? this.context.backend.defaultTexture,
      volumetricTexture: this.context.volume.volumetricLighting.texture,
      volumetricDepthTexture: this.context.volume.volumetricLighting.depthTexture,
      volumetricSceneDepthTexture: this.context.targets.transmissionDepthTexture,
      skyTexture: this.context.environment.environmentSkyTexture ?? this.context.environment.environmentSpecularTexture,
      ...(this.context.environment.environmentSkyCubeTexture || this.context.environment.environmentSpecularCubeTexture
        ? {
            skyCube: (this.context.environment.environmentSkyCubeTexture ??
              this.context.environment.environmentSpecularCubeTexture)!,
            isCubeSkyEnabled: true
          }
        : {}),
      environmentRotation: this.context.environment.calculateEnvironmentRotation(),
      elapsedTime: this.frame.elapsedTime,
      isDepthVisualized: isDepthVisualized,
      isScreenOcclusionVisualized: isScreenOcclusionVisualized,
      isGammaCorrectionEnabled: false,
      isToneMappingEnabled: false,
      isBloomEnabled: !isDebugViewActive && this.context.renderingSettings.bloom.isEnabled,
      isDepthOfFieldEnabled: isDepthOfFieldEnabled,
      isDepthOfFieldOverridden: this.context.renderingSettings.depthOfField.isCameraOverridden,
      isDepthOfFieldVisualized: this.context.renderingSettings.debug.isDepthOfFieldVisualized,
      depthOfFieldFocusDistance: this.context.renderingSettings.depthOfField.focusDistance,
      depthOfFieldFocalLength: this.context.renderingSettings.depthOfField.focalLength,
      depthOfFieldSensorHeight: this.context.renderingSettings.depthOfField.sensorHeight,
      depthOfFieldFStop: this.context.renderingSettings.depthOfField.fStop,
      depthOfFieldMaximumBlurRadius: this.context.renderingSettings.depthOfField.maximumBlurRadius,
      depthOfFieldBackgroundTexture: isDepthOfFieldEnabled
        ? this.context.focus.depthOfField.layerTextures[0]
        : this.context.backend.defaultTexture,
      depthOfFieldForegroundTexture: isDepthOfFieldEnabled
        ? this.context.focus.depthOfField.layerTextures[1]
        : this.context.backend.defaultTexture,
      depthOfFieldBackingDepthTexture: isDepthOfFieldEnabled
        ? (this.context.focus.depthOfField.backingDepthTexture ?? this.context.backend.defaultTexture)
        : this.context.backend.defaultTexture,
      isVolumetricLightingEnabled: isVolumetricLightingEnabled,
      isVolumetricLightVisualized: this.context.renderingSettings.debug.isVolumetricLightVisualized,
      bloomIntensity: this.context.renderingSettings.bloom.intensity
    }

    this.context.frameRenderer.renderQueue(compositeQueue, this.frame.compositePipeline, {
      clear: { color: new Vector4([0, 0, 0, 1]), depth: 1 },
      camera: this.frame.camera,
      target: this.context.targets.linearSceneTarget,
      uniforms: { ...compositeStageUniforms, isDepthOfFieldEnabled: false, isBloomEnabled: false }
    })

    let postProcessTexture = this.context.targets.linearSceneTexture

    if (isTemporalAntialiasingEnabled || isMotionVisualizationEnabled) {
      postProcessTexture = this.context.history.resolveTemporalAntialiasing(compositeQueue, postProcessTexture)
    }

    const stabilizedSceneTexture = postProcessTexture

    if (!isDebugViewActive && this.context.renderingSettings.bloom.isEnabled) {
      const overlayQueue = this.context.frameRenderer.ensureQueue('composite')

      overlayQueue.batches.length = 0

      overlayQueue.batches.push({
        transform: origin,
        model: this.context.fullscreenModel
      })
      overlayQueue.sortByMaterialThenDepth()
      this.context.frameRenderer.renderQueue(overlayQueue, this.context.bloomEffect.bloomExtractPipeline, {
        clear: { color: new Vector4([0, 0, 0, 1]) },
        camera: this.frame.camera,
        target: this.context.bloomEffect.bloom.targets[0],
        uniforms: {
          baseTexture: stabilizedSceneTexture,
          depthTexture: this.context.targets.depthTexture,
          skyTexture:
            this.context.environment.environmentSkyTexture ?? this.context.environment.environmentSpecularTexture,
          skyCube:
            this.context.environment.environmentSkyCubeTexture ??
            this.context.environment.environmentSpecularCubeTexture ??
            this.context.backend.defaultTexture,
          isCubeSkyEnabled: Boolean(
            this.context.environment.environmentSkyCubeTexture ||
            this.context.environment.environmentSpecularCubeTexture
          ),
          environmentRotation: this.context.environment.calculateEnvironmentRotation(),
          destinationSize: new Vector2([
            this.context.bloomEffect.bloom.targets[0].width,
            this.context.bloomEffect.bloom.targets[0].height
          ]),
          threshold: this.context.renderingSettings.bloom.threshold,
          knee: this.context.renderingSettings.bloom.knee,
          volumetricTexture: this.context.volume.volumetricLighting.texture,
          volumetricDepthTexture: this.context.volume.volumetricLighting.depthTexture,
          volumetricSceneDepthTexture: this.context.targets.transmissionDepthTexture,
          isVolumetricLightingEnabled: false
        }
      })

      for (let index = 1; index < this.context.bloomEffect.bloom.targets.length; index++) {
        this.context.frameRenderer.renderQueue(overlayQueue, this.context.bloomEffect.bloomDownsamplePipeline, {
          camera: this.frame.camera,
          target: this.context.bloomEffect.bloom.targets[index],
          uniforms: {
            baseTexture: this.context.bloomEffect.bloom.levels[index - 1],
            destinationSize: new Vector2([
              this.context.bloomEffect.bloom.targets[index].width,
              this.context.bloomEffect.bloom.targets[index].height
            ])
          }
        })
      }

      for (let index = this.context.bloomEffect.bloom.targets.length - 1; index >= 1; index--) {
        this.context.frameRenderer.renderQueue(overlayQueue, this.context.bloomEffect.bloomUpsamplePipeline, {
          camera: this.frame.camera,
          target: this.context.bloomEffect.bloom.targets[index - 1],
          uniforms: {
            baseTexture: this.context.bloomEffect.bloom.levels[index],
            destinationSize: new Vector2([
              this.context.bloomEffect.bloom.targets[index - 1].width,
              this.context.bloomEffect.bloom.targets[index - 1].height
            ]),
            scatter: this.context.renderingSettings.bloom.scatter
          }
        })
      }

      this.context.bloomEffect.bloom.texture = this.context.bloomEffect.bloom.levels[0]
    }

    if (isDepthOfFieldEnabled) {
      const depthOfFieldUniforms = {
        depthTexture: this.context.targets.depthTexture,
        destinationSize: new Vector2([
          this.context.focus.depthOfField.radiusTargets[0].width,
          this.context.focus.depthOfField.radiusTargets[0].height
        ]),
        isDepthOfFieldOverridden: this.context.renderingSettings.depthOfField.isCameraOverridden,
        depthOfFieldFocusDistance: this.context.renderingSettings.depthOfField.focusDistance,
        depthOfFieldFocalLength: this.context.renderingSettings.depthOfField.focalLength,
        depthOfFieldSensorHeight: this.context.renderingSettings.depthOfField.sensorHeight,
        depthOfFieldFStop: this.context.renderingSettings.depthOfField.fStop,
        depthOfFieldMaximumBlurRadius: this.context.renderingSettings.depthOfField.maximumBlurRadius,
        depthOfFieldViewportHeight: this.context.viewport.height
      }

      this.context.frameRenderer.renderQueue(compositeQueue, this.context.focus.depthOfFieldDilatePipeline, {
        camera: this.frame.camera,
        target: this.context.focus.depthOfField.radiusTargets[0],
        uniforms: {
          ...depthOfFieldUniforms,
          foregroundRadiusTexture: this.context.backend.defaultTexture,
          dilationDirection: new Vector2([1, 0]),
          isSourceDepth: true
        }
      })
      this.context.frameRenderer.renderQueue(compositeQueue, this.context.focus.depthOfFieldDilatePipeline, {
        camera: this.frame.camera,
        target: this.context.focus.depthOfField.radiusTargets[1],
        uniforms: {
          ...depthOfFieldUniforms,
          foregroundRadiusTexture: this.context.focus.depthOfField.radiusTextures[0],
          dilationDirection: new Vector2([0, 1]),
          isSourceDepth: false
        }
      })
      this.context.frameRenderer.renderQueue(compositeQueue, this.context.focus.depthOfFieldPrefilterPipeline, {
        clear: { color: new Vector4([0, 0, 0, 0]) },
        camera: this.frame.camera,
        target: this.context.focus.depthOfField.prefilterTarget!,
        uniforms: {
          sceneTexture: stabilizedSceneTexture,
          depthTexture: this.context.targets.depthTexture,
          surfaceOwnershipTexture: this.context.focus.depthOfField.surfaceTexture!,
          skyTexture:
            this.context.environment.environmentSkyTexture ?? this.context.environment.environmentSpecularTexture,
          skyCube:
            this.context.environment.environmentSkyCubeTexture ??
            this.context.environment.environmentSpecularCubeTexture ??
            this.context.backend.defaultTexture,
          destinationSize: new Vector2([
            this.context.focus.depthOfField.prefilterTarget!.width,
            this.context.focus.depthOfField.prefilterTarget!.height
          ]),
          isCubeSkyEnabled: this.context.environment.isCubeEnvironmentEnabled,
          environmentRotation: this.context.environment.calculateEnvironmentRotation()
        }
      })
      this.context.frameRenderer.renderQueue(compositeQueue, this.context.focus.depthOfFieldLayersPipeline, {
        clear: { color: new Vector4([0, 0, 0, 0]) },
        camera: this.frame.camera,
        target: this.context.focus.depthOfField.layerTarget!,
        uniforms: {
          prefilteredSceneTexture: this.context.focus.depthOfField.prefilterTexture!,
          sceneTexture: stabilizedSceneTexture,
          skyTexture:
            this.context.environment.environmentSkyTexture ?? this.context.environment.environmentSpecularTexture,
          skyCube:
            this.context.environment.environmentSkyCubeTexture ??
            this.context.environment.environmentSpecularCubeTexture ??
            this.context.backend.defaultTexture,
          isCubeSkyEnabled: Boolean(
            this.context.environment.environmentSkyCubeTexture ||
            this.context.environment.environmentSpecularCubeTexture
          ),
          environmentRotation: this.context.environment.calculateEnvironmentRotation(),
          depthTexture: this.context.targets.depthTexture,
          backingSceneTexture: this.context.focus.depthOfField.backingTexture ?? this.context.backend.defaultTexture,
          backingDepthTexture:
            this.context.focus.depthOfField.backingDepthTexture ?? this.context.backend.defaultTexture,
          foregroundRadiusTexture: this.context.focus.depthOfField.radiusTextures[1],
          surfaceOwnershipTexture: this.context.focus.depthOfField.surfaceTexture!,
          isDepthOfFieldOverridden: this.context.renderingSettings.depthOfField.isCameraOverridden,
          depthOfFieldFocusDistance: this.context.renderingSettings.depthOfField.focusDistance,
          depthOfFieldFocalLength: this.context.renderingSettings.depthOfField.focalLength,
          depthOfFieldSensorHeight: this.context.renderingSettings.depthOfField.sensorHeight,
          depthOfFieldFStop: this.context.renderingSettings.depthOfField.fStop,
          depthOfFieldMaximumBlurRadius: this.context.renderingSettings.depthOfField.maximumBlurRadius,
          depthOfFieldMaximumSamples: this.context.renderingSettings.depthOfField.maximumSamples
        }
      })
    }

    if (!isDebugViewActive && (isDepthOfFieldEnabled || this.context.renderingSettings.bloom.isEnabled)) {
      // DOF and bloom consume sharp temporal history; optical blur never enters it.
      this.context.frameRenderer.renderQueue(compositeQueue, this.frame.compositePipeline, {
        clear: { color: new Vector4([0, 0, 0, 1]), depth: 1 },
        camera: this.frame.camera,
        target: this.context.targets.compositeTarget,
        uniforms: {
          ...compositeStageUniforms,
          sceneTexture: stabilizedSceneTexture,
          bloomTexture: this.context.bloomEffect.bloom.texture ?? this.context.backend.defaultTexture,
          isVolumetricLightingEnabled: false
        }
      })

      postProcessTexture = this.context.targets.compositeTexture
    }

    if (isMotionBlurEnabled && !isMotionVisualizationEnabled) {
      postProcessTexture = this.context.motion.renderMotionBlur(compositeQueue, postProcessTexture)
    }

    const isFxaaEnabled =
      !isDebugViewActive && isAntialiasingEnabled && !isTemporalAntialiasingEnabled && !isMotionVisualizationEnabled
    const presentationTarget = isFxaaEnabled
      ? postProcessTexture === this.context.targets.linearSceneTexture
        ? this.context.targets.compositeTarget
        : this.context.targets.linearSceneTarget
      : this.frame.canvasTarget

    this.context.frameRenderer.renderQueue(compositeQueue, this.frame.presentPipeline, {
      target: presentationTarget,
      uniforms: {
        baseTexture: postProcessTexture,
        isToneMappingEnabled: !isDebugViewActive,
        isGammaCorrectionEnabled: !isDebugViewActive
      }
    })

    if (isFxaaEnabled) {
      this.context.frameRenderer.renderQueue(compositeQueue, this.frame.fxaaPipeline, {
        target: this.frame.canvasTarget,
        uniforms: {
          baseTexture:
            presentationTarget === this.context.targets.compositeTarget
              ? this.context.targets.compositeTexture
              : this.context.targets.linearSceneTexture
        }
      })
    }
  }
}
