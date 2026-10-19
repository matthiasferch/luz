import type { RenderTarget } from '../renderer/render-target'
import type { Texture } from '../types/texture'

export interface FocusState {
  radiusTextures: Texture[]
  radiusTargets: RenderTarget[]
  prefilterTexture?: Texture
  prefilterTarget?: RenderTarget
  backingTexture?: Texture
  backingDepthTexture?: Texture
  backingTarget?: RenderTarget
  surfaceTexture?: Texture
  surfaceTarget?: RenderTarget
  layerTextures: Texture[]
  layerTarget?: RenderTarget
}

export function createDepthOfFieldState(): FocusState {
  return { radiusTextures: [], radiusTargets: [], layerTextures: [] }
}
