import type { PlaybackMode } from '@luz/formats'
import type { MixOptions, PlaybackController, PlaybackState, PlaybackView } from './playback-controller'
import type { AnimationTransition } from './animation-transition'
import type { TransformAnimation } from './components/transform-animation'
import { Pose } from './pose'
import type { Transform } from './transform'

export interface Playback extends PlaybackView {
  readonly animation: TransformAnimation
}

interface MutablePlayback extends Playback {
  time: number
  weight: number
  playbackMode: PlaybackMode
}

export class AnimationMixer implements PlaybackController {
  private readonly playbacks: Record<string, MutablePlayback> = Object.create(null)

  private isPlaybackPaused = false
  private playbackSpeed = 1

  private readonly referencePose = new Pose()
  private readonly samplePose = new Pose()
  private readonly blendedPose = new Pose()

  private transition?: AnimationTransition

  get animations(): Readonly<Record<string, Playback>> {
    return this.playbacks
  }

  get isPaused(): boolean {
    return this.isPlaybackPaused
  }

  get speed(): number {
    return this.playbackSpeed
  }

  constructor(
    private readonly transform: Transform,
    animations: Record<string, TransformAnimation>
  ) {
    this.referencePose.copyFrom(transform)
    this.refresh(animations)
  }

  refresh(animations: Record<string, TransformAnimation>): void {
    const wasPlaybackActive = this.hasActiveAnimations

    for (const name of Object.keys(this.playbacks)) {
      if (animations[name] !== this.playbacks[name].animation) {
        delete this.playbacks[name]
        this.transition = undefined
      }
    }

    for (const [name, animation] of Object.entries(animations)) {
      if (!Object.prototype.hasOwnProperty.call(this.playbacks, name)) {
        animation.validate()

        const mixer = this

        this.playbacks[name] = {
          get duration(): number {
            return animation.duration
          },

          get state(): PlaybackState {
            if (this.weight === 0) {
              return 'stopped'
            }

            return mixer.isPaused || (this.playbackMode === 'once' && this.time >= animation.duration)
              ? 'paused'
              : 'playing'
          },
          animation,
          time: 0,
          weight: animation.isAutoplayEnabled ? 1 : 0,
          playbackMode: animation.playback
        }
      }
    }

    this.normalizeWeights()

    if (wasPlaybackActive && !this.hasActiveAnimations) {
      this.applyPose(this.transform, 0)
    }
  }

  private normalizeWeights(): void {
    const totalWeight = Object.values(this.playbacks).reduce((sum, entry) => sum + entry.weight, 0)

    if (totalWeight > 0) {
      for (const entry of Object.values(this.playbacks)) {
        entry.weight /= totalWeight
      }
    }
  }

  get hasActiveAnimations(): boolean {
    return Object.values(this.playbacks).some((entry) => entry.weight > 0)
  }

  reset(): void {
    this.isPlaybackPaused = false
    this.playbackSpeed = 1
    this.transition = undefined

    for (const entry of Object.values(this.playbacks)) {
      entry.time = 0
      entry.weight = entry.animation.isAutoplayEnabled ? 1 : 0
      entry.playbackMode = entry.animation.playback
    }

    this.normalizeWeights()
  }

  pause(): void {
    this.isPlaybackPaused = true
  }

  resume(): void {
    const activeAnimations = Object.values(this.playbacks).filter((entry) => entry.weight > 0)

    if (activeAnimations.length && activeAnimations.every((entry) => entry.time >= entry.animation.duration)) {
      for (const entry of activeAnimations) {
        entry.time = 0
      }
    }

    this.isPlaybackPaused = false
  }

  stop(): void {
    this.transition = undefined
    this.isPlaybackPaused = false

    for (const entry of Object.values(this.playbacks)) {
      entry.time = 0
      entry.weight = 0
    }

    this.applyPose(this.transform, 0)
  }

  seekProgress(progress: number): void {
    if (!Number.isFinite(progress) || progress < 0 || progress > 1) {
      throw new Error('Animation progress must be between zero and one')
    }

    this.isPlaybackPaused = true
    this.transition = undefined

    for (const entry of Object.values(this.playbacks)) {
      if (entry.weight > 0) {
        entry.time = progress * entry.animation.duration
      }
    }

    this.applyPose(this.transform, 0)
  }

  setSpeed(speed: number): void {
    if (!Number.isFinite(speed) || speed <= 0) {
      throw new Error('Animation speed must be positive and finite')
    }

    this.playbackSpeed = speed
  }

  setPlaybackMode(name: string, playback: PlaybackMode): void {
    const entry = this.playbacks[name]

    if (!entry || !['loop', 'once'].includes(playback)) {
      throw new Error('Invalid animation name or playback mode')
    }

    entry.playbackMode = playback

    if (playback === 'loop' && entry.time === entry.animation.duration && !this.isPlaybackPaused) {
      entry.time = 0
    }
  }

