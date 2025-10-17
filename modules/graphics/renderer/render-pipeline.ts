import { Program } from '../types/program'
import { State } from './state'

export type RenderState = {
  cullMode: State.CullMode
  blendMode: State.BlendMode
  depthTest: State.DepthTest

  depthMask: boolean
  colorMask: boolean[]
}

export type RenderPipeline = RenderState & {
  program: Program
}
