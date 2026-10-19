import type {
  AmbientOcclusionSettings,
  BloomSettings,
  DebugSettings,
  DepthOfFieldSettings,
  EnvironmentSettings,
  MotionBlurSettings,
  ShadowSettings,
  VolumetricLightingSettings
} from '../settings'
import type { DebugVisualization } from './editor-api'
import type { OverlayCategory } from '../rendering/overlay-style'

export interface CheckboxDefinition<Key extends string> {
  key: Key
  label: string
}
type NumberKey<Settings> = {
  [Key in keyof Settings]: Settings[Key] extends number ? Key : never
}[keyof Settings] &
  string
type BooleanKey<Settings> = {
  [Key in keyof Settings]: Settings[Key] extends boolean ? Key : never
}[keyof Settings] &
  string
export interface SliderDefinition<Key extends string = string> {
  key: Key
  label: string
  min: number
  max: number
  step: number
  digits: number
  unit?: string
  requires?: string
}

export const debugOverlayCheckboxes: Array<CheckboxDefinition<BooleanKey<DebugSettings>> & { style: OverlayCategory }> =
  [
    { key: 'areCameraFrustumsVisible', style: 'camera', label: 'Camera frustums' },
    { key: 'areLightFrustumsVisible', style: 'light', label: 'Light frustums' },
    { key: 'areModelBoundingBoxesVisible', style: 'model', label: 'Model bounding boxes' },
    { key: 'areBodyBoundingBoxesVisible', style: 'bodyInside', label: 'Body bounding boxes' },
    { key: 'areLightScissorsVisible', style: 'scissor', label: 'Light scissors' },
    { key: 'areArmaturesVisible', style: 'armature', label: 'Armatures' },
    { key: 'areCollidersVisible', style: 'collider', label: 'Colliders' },
    { key: 'areCollisionsVisible', style: 'contact', label: 'Contacts' }
  ]

export const shadowSliders: Array<SliderDefinition<NumberKey<ShadowSettings>>> = [
  { key: 'softness', label: 'Softness', min: 0, max: 10, step: 0.1, digits: 1 },
  { key: 'grain', label: 'Grain', min: 0, max: 1, step: 0.05, digits: 2 }
]

export const environmentSliders: Array<SliderDefinition<NumberKey<EnvironmentSettings>>> = [
  { key: 'rotationDegrees', label: 'Rotation', min: 0, max: 360, step: 1, digits: 0, unit: '°' },
  { key: 'ambientBrightness', label: 'Ambient brightness', min: 0, max: 1, step: 0.01, digits: 2 },
  { key: 'diffuseStrength', label: 'Diffuse strength', min: 0, max: 2, step: 0.01, digits: 2 },
  { key: 'specularStrength', label: 'Specular strength', min: 0, max: 2, step: 0.01, digits: 2 }
]

export const ambientOcclusionSliders: Array<SliderDefinition<NumberKey<AmbientOcclusionSettings>>> = [
  { key: 'radius', label: 'Radius', min: 0.1, max: 4, step: 0.1, digits: 2 },
  { key: 'intensity', label: 'Intensity', min: 0, max: 3, step: 0.05, digits: 2 },
  { key: 'falloff', label: 'Falloff', min: 0.25, max: 4, step: 0.05, digits: 2 },
  { key: 'thickness', label: 'Thickness', min: 0, max: 0.2, step: 0.005, digits: 3 },
  { key: 'temporalStability', label: 'Temporal stability', min: 0, max: 0.98, step: 0.01, digits: 2 }
]

export const bloomSliders: Array<SliderDefinition<NumberKey<BloomSettings>>> = [
  { key: 'threshold', label: 'Threshold', min: 0, max: 3, step: 0.05, digits: 2 },
  { key: 'knee', label: 'Soft knee', min: 0, max: 1, step: 0.01, digits: 2 },
  { key: 'intensity', label: 'Intensity', min: 0, max: 2, step: 0.05, digits: 2 },
  { key: 'scatter', label: 'Scatter', min: 0, max: 1, step: 0.01, digits: 2 }
]

export const volumetricLightingSliders: Array<SliderDefinition<NumberKey<VolumetricLightingSettings>>> = [
  { key: 'intensityMultiplier', label: 'Intensity multiplier', min: 0, max: 2, step: 0.01, digits: 2 },
  { key: 'density', label: 'Density', min: 0, max: 0.2, step: 0.001, digits: 3 },
  { key: 'anisotropy', label: 'Anisotropy', min: -0.9, max: 0.9, step: 0.05, digits: 2 },
  { key: 'noiseScale', label: 'Noise scale', min: 0.1, max: 5, step: 0.1, digits: 1 },
  { key: 'noiseSpeed', label: 'Noise speed', min: 0, max: 0.05, step: 0.001, digits: 3 },
  { key: 'noiseStrength', label: 'Noise amount', min: 0, max: 1, step: 0.05, digits: 2 }
]

export const motionBlurSliders: Array<SliderDefinition<NumberKey<MotionBlurSettings>>> = [
  { key: 'shutterAngle', label: 'Shutter angle', min: 0, max: 360, step: 5, digits: 0, unit: '°' },
  { key: 'maximumRadius', label: 'Maximum blur', min: 0, max: 64, step: 1, digits: 0, unit: ' px' }
]

export const depthOfFieldSliders: Array<SliderDefinition<NumberKey<DepthOfFieldSettings>>> = [
  {
    key: 'focusDistance',
    label: 'Focus distance',
    min: 0.1,
    max: 10,
    step: 0.01,
    digits: 2,
    unit: ' m',
    requires: 'isCameraOverridden'
  },
  {
    key: 'focalLength',
    label: 'Focal length',
    min: 18,
    max: 100,
    step: 1,
    digits: 0,
    unit: ' mm',
    requires: 'isCameraOverridden'
  },
  {
    key: 'sensorHeight',
    label: 'Sensor height',
    min: 12,
    max: 36,
    step: 0.5,
    digits: 1,
    unit: ' mm',
    requires: 'isCameraOverridden'
  },
  { key: 'fStop', label: 'F-stop', min: 1, max: 8, step: 0.1, digits: 1, requires: 'isCameraOverridden' },
  { key: 'maximumBlurRadius', label: 'Maximum blur', min: 0, max: 30, step: 1, digits: 0, unit: ' px' }
]

export const debugVisualizations: Array<{ value: DebugVisualization | 'none'; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'isDepthVisualized', label: 'Scene depth' },
  { value: 'isDepthOfFieldVisualized', label: 'Focus regions' },
  { value: 'areWorldNormalsVisualized', label: 'Normal (World)' },
  { value: 'areCameraNormalsVisualized', label: 'Normal (Camera)' },
  { value: 'isRoughnessVisualized', label: 'Roughness' },
  { value: 'isMetallicVisualized', label: 'Metallic' },
  { value: 'isAmbientOcclusionVisualized', label: 'Material AO' },
  { value: 'isScreenOcclusionVisualized', label: 'Screen-space AO' },
  { value: 'isNormalLightDotVisualized', label: 'N · L' },
  { value: 'isTransmissionVisualized', label: 'Transmission' },
  { value: 'isVolumetricLightVisualized', label: 'Volumetric lighting' }
]
