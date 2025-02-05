import { Serialize, Serializable } from '@luz/utilities'
import { Keyframe, ScaleKeyframe, RotationKeyframe, TranslationKeyframe } from './keyframe'
import { quat, vec3 } from '@luz/vectors'
import { Armature } from './armature'

class Keyframes extends Serializable<Keyframes> {
  @Serialize(ScaleKeyframe)
  readonly scale: ScaleKeyframe[] = []

  @Serialize(RotationKeyframe)
  readonly rotation: RotationKeyframe[] = []

  @Serialize(TranslationKeyframe)
  readonly translation: TranslationKeyframe[] = []
}

export type BoneTransform = { translation: vec3; rotation: quat; scale: vec3 }

export namespace BoneTransform {
  export const identity: BoneTransform = {
    translation: vec3.zero,
    rotation: quat.identity,
    scale: vec3.one
  }
}

type Interpolate<T> = (v1: T, v2: T, t: number) => T

export class Animation extends Serializable<Animation> {
  @Serialize(Keyframes)
  readonly keyframes: Record<string, Keyframes> = {}

  @Serialize()
  readonly minimum: number

  @Serialize()
  readonly maximum: number

  @Serialize()
  readonly duration: number

  currentTime: number = 0.0

  update(armature: Armature, deltaTime: number) {
    this.currentTime += deltaTime

    const time = this.currentTime % this.duration

    Object.entries(armature.bones).forEach(([name, bone]) => {
      const transform = this.calculateTransform(name, time)

      bone.update(armature, transform)
    })
  }

  private calculateTransform(bone: string, time: number): BoneTransform {
    const keyframes = this.keyframes[bone]

    if (!keyframes) {
      return BoneTransform.identity
    }

    const { translation, rotation, scale } = keyframes

    return {
      translation: this.interpolateKeyframes(time, translation, vec3.interpolate),
      rotation: this.interpolateKeyframes(time, rotation, quat.interpolate),
      scale: this.interpolateKeyframes(time, scale, vec3.interpolate)
    }
  }

  private interpolateKeyframes<T extends vec3 | quat>(
    time: number,
    keyframes: Keyframe<T>[],
    interpolate: Interpolate<T>
  ): T {
    for (let i = 0; i < keyframes.length - 1; i++) {
      const k1 = keyframes[i]
      const k2 = keyframes[i + 1]

      const i1 = k1.index
      const i2 = k2.index

      const v1 = k1.value as T
      const v2 = k2.value as T

      if (time >= i1 && time <= i2) {
        return interpolate(v1, v2, (time - i1) / (i2 - i1))
      }
    }

    return keyframes[keyframes.length - 1].value
  }
}
