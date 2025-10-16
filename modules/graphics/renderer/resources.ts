import { Program } from '../types/program'
import { Uniform } from '../types/uniform'
import { Mesh } from '../types/mesh'
import { Buffer } from '../types/buffer'

export interface IGpuPrograms {
  use(program: Program): void
  update(program: Program, data: Partial<{ uniforms: Record<string, Uniform.Value> }>): void
}

export interface IGpuMeshes {
  render(mesh: Mesh): void
}

export interface IGpuBuffers {
  bind(buffer: Buffer): void
  unbind(type: Buffer.Type): void
}

