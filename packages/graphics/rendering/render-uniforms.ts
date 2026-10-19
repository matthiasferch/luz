import type { Matrix4, Vector4 } from '@luz/math'
import type { Texture } from '../types/texture'

export interface LightingUniforms {
  shadowTexture: Texture
  ambientOcclusionTexture: Texture

  clipPlane: Readonly<Vector4>

  areShadowsEnabled: boolean
  isScreenOcclusionEnabled: boolean
  isSubsurfaceLightingEnabled: boolean
  isEmissionSuppressed: boolean
  isFrontFaceReversed: boolean
  shadowGrain: number
  areWorldNormalsVisualized: boolean
  areCameraNormalsVisualized: boolean
  isRoughnessVisualized: boolean
  isMetallicVisualized: boolean
  isAmbientOcclusionVisualized: boolean
  isNormalLightDotVisualized: boolean
  areShadowsVisualized: boolean
}

export interface BlurUniforms {
  baseTexture: Texture
}

export interface CompositeUniforms {
  sceneTexture: Texture
  depthTexture: Texture
  ambientOcclusionTexture: Texture
  skyTexture: Texture
  skyCube?: Texture
  bloomTexture: Texture
  volumetricTexture: Texture
  volumetricDepthTexture: Texture
  volumetricSceneDepthTexture: Texture
  environmentRotation: number
  isCubeSkyEnabled?: boolean

  elapsedTime: number

  isDepthVisualized: boolean
  isScreenOcclusionVisualized: boolean
  isGammaCorrectionEnabled: boolean
  isToneMappingEnabled: boolean
  isBloomEnabled: boolean
  isDepthOfFieldEnabled: boolean
  isDepthOfFieldOverridden: boolean
  isDepthOfFieldVisualized: boolean
  depthOfFieldFocusDistance: number
  depthOfFieldFocalLength: number
  depthOfFieldSensorHeight: number
  depthOfFieldFStop: number
  depthOfFieldMaximumBlurRadius: number
  depthOfFieldBackgroundTexture: Texture
  depthOfFieldForegroundTexture: Texture
  depthOfFieldBackingDepthTexture: Texture
  isVolumetricLightingEnabled: boolean
  isVolumetricLightVisualized: boolean
  bloomIntensity: number
}

export interface TemporalAntialiasingUniforms {
  currentTexture: Texture
  historyTexture: Texture
  historyMetadataTexture: Texture
  historyLuminanceTexture: Texture
  motionVectorTexture: Texture
  depthTexture: Texture
  currentViewProjectionMatrix: Matrix4
  previousViewProjectionMatrix: Matrix4
  isHistoryValid: boolean
  historyLength: number
  areMotionVectorsVisualized: boolean
}

export interface MotionBlurUniforms {
  isCameraBlurEnabled: boolean
  currentTexture: Texture
  motionVectorTexture: Texture
  neighborVelocityTexture: Texture
  depthTexture: Texture
  currentViewProjectionMatrix: Matrix4
  previousViewProjectionMatrix: Matrix4
  shutterAngle: number
  maximumRadius: number
  maximumSamples: number
}
