import type { PlaybackMode } from '@luz/formats'

export type PlaybackState = 'playing' | 'paused' | 'stopped'

export interface PlaybackView {
  readonly duration: number
  readonly time: number
  readonly weight: number
  readonly playbackMode: PlaybackMode
  readonly state: PlaybackState
}

export interface MixOptions {
  // Seconds.
  transitionDuration?: number
  isRestartEnabled?: boolean
}

export interface PlaybackController {
  readonly animations: Readonly<Record<string, PlaybackView>>
  readonly isPaused: boolean
  readonly speed: number
  play(name: string, options?: MixOptions): void
  setMix(weights: Readonly<Record<string, number>>, options?: MixOptions): void
  setPlaybackMode(name: string, mode: PlaybackMode): void
  setSpeed(speed: number): void
  pause(): void
  resume(): void
  stop(): void
  seekProgress(progress: number): void
}
