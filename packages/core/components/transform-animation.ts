import { PlaybackMode, TransformTracks } from '@luz/formats'
import type { AnimationKeyframe } from '@luz/formats'
import { Register, Serialize } from '@luz/serialization'
import type { Vector3 } from '@luz/math'
import { Quaternion } from '@luz/math'
import { Component } from '../component'
import type { Transform } from '../transform'
import type { Pose } from '../pose'

export interface TransformSample {
  translation: number[]
  rotation: number[]
  scale: number[]
}
type TransformChannel = keyof TransformTracks

const identityValues: Record<TransformChannel, number[]> = {
  translation: [0, 0, 0],
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1]
}

@Register('animation')
export class TransformAnimation extends Component {
  readonly type = 'animation'
  readonly timestep: Component.Timestep = 'animation'

  @Serialize()
  readonly schemaVersion = 2

  @Serialize()
  isAutoplayEnabled = false

  @Serialize()
  duration = 0

  @Serialize()
  playback: PlaybackMode = 'once'

  @Serialize()
  tracks: TransformTracks = {}

  static async deserialize(data: unknown): Promise<TransformAnimation> {
    const definition = data as Record<string, unknown>
    const fields = ['type', 'schemaVersion', 'duration', 'playback', 'isAutoplayEnabled', 'tracks']

    if (
      !definition ||
      definition.type !== 'animation' ||
      definition.schemaVersion !== 2 ||
      typeof definition.isAutoplayEnabled !== 'boolean' ||
      (definition.playback !== 'loop' && definition.playback !== 'once') ||
      fields.some((field) => !Object.prototype.hasOwnProperty.call(definition, field)) ||
      Object.keys(definition).some((field) => !fields.includes(field))
    ) {
      throw new Error(
        'Transform animation requires schemaVersion 2 and explicit playback metadata; re-export this asset'
      )
    }

    const animation = (await super.deserialize(data)) as TransformAnimation

    animation.validate()

    return animation
  }

  validate(): void {
    if (
      !Number.isFinite(this.duration) ||
      this.duration <= 0 ||
      (this.playback !== 'loop' && this.playback !== 'once') ||
      typeof this.isAutoplayEnabled !== 'boolean' ||
      this.schemaVersion !== 2
    ) {
      throw new Error('Invalid transform animation duration or playback mode')
    }

    if (
      !this.tracks ||
      typeof this.tracks !== 'object' ||
      Object.keys(this.tracks).length === 0 ||
      Object.values(this.tracks).some((track) => !Array.isArray(track)) ||
      Object.keys(this.tracks).some((channel) => !Object.prototype.hasOwnProperty.call(identityValues, channel))
    ) {
      throw new Error('Transform animation requires at least one track')
    }

    for (const channel of ['translation', 'rotation', 'scale'] as const) {
      const track = this.tracks[channel]

      if (track === undefined) {
        continue
      }

      const length = channel === 'rotation' ? 4 : 3

      if (!Array.isArray(track) || track.length < 2) {
        throw new Error(`Transform animation ${channel} track requires at least two keyframes`)
      }

      let previousTime = -Infinity

      for (const keyframe of track) {
        if (
          !Number.isFinite(keyframe?.time) ||
          keyframe.time < 0 ||
          keyframe.time > this.duration ||
          keyframe.time <= previousTime ||
          !Array.isArray(keyframe?.value) ||
          keyframe.value.length !== length ||
          keyframe.value.some((value) => !Number.isFinite(value))
        ) {
          throw new Error(`Invalid transform animation ${channel} keyframe`)
        }

        previousTime = keyframe.time

        if (channel === 'rotation' && Math.abs(Math.hypot(...keyframe.value) - 1) > 1e-4) {
          throw new Error('Transform animation rotation must be a unit quaternion')
        }

        if (channel === 'scale' && keyframe.value.some((value) => value < 1e-8)) {
          throw new Error('Transform animation scale must stay nonsingular and preserve its sign')
        }
      }

      if (track[0].time !== 0 || Math.abs(track[track.length - 1].time - this.duration) > 1e-9) {
        throw new Error(`Transform animation ${channel} track must span the complete duration`)
      }
    }
  }

  get hasScaleChanges(): boolean {
    return Boolean(
      this.tracks.scale?.some((keyframe) =>
        keyframe.value.some((value, index) => Math.abs(value - identityValues.scale[index]) > 1e-6)
      )
    )
  }

  private findSegment(
    track: AnimationKeyframe[],
    time: number
  ): {
    firstValue: AnimationKeyframe
    secondValue: AnimationKeyframe
    alpha: number
  } {
    if (time <= track[0].time) {
      return { firstValue: track[0], secondValue: track[1], alpha: 0 }
    }

    if (time >= track[track.length - 1].time) {
      return { firstValue: track[track.length - 2], secondValue: track[track.length - 1], alpha: 1 }
    }

    let lowerIndex = 0
    let upperIndex = track.length - 1

    while (lowerIndex + 1 < upperIndex) {
      const middleIndex = Math.floor((lowerIndex + upperIndex) / 2)

      if (track[middleIndex].time <= time) {
        lowerIndex = middleIndex
      } else {
        upperIndex = middleIndex
      }
    }

    const firstValue = track[lowerIndex]
    const secondValue = track[upperIndex]

    return { firstValue, secondValue, alpha: (time - firstValue.time) / (secondValue.time - firstValue.time) }
  }

  private interpolateVector(channel: 'translation' | 'scale', time: number, destination: Vector3): Vector3 {
    const track = this.tracks[channel]

    if (!track) {
      destination.set(identityValues[channel])

      return destination
    }

    const { firstValue, secondValue, alpha } = this.findSegment(track, time)

    for (let index = 0; index < 3; index++) {
      const value = firstValue.value[index]

      destination[index] = value + (secondValue.value[index] - value) * alpha
    }

    return destination
  }

  private interpolateRotation(time: number, destination: Quaternion): Quaternion {
    const track = this.tracks.rotation

    if (!track) {
      destination.set(identityValues.rotation)

      return destination
    }

    const { firstValue, secondValue, alpha } = this.findSegment(track, time)

    return Quaternion.interpolateSpherical(firstValue.value, secondValue.value, alpha, destination)
  }

  sample(time: number, destination: Pose): Pose {
    if (!Number.isFinite(time) || time < 0) {
      throw new Error('Animation sample time must be finite and nonnegative')
    }

    this.interpolateVector('translation', time, destination.translation)
    this.interpolateVector('scale', time, destination.scale)
    this.interpolateRotation(time, destination.rotation)

    return destination
  }

  update(_transform: Transform, _deltaTime: number): void {
    throw new Error('Transform animation must be evaluated through the entity mixer')
  }
}

export function isTransformAnimation(component: Component): component is TransformAnimation {
  return component.type === 'animation'
}
