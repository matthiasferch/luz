import type { Entity, Reflector } from '@luz/core'
import type { RenderTarget } from '../renderer/render-target'
import type { Texture } from '../types/texture'

export interface ReflectorBinding {
  entity: Entity
  reflector: Reflector
}

export interface ReflectorResources {
  texture: Texture
  blurredTexture: Texture
  target: RenderTarget
  blurredTarget: RenderTarget
  depthTexture: Texture
  colorTarget: RenderTarget
  volumetricTexture: Texture
  volumetricTarget: RenderTarget
  volumetricDepthTexture: Texture
  volumetricDepthTarget: RenderTarget
}

export interface TransmissionResources {
  texture: Texture
  depthTexture: Texture
  target: RenderTarget
}

export interface ReflectionState {
  bindings: ReflectorBinding[]
  renderedCount: number
  resources: Map<Reflector, ReflectorResources>
  transmissionLighting: TransmissionResources[]
}

export function createReflectionState(): ReflectionState {
  return {
    bindings: [],
    renderedCount: 0,
    resources: new Map(),
    transmissionLighting: []
  }
}
