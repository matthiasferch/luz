import type { RenderTarget } from '../renderer/render-target'
import type { Texture } from '../types/texture'

export interface BlurState {
  vectorTexture?: Texture
  vectorTarget?: RenderTarget
  objectTexture?: Texture
  objectTarget?: RenderTarget
  tileVelocityTexture?: Texture
  tileVelocityTarget?: RenderTarget
  neighborVelocityTexture?: Texture
  neighborVelocityTarget?: RenderTarget
  texture?: Texture
  target?: RenderTarget
}

export function createMotionBlurState(): BlurState {
  return {}
}
