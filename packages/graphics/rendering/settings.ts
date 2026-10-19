import type { Tuple2 } from '@luz/formats'
import { isVolumetricQuality } from './volumetric-quality'
import type { VolumetricQuality } from './volumetric-quality'

export type AmbientOcclusionQuality = 'low' | 'medium' | 'high'
export type AntialiasingMode = 'off' | 'fxaa' | 'taa'

export const isAmbientOcclusionQuality = (value: unknown): value is AmbientOcclusionQuality =>
  value === 'low' || value === 'medium' || value === 'high'

export const isAntialiasingMode = (value: unknown): value is AntialiasingMode =>
  value === 'off' || value === 'fxaa' || value === 'taa'

export interface LightingSettings {
  scissorMargin: number
  isSubsurfaceLightingEnabled: boolean
}
export interface ShadowSettings {
  isEnabled: boolean
  softness: number
  grain: number
}
export interface PlanarReflectionSettings {
  isEnabled: boolean
}
export interface AntialiasingSettings {
  method: AntialiasingMode
}

export interface AmbientOcclusionSettings {
  isEnabled: boolean
  quality: AmbientOcclusionQuality
  radius: number
  intensity: number
  falloff: number
  thickness: number
  temporalStability: number
}

export interface VolumetricLightingSettings {
  isEnabled: boolean
  quality: VolumetricQuality
  intensityMultiplier: number
  density: number
  anisotropy: number
  noiseScale: number
  noiseSpeed: number
  noiseStrength: number
}

export interface BloomSettings {
  isEnabled: boolean
  threshold: number
  knee: number
  intensity: number
  scatter: number
}

export interface MotionBlurSettings {
  isEnabled: boolean
  isCameraBlurEnabled: boolean
  shutterAngle: number
  maximumRadius: number
  maximumSamples: number
}

export interface DepthOfFieldSettings {
  isEnabled: boolean
  isCameraOverridden: boolean
  focusDistance: number
  focalLength: number
  sensorHeight: number
  fStop: number
  maximumBlurRadius: number
  maximumSamples: number
}

export interface VisualizationSettings {
  isDepthVisualized: boolean
  isDepthOfFieldVisualized: boolean
  areWorldNormalsVisualized: boolean
  areCameraNormalsVisualized: boolean
  isRoughnessVisualized: boolean
  isMetallicVisualized: boolean
  isAmbientOcclusionVisualized: boolean
  isScreenOcclusionVisualized: boolean
  isNormalLightDotVisualized: boolean
  areShadowsVisualized: boolean
  isTransmissionVisualized: boolean
  isVolumetricLightVisualized: boolean
  areMotionVectorsVisualized: boolean
}
export interface RenderingSettings {
  lighting: LightingSettings
  shadows: ShadowSettings
  planarReflections: PlanarReflectionSettings
  antialiasing: AntialiasingSettings
  ambientOcclusion: AmbientOcclusionSettings
  volumetricLighting: VolumetricLightingSettings
  bloom: BloomSettings
  motionBlur: MotionBlurSettings
  depthOfField: DepthOfFieldSettings
  debug: VisualizationSettings
}

export interface EnvironmentSettings {
  rotationDegrees: number
  ambientBrightness: number
  diffuseStrength: number
  specularStrength: number
}

export type RenderingOptions = {
  [Section in keyof RenderingSettings]?: Partial<RenderingSettings[Section]>
}

export const DEBUG_VISUALIZATION_KEYS = [
  'isDepthVisualized',
  'isDepthOfFieldVisualized',
  'areWorldNormalsVisualized',
  'areCameraNormalsVisualized',
  'isRoughnessVisualized',
  'isMetallicVisualized',
  'isAmbientOcclusionVisualized',
  'isScreenOcclusionVisualized',
  'isNormalLightDotVisualized',
  'areShadowsVisualized',
  'isTransmissionVisualized',
  'isVolumetricLightVisualized',
  'areMotionVectorsVisualized'
] as const satisfies ReadonlyArray<keyof RenderingSettings['debug']>

export type DebugVisualization = (typeof DEBUG_VISUALIZATION_KEYS)[number]

export const DEFAULT_RENDERING_SETTINGS: Readonly<RenderingSettings> = {
  lighting: {
    scissorMargin: 2,
    isSubsurfaceLightingEnabled: true
  },
  shadows: {
    isEnabled: true,
    softness: 0.15,
    grain: 0.7
  },
  planarReflections: {
    isEnabled: true
  },
  antialiasing: {
    method: 'taa'
  },
  ambientOcclusion: {
    isEnabled: false,
    quality: 'medium',
    radius: 1.5,
    intensity: 1,
    falloff: 1.5,
    thickness: 0.02,
    temporalStability: 0.9
  },
  volumetricLighting: {
    isEnabled: true,
    quality: 'medium',
    intensityMultiplier: 1,
    density: 0.02,
    anisotropy: 0.35,
    noiseScale: 1.5,
    noiseSpeed: 0.002,
    noiseStrength: 0.6
  },
  bloom: {
    isEnabled: false,
    threshold: 1,
    knee: 0.5,
    intensity: 0.35,
    scatter: 0.7
  },
  motionBlur: {
    isEnabled: true,
    isCameraBlurEnabled: true,
    shutterAngle: 180,
    maximumRadius: 32,
    maximumSamples: 24
  },
  depthOfField: {
    isEnabled: true,
    isCameraOverridden: false,
    focusDistance: 10,
    focalLength: 50,
    sensorHeight: 32,
    fStop: 2.8,
    maximumBlurRadius: 20,
    maximumSamples: 64
  },
  debug: {
    isDepthVisualized: false,
    isDepthOfFieldVisualized: false,
    areWorldNormalsVisualized: false,
    areCameraNormalsVisualized: false,
    isRoughnessVisualized: false,
    isMetallicVisualized: false,
    isAmbientOcclusionVisualized: false,
    isScreenOcclusionVisualized: false,
    isNormalLightDotVisualized: false,
    areShadowsVisualized: false,
    isTransmissionVisualized: false,
    isVolumetricLightVisualized: false,
    areMotionVectorsVisualized: false
  }
}
export const DEFAULT_ENVIRONMENT_SETTINGS: Readonly<EnvironmentSettings> = {
  rotationDegrees: 0,
  ambientBrightness: 0.02,
  diffuseStrength: 0.5,
  specularStrength: 0.5
}
export function createRenderingSettings(): RenderingSettings {
  return structuredClone(DEFAULT_RENDERING_SETTINGS)
}

