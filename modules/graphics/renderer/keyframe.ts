import { Serializable, Serialize } from '@luz/utilities'
import { vec3, quat } from '@luz/vectors'

export abstract class Keyframe<T extends vec3 | quat> extends Serializable<Keyframe<T>> {
  @Serialize()
  readonly index: number

  abstract value: T
}

export class ScaleKeyframe extends Keyframe<vec3> {
  @Serialize()
  readonly value: vec3 = vec3.one.copy()
}

export class RotationKeyframe extends Keyframe<quat> {
  @Serialize()
  readonly value: quat = quat.identity.copy()
}

export class TranslationKeyframe extends Keyframe<vec3> {
  @Serialize()
  readonly value: vec3 = vec3.zero.copy()
}
