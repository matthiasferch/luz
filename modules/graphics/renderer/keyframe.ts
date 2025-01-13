import { Serializable, Serialize } from '@luz/utilities'
import { vec3, quat } from '@luz/vectors'

abstract class Keyframe extends Serializable<Keyframe> {
  @Serialize()
  readonly index: number
}

export class ScaleKeyframe extends Keyframe {
  @Serialize()
  readonly value: vec3 = vec3.one.copy()
}

export class RotationKeyframe extends Keyframe {
  @Serialize()
  readonly value: quat = quat.identity.copy()
}

export class TranslationKeyframe extends Keyframe {
  @Serialize()
  readonly value: vec3 = vec3.zero.copy()
}
