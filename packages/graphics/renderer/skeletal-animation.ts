import { PlaybackMode } from '@luz/formats'
import type { PlaybackState } from '@luz/core'
import { Register, Serialize, Serializable, readDefinition } from '@luz/serialization'
import { ScaleKeyframe, RotationKeyframe, TranslationKeyframe } from './keyframe'

export class Keyframes extends Serializable {
  @Serialize(ScaleKeyframe)
  readonly scale: ScaleKeyframe[] = []

  @Serialize(RotationKeyframe)
  readonly rotation: RotationKeyframe[] = []

  @Serialize(TranslationKeyframe)
  readonly translation: TranslationKeyframe[] = []
}

@Register('skeletalAnimation')
export class SkeletalAnimation extends Serializable {
  @Serialize()
  readonly type = 'skeletalAnimation'

  @Serialize()
  readonly schemaVersion = 1

  @Serialize(Keyframes)
  readonly keyframes: Record<string, Keyframes> = {}

  @Serialize()
  readonly duration!: number

  @Serialize()
  readonly playback?: PlaybackMode

  @Serialize()
  readonly isAutoplayEnabled: boolean = false

  time: number = 0.0
  weight: number = 1.0
  state: PlaybackState = 'stopped'

  private playbackOverride?: PlaybackMode

  get playbackMode(): PlaybackMode {
    return this.playbackOverride ?? this.playback ?? 'once'
  }

  setPlaybackMode(mode: PlaybackMode): void {
    if (mode !== 'loop' && mode !== 'once') {
      throw new Error('Invalid animation playback mode')
    }

    this.playbackOverride = mode
  }

  static async deserialize(value: unknown): Promise<SkeletalAnimation> {
    const data = readDefinition(value, 'Skeletal animation')

    if (data.type !== 'skeletalAnimation' || data.schemaVersion !== 1) {
      throw new Error('Expected a skeletalAnimation document with schemaVersion 1')
    }

    if (
      !data.keyframes ||
      typeof data.keyframes !== 'object' ||
      Array.isArray(data.keyframes) ||
      !Object.keys(data.keyframes).length
    ) {
      throw new Error('Skeletal animation keyframes must be a nonempty bone map')
    }

    if (data.isAutoplayEnabled !== undefined && typeof data.isAutoplayEnabled !== 'boolean') {
      throw new Error('Animation autoplay must be a boolean')
    }

    for (const [name, value] of Object.entries(data.keyframes)) {
      const tracks = readDefinition(value, `Tracks for bone '${name}'`)

      for (const channel of ['translation', 'rotation', 'scale']) {
        const keys = tracks[channel]

        if (
          !Array.isArray(keys) ||
          keys.some((value: unknown) => {
            const key = readDefinition(value, `Keyframe for bone '${name}'`)

            return (
              !Array.isArray(key.value) ||
              key.value.length !== (channel === 'rotation' ? 4 : 3) ||
              !key.value.every(Number.isFinite)
            )
          })
        ) {
          throw new Error(`Invalid ${channel} track for bone ${name}`)
        }
      }
    }

    const animation = (await super.deserialize({
      ...data,
      isAutoplayEnabled: data.isAutoplayEnabled ?? data.playback !== undefined
    })) as SkeletalAnimation

    if (!Number.isFinite(animation.duration) || animation.duration <= 0) {
      throw new Error('Skeletal animation duration must be positive and finite')
    }

    if (animation.playback !== undefined && animation.playback !== 'loop' && animation.playback !== 'once') {
      throw new Error('Invalid skeletal animation playback mode')
    }

    for (const [name, tracks] of Object.entries(animation.keyframes)) {
      for (const channel of ['translation', 'rotation', 'scale'] as const) {
        const keys = tracks[channel]

        let previousTime = -1

        if (!keys?.length) {
          throw new Error(`Missing ${channel} track for bone ${name}`)
        }

        for (const key of keys) {
          if (
            !Number.isFinite(key.time) ||
            key.time < 0 ||
            key.time > animation.duration ||
            key.time <= previousTime ||
            Array.from(key.value).length !== (channel === 'rotation' ? 4 : 3) ||
            !Array.from(key.value).every(Number.isFinite)
          ) {
            throw new Error(`Invalid ${channel} keyframe for bone ${name}`)
          }

          if (channel === 'rotation' && Math.abs(Math.hypot(...key.value) - 1) > 1e-4) {
            throw new Error(`Invalid rotation quaternion for bone ${name}`)
          }

          if (channel === 'scale' && Array.from(key.value).some((value) => Math.abs(value) < 1e-8)) {
            throw new Error(`Singular scale for bone ${name}`)
          }

          previousTime = key.time
        }
      }
    }

    animation.state = animation.isAutoplayEnabled ? 'playing' : 'stopped'
    animation.weight = data.isAutoplayEnabled === false ? 0 : 1

    return animation
  }

  update(deltaTime: number): void {
    if (!Number.isFinite(deltaTime) || deltaTime < 0) {
      throw new Error('Animation delta time must be finite and nonnegative')
    }

    if (this.state === 'playing') {
      this.time += deltaTime

      if (this.playbackMode === 'loop') {
        this.time %= this.duration
      } else if (this.time >= this.duration) {
        this.time = this.duration
        this.state = 'paused'
      }
    } else if (this.state === 'stopped') {
      this.time = 0
    }
  }
}
