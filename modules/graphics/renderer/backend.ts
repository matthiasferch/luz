import { RenderTarget } from './target'
import { Scissor } from './scissor'
import { Program } from '../types/program'
import { Uniform } from '../types/uniform'
import { RenderPipeline, PipelineDescriptor } from './pipeline'
import { Mesh } from '../types/mesh'

export type MaskOptions = {
  color: boolean[]
  depth: boolean
}

export type ClearOptions = {
  color: import('@luz/vectors').vec4
  depth: number
  stencil: number
}

export type RenderPassBeginDesc = {
  target: RenderTarget
  viewport?: { x: number; y: number; width: number; height: number }
  scissor?: Scissor
  clear?: Partial<ClearOptions>
}

export interface GpuRenderPassEncoder {
  setViewport(x: number, y: number, width: number, height: number): void
  setScissor(scissor?: Scissor): void
  setMask(mask: Partial<MaskOptions>): void
  clear(options: Partial<ClearOptions>): void
  setPipeline(pipeline: RenderPipeline): void
  bindProgramUniforms(program: Program, uniforms: Record<string, Uniform.Value>): void
  // Optional helpers for higher-level binding
  bindMaterial(program: Program, material: any, keys: string[]): void
  resetMaterialBinding(program: Program): void
  drawMesh(mesh: Mesh): void
  end(): void
}

export interface GpuCommandEncoder {
  beginRenderPass(desc: RenderPassBeginDesc): GpuRenderPassEncoder
  finish(): void
}

export interface GpuBackend {
  readonly device: unknown
  readonly queue?: unknown
  createCommandEncoder(): GpuCommandEncoder
  // Optional: backends may own a pipeline cache
  getOrCreatePipeline?(desc: PipelineDescriptor): RenderPipeline
}