  play(name: string, options: MixOptions = {}): void {
    this.setMix({ [name]: 1 }, { ...options, isRestartEnabled: options.isRestartEnabled ?? true })
  }

  setMix(
    weights: Readonly<Record<string, number>>,
    { transitionDuration = 0, isRestartEnabled = false }: MixOptions = {}
  ): void {
    if (
      !Number.isFinite(transitionDuration) ||
      transitionDuration < 0 ||
      typeof isRestartEnabled !== 'boolean' ||
      Object.entries(weights).some(
        ([name, weight]) =>
          !Object.prototype.hasOwnProperty.call(this.playbacks, name) ||
          !Number.isFinite(weight) ||
          weight < 0 ||
          weight > 1
      )
    ) {
      throw new Error('Invalid animation weights or transition duration')
    }

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    const activeWeight = Object.values(this.playbacks).reduce((sum, entry) => sum + entry.weight, 0)

    if (totalWeight === 0) {
      this.stop()

      return
    }

    const transition: AnimationTransition = {
      elapsed: 0,
      duration: activeWeight > 0 ? transitionDuration : 0,
      weights: Object.create(null)
    }

    for (const [name, entry] of Object.entries(this.playbacks)) {
      const target = (weights[name] ?? 0) / totalWeight

      if (target > 0 && (isRestartEnabled || entry.weight === 0)) {
        entry.time = 0
      }

      transition.weights[name] = { start: activeWeight > 0 ? entry.weight / activeWeight : 0, target }
    }

    this.transition = transition

    if (isRestartEnabled) {
      this.isPlaybackPaused = false
    }

    this.updateWeights(0)
  }

  private updateWeights(deltaTime: number): void {
    if (!this.transition) {
      return
    }

    this.transition.elapsed += deltaTime

    const progress = this.transition.duration > 0 ? Math.min(1, this.transition.elapsed / this.transition.duration) : 1

    for (const [name, weights] of Object.entries(this.transition.weights)) {
      this.playbacks[name].weight = weights.start + (weights.target - weights.start) * progress

      if (progress === 1 && weights.target === 0) {
        this.playbacks[name].time = 0
      }
    }

    if (progress === 1) {
      this.transition = undefined
    }
  }

  advance(deltaTime: number): Pose {
    if (!Number.isFinite(deltaTime) || deltaTime < 0) {
      throw new Error('Animation delta time must be finite and nonnegative')
    }

    if (!this.isPlaybackPaused) {
      for (const [name, entry] of Object.entries(this.playbacks)) {
        if (entry.weight > 0 || (this.transition?.weights[name]?.target ?? 0) > 0) {
          const time = entry.time + deltaTime * this.playbackSpeed

          entry.time =
            entry.playbackMode === 'loop' ? time % entry.animation.duration : Math.min(time, entry.animation.duration)
        }
      }

      this.updateWeights(deltaTime)
    }

    const totalWeight = Object.values(this.playbacks).reduce((sum, entry) => sum + entry.weight, 0)
    const pose = this.blendedPose

    this.referencePose.copyTo(pose)

    if (totalWeight === 0) {
      return pose
    }

    pose.translation.set([0, 0, 0])
    pose.rotation.set([0, 0, 0, 0])
    pose.scale.set([0, 0, 0])

    let referenceRotation: number[] | undefined

    for (const entry of Object.values(this.playbacks)) {
      if (entry.weight === 0) {
        continue
      }

      const sample = entry.animation.sample(entry.time, this.samplePose)
      const weight = entry.weight / totalWeight

      referenceRotation ??= Array.from(sample.rotation)

      const direction =
        referenceRotation.reduce((sum, value, index) => sum + value * sample.rotation[index], 0) < 0 ? -1 : 1

      for (let index = 0; index < 3; index++) {
        pose.translation[index] += sample.translation[index] * weight
        pose.scale[index] += sample.scale[index] * weight
      }

      for (let index = 0; index < 4; index++) {
        pose.rotation[index] += sample.rotation[index] * weight * direction
      }
    }

    pose.rotation.normalize()
    this.referencePose.rotation.transformVector3(pose.translation, pose.translation).add(this.referencePose.translation)
    this.referencePose.rotation.multiply(pose.rotation, pose.rotation).normalize()

    for (let index = 0; index < 3; index++) {
      pose.scale[index] *= this.referencePose.scale[index]
    }

    return pose
  }

  applyPose(transform: Transform, deltaTime: number): void {
    const pose = this.advance(deltaTime)

    transform.translation.set(pose.translation)
    transform.rotation.set(pose.rotation)
    transform.scale.set(pose.scale)
  }
}
