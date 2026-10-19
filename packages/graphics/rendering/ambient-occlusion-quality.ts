import type { AmbientOcclusionQuality } from './settings'

export const AMBIENT_OCCLUSION_QUALITY: Record<
  AmbientOcclusionQuality,
  {
    directionCount: number
    stepCount: number
  }
> = {
  low: { directionCount: 2, stepCount: 4 },
  medium: { directionCount: 4, stepCount: 4 },
  high: { directionCount: 6, stepCount: 6 }
}
