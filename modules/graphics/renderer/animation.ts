import { Serialize, Serializable } from '@luz/utilities'
import { ScaleKeyframe, RotationKeyframe, TranslationKeyframe } from './keyframe'

export class Keyframes extends Serializable {
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

  time: number = 0.0

  weight: number = 1.0

  state: Animation.State = 'Stop'

  update(deltaTime: number) {
    switch (this.state) {
      case 'Play':
        this.time += deltaTime

        if (this.time >= this.duration) {
          this.state = 'Stop'
        }

        break

      case 'Loop':
        this.time += deltaTime
        this.time %= this.duration

        break

      case 'Pause':
        break

      case 'Stop':
        this.time = 0.0

        break
    }
  }
}

export namespace Animation {
  export type State = 'Play' | 'Pause' | 'Stop' | 'Loop'
}
