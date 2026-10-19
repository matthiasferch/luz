import type { AnimationKeyframe } from '@luz/formats'
import { Serializable, Serialize } from '@luz/serialization'
import { Vector3, Quaternion } from '@luz/math'

export abstract class Keyframe<T extends Vector3 | Quaternion> extends Serializable implements AnimationKeyframe<T> {
  @Serialize()
  readonly time!: number

  abstract value: T
}

export class ScaleKeyframe extends Keyframe<Vector3> {
  @Serialize()
  readonly value: Vector3 = Vector3.createOne()
}

export class RotationKeyframe extends Keyframe<Quaternion> {
  @Serialize()
  readonly value: Quaternion = Quaternion.createIdentity()
}

export class TranslationKeyframe extends Keyframe<Vector3> {
  @Serialize()
  readonly value: Vector3 = Vector3.createZero()
}
