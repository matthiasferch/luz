import { Program } from '../types/program'
import { RenderState } from './render-graph'

export type RenderPipeline = RenderState & {
  program: Program
}
