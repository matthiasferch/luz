export interface WeightTransition {
  start: number
  target: number
}

export interface AnimationTransition {
  elapsed: number
  duration: number
  weights: Record<string, WeightTransition>
}
