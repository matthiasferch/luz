import { Serialize, Serializable } from '@luz/utilities'
import { ScaleKeyframe, RotationKeyframe, TranslationKeyframe } from './keyframe'

class Keyframes extends Serializable<Keyframes> {
  @Serialize(ScaleKeyframe)
  readonly scale: ScaleKeyframe[] = []

  @Serialize(RotationKeyframe)
  readonly rotation: RotationKeyframe[] = []

  @Serialize(TranslationKeyframe)
  readonly translation: TranslationKeyframe[] = []
}

export class Animation extends Serializable<Animation> {
  @Serialize(Keyframes)
  readonly keyframes: Record<string, Keyframes> = {}
}
