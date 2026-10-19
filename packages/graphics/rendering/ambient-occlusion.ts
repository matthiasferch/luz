import type { RenderTarget } from '../renderer/render-target'
import type { Texture } from '../types/texture'

export interface AmbientOcclusionState {
  normalTexture?: Texture
  rawTexture?: Texture
  blurredTexture?: Texture
  texture?: Texture
  historyTextures: Texture[]
  historyMetadataTextures: Texture[]
  historyIndex: number
  isHistoryValid: boolean
  frameIndex: number
  normalTarget?: RenderTarget
  rawTarget?: RenderTarget
  blurredTarget?: RenderTarget
  target?: RenderTarget
  historyTargets: RenderTarget[]
}

export function createAmbientOcclusionState(): AmbientOcclusionState {
  return {
    historyTextures: [],
    historyMetadataTextures: [],
    historyIndex: 0,
    isHistoryValid: false,
    frameIndex: 0,
    historyTargets: []
  }
}
