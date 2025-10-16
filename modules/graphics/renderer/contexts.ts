import { Camera, Entity, Light } from '@luz/core'
import { RenderTarget } from '../renderer/target'
import { Scissor } from './scissor'

export type RenderContext = {
  camera: Camera
  time: number
  // Default target for this frame (canvas or intermediate)
  target: RenderTarget
}

export type RenderPassContext = {
  // Active camera for this pass (camera or light-as-camera)
  camera: Camera | null
  // Active light for this pass (null for camera-only passes like Ambient/Depth)
  light: Light | null
  // Render target for this pass
  target: RenderTarget
  // Optional scissor rectangle in pixels (origin bottom-left)
  scissor?: Scissor
  // Optional extra uniforms provided by the pass
  uniforms?: Record<string, unknown>
}

export type VisibilitySet = {
  //lights: Light[]
  entities: Entity[]
}
