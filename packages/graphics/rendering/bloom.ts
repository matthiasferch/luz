import type { RenderTarget } from '../renderer/render-target'
import type { Texture } from '../types/texture'

export interface BloomState {
  texture?: Texture
  levels: Texture[]
  targets: RenderTarget[]
}

export function createBloomState(): BloomState {
  return { levels: [], targets: [] }
}
