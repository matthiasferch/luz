import type { RenderTarget } from '../renderer/render-target'
import type { Texture } from '../types/texture'

export interface VolumetricLightingState {
  texture: Texture
  depthTexture: Texture
  target: RenderTarget
  depthTarget: RenderTarget
}

export function createVolumetricLightingState(): VolumetricLightingState {
  return {} as VolumetricLightingState
}
