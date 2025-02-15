import { Serialize, Serializable } from '@luz/utilities'
import { Keyframe, ScaleKeyframe, RotationKeyframe, TranslationKeyframe } from './keyframe'
import { quat, vec3 } from '@luz/vectors'
import { Armature } from './armature'
import { Transform } from '@luz/core'

class Keyframes extends Serializable {
  @Serialize(ScaleKeyframe)
  readonly scale: ScaleKeyframe[] = []

  @Serialize(RotationKeyframe)
  readonly rotation: RotationKeyframe[] = []

  @Serialize(TranslationKeyframe)
  readonly translation: TranslationKeyframe[] = []
}

export class Animation extends Serializable {
  @Serialize(Keyframes)
  readonly keyframes: Record<string, Keyframes> = {}

  @Serialize()
  readonly duration: number

  currentTime: number = 0.0

  update(armature: Armature, deltaTime: number) {
    this.currentTime += deltaTime

    const time = this.currentTime % this.duration

    Object.entries(armature.rootBones).forEach(([name, bone]) => {
      bone.update(name, armature, this, time)
    })
  }

  transform(keyframes: Keyframes, time: number): Transform {
    if (!keyframes) {
      return Transform.origin
    }

    const { translation, rotation, scale } = keyframes

    return new Transform({
      translation: this.interpolateKeyframes(time, translation, vec3.interpolate),
      rotation: this.interpolateKeyframes(time, rotation, quat.interpolate),
      scale: this.interpolateKeyframes(time, scale, vec3.interpolate)
    })
  }

  private interpolateKeyframes<T extends vec3 | quat>(
    time: number,
    keyframes: Keyframe<T>[],
    interpolate: (v1: T, v2: T, t: number) => T
  ): T {
    for (let i = 0; i < keyframes.length - 1; i++) {
      const k1 = keyframes[i]
      const k2 = keyframes[i + 1]

      const t1 = k1.time
      const t2 = k2.time

      const v1 = k1.value
      const v2 = k2.value

      if (time >= t1 && time <= t2) {
        return interpolate(v1, v2, (time - t1) / (t2 - t1))
      }
    }

    return keyframes[keyframes.length - 1].value
  }
}
