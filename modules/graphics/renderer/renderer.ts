import type { Camera, Light, Model, Transform } from '@luz/core'
import type { Meshes } from '../managers/meshes'
import type { Buffers } from '../managers/buffers'
import type { Programs } from '../managers/programs'
import type { Samplers } from '../managers/samplers'
import type { Shaders } from '../managers/shaders'
import type { Textures } from '../managers/textures'
import type { Program } from '../types/program'
import type { Texture } from '../types/texture'
import type { Material } from './material'
import type { RenderTarget } from './target'
import type { Scissor } from './scissor'
import type { RenderStats } from './stats'
import type { RenderPipeline } from './render-pipeline'
import type { RenderState } from './render-graph'

// Abstract rendering interface to support multiple backends (WebGL, WebGPU).
// Implementations must provide the resource managers and draw/state APIs used
// throughout the engine and demo code.
export interface Renderer {
  // Resource managers (required by pipeline setup and model uploading)
  readonly shaders: Shaders
  readonly programs: Programs
  readonly meshes: Meshes
  readonly buffers: Buffers
  readonly textures: Textures
  readonly samplers: Samplers

  // Defaults used when assets are missing
  readonly defaultTexture: Texture
  readonly defaultMaterial: Material

  // Statistics for UI/debug
  readonly stats: RenderStats

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
  setNestedUniforms(program: Program, values: any): void

  // Draw a model with optional extra uniforms/partition selection
  render<T extends {}>(
    model: Model,
    program: Program,
    transform: Transform,
    additionalUniforms?: T,
    selectedPartitions?: string[]
  ): void
}

