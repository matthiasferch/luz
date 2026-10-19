import type { Vector2 } from '@luz/math'
import type { LightBatch } from '../renderer/light-batch'
import type { RenderTarget } from '../renderer/render-target'
import type { Texture } from '../types/texture'

export interface CullingStatistics {
  visibleBodyCount: number
  culledBodyCount: number
  visibleLightCount: number
  culledLightCount: number
}
export interface FrameResult {
  readonly width: number
  readonly height: number
  readonly target: RenderTarget
  readonly depthTexture: Texture
  readonly depthJitter: Vector2
  readonly lightBatches: readonly LightBatch[]
  readonly cullingStatistics: Readonly<CullingStatistics>
  readonly renderedReflectorCount: number
  readonly reflectorCount: number
}