const renderingRanges: Readonly<Record<string, Readonly<Tuple2>>> = {
  'lighting.scissorMargin': [0, 64],
  'shadows.softness': [0, 10],
  'shadows.grain': [0, 1],
  'motionBlur.shutterAngle': [0, 360],
  'motionBlur.maximumRadius': [0, 64],
  'depthOfField.focusDistance': [0.1, 100],
  'depthOfField.focalLength': [1, 200],
  'depthOfField.sensorHeight': [1, 70],
  'depthOfField.fStop': [0.7, 32],
  'depthOfField.maximumBlurRadius': [0, 40],
  'volumetricLighting.intensityMultiplier': [0, 2],
  'volumetricLighting.density': [0, 0.2],
  'volumetricLighting.anisotropy': [-0.9, 0.9],
  'volumetricLighting.noiseScale': [0.1, 5],
  'volumetricLighting.noiseSpeed': [0, 0.05],
  'volumetricLighting.noiseStrength': [0, 1],
  'ambientOcclusion.radius': [0.1, 4],
  'ambientOcclusion.intensity': [0, 3],
  'ambientOcclusion.falloff': [0.25, 4],
  'ambientOcclusion.thickness': [0, 0.2],
  'ambientOcclusion.temporalStability': [0, 0.98],
  'bloom.threshold': [0, 3],
  'bloom.knee': [0, 1],
  'bloom.intensity': [0, 2],
  'bloom.scatter': [0, 1]
}

const environmentRanges = {
  rotationDegrees: [0, 360],
  ambientBrightness: [0, 1],
  diffuseStrength: [0, 2],
  specularStrength: [0, 2]
} as const

const getRecord = (source: unknown): Record<string, unknown> =>
  source !== null && typeof source === 'object' && !Array.isArray(source) ? (source as Record<string, unknown>) : {}

export function normalizeRenderingSetting<
  Section extends keyof RenderingSettings,
  Key extends keyof RenderingSettings[Section]
>(
  section: Section,
  key: Key,
  value: unknown,
  fallback: RenderingSettings[Section][Key] = DEFAULT_RENDERING_SETTINGS[section][key]
): RenderingSettings[Section][Key] {
  const defaultValue = DEFAULT_RENDERING_SETTINGS[section][key]
  const path = `${String(section)}.${String(key)}`

  let acceptedValue: unknown = fallback

  if (typeof defaultValue === 'boolean' && typeof value === 'boolean') {
    acceptedValue = value
  } else if (typeof defaultValue === 'number' && typeof value === 'number' && Number.isFinite(value)) {
    const range = renderingRanges[path]
    const sampleCounts =
      path === 'motionBlur.maximumSamples'
        ? [8, 16, 24, 32]
        : path === 'depthOfField.maximumSamples'
          ? [16, 32, 48, 64]
          : undefined

    if (!sampleCounts || sampleCounts.includes(value)) {
      acceptedValue = range ? Math.min(range[1], Math.max(range[0], value)) : value
    }
  } else if (
    (path === 'antialiasing.method' && isAntialiasingMode(value)) ||
    (path === 'ambientOcclusion.quality' && isAmbientOcclusionQuality(value)) ||
    (path === 'volumetricLighting.quality' && isVolumetricQuality(value))
  ) {
    acceptedValue = value
  }

  return acceptedValue as RenderingSettings[Section][Key]
}

export function normalizeRenderingSettings(source: unknown): RenderingSettings {
  const settings = createRenderingSettings()
  const input = getRecord(source)
  const normalizeSection = <Section extends keyof RenderingSettings>(section: Section): void => {
    const values = getRecord(input[section])

    for (const key of Object.keys(settings[section]) as Array<keyof RenderingSettings[Section]>) {
      settings[section][key] = normalizeRenderingSetting(section, key, values[String(key)])
    }
  }

  for (const section of Object.keys(settings) as Array<keyof RenderingSettings>) {
    normalizeSection(section)
  }

  return settings
}

export function normalizeEnvironmentSetting<Key extends keyof EnvironmentSettings>(
  key: Key,
  value: unknown,
  fallback: EnvironmentSettings[Key] = DEFAULT_ENVIRONMENT_SETTINGS[key]
): EnvironmentSettings[Key] {
  const range = environmentRanges[key]

  return typeof value === 'number' && Number.isFinite(value) ? Math.min(range[1], Math.max(range[0], value)) : fallback
}

export function normalizeEnvironmentSettings(source: unknown): EnvironmentSettings {
  const settings = { ...DEFAULT_ENVIRONMENT_SETTINGS }
  const input = getRecord(source)

  for (const key of Object.keys(settings) as Array<keyof EnvironmentSettings>) {
    settings[key] = normalizeEnvironmentSetting(key, input[key])
  }

  return settings
}
