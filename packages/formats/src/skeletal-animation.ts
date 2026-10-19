import type { PlaybackMode } from './playback-mode'
import type { TransformTracks } from './transform-tracks'

export type AnimationReferences = Record<string, string>

export interface SkeletalClip {
  duration: number
  playback?: PlaybackMode
  isAutoplayEnabled?: boolean
  keyframes: Record<string, Required<TransformTracks>>
}

export interface SkeletalDocument extends SkeletalClip {
  $schema?: string
  type: 'skeletalAnimation'
  schemaVersion: 1
}
