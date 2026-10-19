import type { PlaybackMode } from '@luz/formats'
import type { AnimationTransition, MixOptions, PlaybackController, PlaybackState, PlaybackView } from '@luz/core'
import type { SkeletalAnimation } from './renderer/skeletal-animation'

export class SkeletalMixer implements PlaybackController {
  private readonly playbacks: Record<string, PlaybackView> = Object.create(null)
  private readonly viewClips = new Map<string, SkeletalAnimation>()

  private isPlaybackPaused = false
  private playbackSpeed = 1
  private transition?: AnimationTransition

  constructor(
    private readonly clips: Record<string, SkeletalAnimation>,
    private readonly refreshPose: () => void
  ) {}

  get animations(): Readonly<Record<string, PlaybackView>> {
    for (const name of Object.keys(this.playbacks)) {
      if (this.viewClips.get(name) !== this.clips[name]) {
        delete this.playbacks[name]
        this.viewClips.delete(name)
      }
    }

    for (const [name, clip] of Object.entries(this.clips)) {
      if (this.viewClips.get(name) === clip) {
        continue
      }

      const mixer = this

      this.playbacks[name] = {
        get duration(): number {
          return clip.duration
        },

        get time(): number {
          return clip.time
        },

        get weight(): number {
          return clip.state === 'stopped' ? 0 : clip.weight
        },

        get playbackMode(): PlaybackMode {
          return clip.playbackMode
        },

        get state(): PlaybackState {
          if (clip.state === 'stopped' || clip.weight === 0) {
            return 'stopped'
          }

          return mixer.isPaused ? 'paused' : clip.state
        }
      }

      this.viewClips.set(name, clip)
    }

    return this.playbacks
  }

  get isPaused(): boolean {
    return this.isPlaybackPaused
  }

  get speed(): number {
    return this.playbackSpeed
  }

  setSpeed(speed: number): void {
    if (!Number.isFinite(speed) || speed <= 0) {
      throw new Error('Animation speed must be positive and finite')
    }

    this.playbackSpeed = speed
  }

  pause(): void {
    this.isPlaybackPaused = true
  }

  resume(): void {
    const activeClips = Object.values(this.clips).filter(
      (animation) => animation.state !== 'stopped' && animation.weight > 0
    )
    const hasFinished = activeClips.length > 0 && activeClips.every((animation) => animation.time >= animation.duration)

    for (const animation of activeClips) {
      if (hasFinished) {
        animation.time = 0
      }

      if (animation.time < animation.duration || animation.playbackMode === 'loop') {
        animation.state = 'playing'
      }
    }

    this.isPlaybackPaused = false
  }

  seekProgress(progress: number): void {
    if (!Number.isFinite(progress) || progress < 0 || progress > 1) {
      throw new Error('Animation progress must be between zero and one')
    }

    this.isPlaybackPaused = true
    this.transition = undefined

    for (const animation of Object.values(this.clips)) {
      if (animation.state !== 'stopped') {
        animation.time = progress * animation.duration
        animation.state = 'paused'
      }
    }

    this.refreshPose()
  }

  play(name: string, options: MixOptions = {}): void {
    this.setMix({ [name]: 1 }, { ...options, isRestartEnabled: options.isRestartEnabled ?? true })
  }

  setPlaybackMode(name: string, mode: PlaybackMode): void {
    if (!Object.prototype.hasOwnProperty.call(this.clips, name)) {
      throw new Error(`Unknown animation '${name}'`)
    }

    const animation = this.clips[name]

    animation.setPlaybackMode(mode)

    if (mode === 'loop' && animation.time === animation.duration && animation.state !== 'stopped' && !this.isPaused) {
      animation.time = 0
      animation.state = 'playing'
    }
  }

  setMix(
    weights: Readonly<Record<string, number>>,
    { transitionDuration = 0, isRestartEnabled = false }: MixOptions = {}
  ): void {
    if (!Number.isFinite(transitionDuration) || transitionDuration < 0 || typeof isRestartEnabled !== 'boolean') {
      throw new Error('Animation transition duration must be finite and nonnegative')
    }

    for (const [name, weight] of Object.entries(weights)) {
      if (
        !Object.prototype.hasOwnProperty.call(this.clips, name) ||
        !Number.isFinite(weight) ||
        weight < 0 ||
        weight > 1
      ) {
        throw new Error(`Invalid animation weight for '${name}'`)
      }
    }

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)

    if (totalWeight === 0) {
      this.stop()

      return
    }

    const activeWeight = Object.values(this.clips).reduce(
      (sum, animation) => sum + (animation.state !== 'stopped' ? animation.weight : 0),
      0
    )
    const transition: AnimationTransition = {
      elapsed: 0,
      duration: activeWeight > 0 ? transitionDuration : 0,
      weights: Object.create(null)
    }

    for (const [name, animation] of Object.entries(this.clips)) {
      const target = (weights[name] ?? 0) / totalWeight
      const start = activeWeight > 0 && animation.state !== 'stopped' ? animation.weight / activeWeight : 0

      if (target > 0 && (isRestartEnabled || animation.state === 'stopped')) {
        animation.time = 0
        animation.state = 'playing'
      }

      transition.weights[name] = { start, target }
    }

    this.transition = transition

    if (isRestartEnabled) {
      this.isPlaybackPaused = false

      for (const animation of Object.values(this.clips)) {
        if (
          animation.state === 'paused' &&
          (animation.time < animation.duration || animation.playbackMode === 'loop')
        ) {
          animation.state = 'playing'
        }
      }
    }

    this.updateWeights(0)
  }

  private updateWeights(deltaTime: number): void {
    const transition = this.transition

    if (!transition) {
      return
    }

    transition.elapsed += deltaTime

    const progress = transition.duration > 0 ? Math.min(1, transition.elapsed / transition.duration) : 1

    for (const [name, weights] of Object.entries(transition.weights)) {
      const animation = this.clips[name]

      animation.weight = weights.start + (weights.target - weights.start) * progress

      if (progress === 1 && weights.target === 0) {
        animation.state = 'stopped'
      }
    }

    if (progress === 1) {
      this.transition = undefined
    }
  }

  stop(): void {
    this.transition = undefined
    this.isPlaybackPaused = false

    for (const animation of Object.values(this.clips)) {
      animation.state = 'stopped'
      animation.time = 0
      animation.weight = 0
    }

    this.refreshPose()
  }

  advance(deltaTime: number): void {
    if (!Number.isFinite(deltaTime) || deltaTime < 0) {
      throw new Error('Animation time step must be finite and nonnegative')
    }

    if (!this.isPlaybackPaused) {
      this.updateWeights(deltaTime)
    }

    const animations = Object.values(this.clips)

    animations.forEach((animation) => {
      if (!this.isPlaybackPaused) {
        animation.update(deltaTime * this.playbackSpeed)
      }
    })
  }
}
