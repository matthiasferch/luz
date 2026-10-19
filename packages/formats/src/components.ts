import type { ModelDefinition } from './model'
import type { MotionType } from './motion-type'
import type { PlaybackMode } from './playback-mode'
import type { TransformTracks } from './transform-tracks'
import type { Tuple2, Tuple3 } from './tuples'

export interface AnimationDocument {
  type: 'animation'
  schemaVersion: 2
  duration: number
  playback: PlaybackMode
  isAutoplayEnabled: boolean
  tracks: TransformTracks
}

export interface CameraDefinition {
  $schema?: string
  type: 'camera'
  aspect?: number

  // Degrees, vertical field of view.
  fieldOfView: number
  clipPlanes: Tuple2
  isDepthOfFieldEnabled?: boolean
  focusDistance?: number
  focalLength?: number
  sensorHeight?: number
  fStop?: number
}

interface LightProperties {
  type: 'light'
  isVisible?: boolean
  aspect?: number
  shadowSize?: Tuple2
  clipPlanes?: Tuple2

  // World units; ignored by directional lights.
  range: number
  intensity: number
  color: Tuple3
  softness?: number
  volumetricIntensity?: number
  volumetricDensity?: number
  volumetricAnisotropy?: number
  volumetricNoiseScale?: number
  volumetricNoiseSpeed?: number
  volumetricNoiseStrength?: number
}

export type LightDefinition = LightProperties &
  (
    | {
        lightType: 'spot'

        // Degrees, full cone angle.
        coneAngle: number

        // Degrees between outer and inner cone angles.
        coneFalloff: number
      }
    | { lightType: 'directional' | 'point'; coneAngle?: never; coneFalloff?: never }
  )

export interface ReflectorDefinition {
  type: 'reflector'
  normal?: Tuple3
  offset?: number
  resolutionScale?: number
  clipBias?: number
  intensity?: number
  maximumRoughness?: number
  meshes?: string[]
}

interface CollisionProperties {
  collisionGroup?: number
  collisionMask?: number
}

export type VolumeDefinition = CollisionProperties & { origin?: Tuple3; $schema?: string } & (
    | { type: 'sphere'; radius?: number }
    | { type: 'cuboid'; extents?: Tuple3 }
    | { type: 'ellipsoid'; radius?: Tuple3 }
    | { type: 'cylinder'; radius?: number; height?: number; axisIndex?: 0 | 1 | 2 }
  )

export type ColliderDefinition = CollisionProperties &
  (
    | { type: 'plane'; normal: Tuple3; distance: number }
    | { type: 'ray'; origin: Tuple3; direction: Tuple3 }
    | { type: 'polygon'; vertices: Tuple3[] }
  )

export interface BodyDefinition {
  $schema?: string
  type: 'body' | 'biped'
  motionType: MotionType
  volume: VolumeDefinition
  mass?: number
  isContinuousCollisionEnabled?: boolean
  restitution?: number
  friction?: number
}

export interface ComponentDefinitions {
  animation: AnimationDocument
  body: BodyDefinition
  camera: CameraDefinition
  light: LightDefinition
  model: ModelDefinition
  reflector: ReflectorDefinition
}

export type ComponentDefinition = ComponentDefinitions[keyof ComponentDefinitions]
