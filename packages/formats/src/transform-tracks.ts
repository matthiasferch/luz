import type { AnimationKeyframe } from './animation-keyframe'
import type { Tuple4, Tuple3 } from './tuples'

export interface TransformTracks {
  translation?: AnimationKeyframe<Tuple3>[]
  rotation?: AnimationKeyframe<Tuple4>[]
  scale?: AnimationKeyframe<Tuple3>[]
}
