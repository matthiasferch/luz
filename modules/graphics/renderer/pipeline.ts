import { Program } from '../types/program'
import { State } from './state'

export type PipelineDescriptor = {
  program: Program
  cullMode: State.CullMode
  blendMode: State.BlendMode
  depthTest: State.DepthTest
  depthMask: boolean
  colorMask: boolean[]
}

export class RenderPipeline {
  readonly program: Program
  readonly cullMode: State.CullMode
  readonly blendMode: State.BlendMode
  readonly depthTest: State.DepthTest
  readonly depthMask: boolean
  readonly colorMask: boolean[]

  constructor(desc: PipelineDescriptor) {
    this.program = desc.program
    this.cullMode = desc.cullMode
    this.blendMode = desc.blendMode
    this.depthTest = desc.depthTest
    this.depthMask = desc.depthMask
    this.colorMask = desc.colorMask
  }
}

