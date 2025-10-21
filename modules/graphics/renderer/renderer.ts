import type { Camera, Light, Model, Transform } from '@luz/core'
import type { Mesh } from '../types/mesh'
import type { FrameBuffer } from '../buffers/frame-buffer'
import type { RenderBuffer } from '../buffers/render-buffer'
import type { UniformBuffer } from '../buffers/uniform-buffer'
import type { Buffer } from '../types/buffer'
import type { Shader, ShaderStage } from '../types/shader'
import type { UniformValue } from '../types/uniform'
import type { Sampler } from '../types/sampler'
import type { Surface } from './surface'
import type { Partition } from './partition'
import type { Program } from '../types/program'
import type { Texture } from '../types/texture'
import type { Material } from './material'
import type { RenderTarget } from './target'
import type { Scissor } from './scissor'
import type { RenderPipeline } from './render-pipeline'
import type { RenderState } from './render-graph'
import { RenderStatistics } from './render-statistics'

export type CullMode = 'None' | 'Front' | 'Back'

export type BlendMode = 'None' | 'Additive' | 'Transparent'

export type DepthTest =
  | 'None'
  | 'Never'
  | 'Always'
  | 'Equal'
  | 'NotEqual'
  | 'Less'
  | 'LessEqual'
  | 'Greater'
  | 'GreaterEqual'

// Abstract rendering interface to support multiple backends (WebGL, WebGPU).
// Implementations must provide the resource managers and draw/state APIs used
// throughout the engine and demo code.
// Backend-agnostic manager interfaces
export interface ShaderManager {
  create(stage: ShaderStage, source: string, headers?: string[]): Shader | null
}

export type UniformData = Partial<{
  uniforms: Record<string, UniformValue>
  uniformBuffers: Record<string, UniformBuffer>
}>

export interface ProgramManager {
  create(vertexShader: Shader, fragmentShader: Shader, data?: UniformData): Program | null
  update(program: Program, data: UniformData): void
  use(program: Program): void
}

export interface MeshManager {
  create(partition: Omit<Partition, 'mesh'>, material: Material): Mesh
  render(mesh: Mesh): void
}

export interface BufferManager {
  create(target: 'FrameBuffer'): FrameBuffer
  create(target: 'RenderBuffer'): RenderBuffer
  create(target: 'UniformBuffer', data?: any): UniformBuffer
  attach(frameBuffer: FrameBuffer, data: Texture | RenderBuffer, attachment: number): void
  format(buffer: RenderBuffer, format: number, width: number, height: number): void
  bind(buffer: Buffer): void
  unbind(type: Buffer.Type): void
}

export interface TextureManager {
  create(surface: Partial<Surface>): Texture
  update(texture: Texture, data: any, x?: number, y?: number, width?: number, height?: number): void
  bind(texture: Texture, unit: number): void
}

export interface SamplerManager {
  create(filtering?: Texture.Filtering, tiling?: Texture.Tiling): Sampler
  update(sampler: Sampler, filtering: Texture.Filtering, tiling: Texture.Tiling): void
  bind(sampler: Sampler, unit: number): void
}

// Abstract rendering interface to support multiple backends (WebGL, WebGPU).
// Implementations must provide the resource managers and draw/state APIs used
// throughout the engine and demo code.
export interface Renderer {
  readonly meshes: MeshManager
  readonly buffers: BufferManager

  readonly shaders: ShaderManager
  readonly programs: ProgramManager

  readonly textures: TextureManager
  readonly samplers: SamplerManager

  readonly defaultTexture: Texture
  readonly defaultMaterial: Material

  // Statistics for UI/debug
  readonly statistics: RenderStatistics

  // Render target and pipeline binding
  bindTarget(target: RenderTarget): void
  bindPipeline(pipeline: RenderPipeline, overrideStates?: Partial<RenderState>): void
  resetMaterialBinding(program: Program): void

  // Global operations per pass
  clear(opts: { color?: any, depth?: number, stencil?: number }): void
  scissor(scissor: Scissor | null): void

  // Pass-level uniforms
  bindCameraUniforms(program: Program, camera: Camera): void
  bindLightUniforms(program: Program, light: Light): void
  bindNestedUniforms(program: Program, values: any): void

  // Draw a model with optional extra uniforms/partition selection
  render<T extends {}>(
    model: Model,
    program: Program,
    transform: Transform,
    additionalUniforms?: T,
    selectedPartitions?: string[]
  ): void
}
