import { Matrix4 } from '@luz/math'
import type { RenderTarget } from '../renderer/render-target'
import type { Texture } from '../types/texture'

export interface TemporalState {
  historyTextures: Texture[]
  historyMetadataTextures: Texture[]
  historyLuminanceTextures: Texture[]
  historyTargets: RenderTarget[]
  historyIndex: number
  isHistoryValid: boolean
  historyLength: number
  jitterIndex: number
  currentViewProjectionMatrix: Matrix4
  previousViewProjectionMatrix: Matrix4
}

export function createTemporalState(): TemporalState {
  return {
    historyTextures: [],
    historyMetadataTextures: [],
    historyLuminanceTextures: [],
    historyTargets: [],
    historyIndex: 0,
    isHistoryValid: false,
    historyLength: 0,
    jitterIndex: 0,
    currentViewProjectionMatrix: new Matrix4(),
    previousViewProjectionMatrix: new Matrix4()
  }
}
