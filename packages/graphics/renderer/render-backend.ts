import type { TextureTiling, TextureFiltering } from '@luz/formats'
import type { Light, Projector, Rectangle, Transform } from '@luz/core'
import type { KTXContainer } from '@luz/formats'
import type { Primitive, DrawPrimitive } from '../types/primitive'
import type { PrimitiveOptions, DrawOptions } from '../types/primitive-options'
import type { VertexBuffer } from '../buffers/vertex-buffer'
import type { FrameBuffer } from '../buffers/frame-buffer'
import type { RenderBuffer } from '../buffers/render-buffer'
import type { UniformBuffer } from '../buffers/uniform-buffer'
import type { Buffer } from '../types/buffer'
import type { Shader, ShaderStage } from '../types/shader'
import type { UniformValue } from '../types/uniform'
import type { Sampler } from '../types/sampler'
import type { SurfaceOptions } from './surface'
import type { TextureSource } from '../types/texture-source'
import type { Mesh } from './mesh'
import type { Program } from '../types/program'
import type { Texture } from '../types/texture'
import type { RenderMaterial } from './render-material'
import type { RenderModel } from './render-model'
import type { RenderTarget } from './render-target'
import type { RenderPipeline } from './render-pipeline'
import type { RenderStatistics } from './render-statistics'
import type { Vector4 } from '@luz/math'

import type { BlendMode, CullMode, DepthTest, ColorMask } from '@luz/formats'

export type { BlendMode, CullMode, DepthTest, ColorMask } from '@luz/formats'

export interface RenderState {
  cullMode: CullMode
  blendMode: BlendMode
  depthTest: DepthTest

  depthMask: boolean
  colorMask: ColorMask
}

export interface ClearOptions {
  color: Vector4
  depth: number
  stencil: number
}

export type UniformData = Partial<{
  uniforms: Record<string, UniformValue>
  uniformBuffers: Record<string, UniformBuffer>
}>

export interface ShaderManager {
  create(stage: ShaderStage, source: string, headers?: string[]): Shader | null
  destroy(shader: Shader): void
  destroyAll(): void
}

export interface ProgramManager {
  create(vertexShader: Shader, fragmentShader: Shader, data?: UniformData): Program | null
  update(program: Program, data: UniformData): void
  bind(program: Program): void
  destroy(program: Program): void
  destroyAll(): void
}

export interface PrimitiveManager {
  create(mesh: Mesh, material: RenderMaterial): Primitive
  create(options: PrimitiveOptions): DrawPrimitive
  render(primitive: DrawPrimitive, instanceCount?: number): void
  destroy(primitive: DrawPrimitive): void
  destroyAll(): void
}

export interface BufferManager {
  create(target: 'frameBuffer'): FrameBuffer
  create(target: 'renderBuffer'): RenderBuffer
  create(target: 'uniformBuffer'): UniformBuffer
  create(target: 'vertexBuffer'): VertexBuffer
  update(buffer: UniformBuffer, data: AllowSharedBufferSource, offset?: number): void
  update(buffer: VertexBuffer, data: AllowSharedBufferSource): void

  attach(frameBuffer: FrameBuffer, data: Texture | RenderBuffer, attachment: number): void
  format(buffer: RenderBuffer, format: number, width: number, height: number): void
  destroy(buffer: Buffer): void
  destroyAll(): void

  bind(buffer: Buffer): void
  unbind(type: Buffer.Type): void
}

export interface TextureManager {
  create(surface: SurfaceOptions): Texture
  update(texture: Texture, data: TextureSource, x?: number, y?: number, width?: number, height?: number): void
  bind(texture: Texture, unit: number): void
  destroy(texture: Texture): void
  destroyAll(): void

  create2DFromKTX(container: KTXContainer): Texture
  createCubeFromKTX(container: KTXContainer): Texture
}

export interface SamplerManager {
  create(filtering?: TextureFiltering, tiling?: TextureTiling): Sampler
  update(sampler: Sampler, filtering: TextureFiltering, tiling: TextureTiling): void
  bind(sampler: Sampler, unit: number): void
  destroy(sampler: Sampler): void
  destroyAll(): void
}

export interface RenderBackend {
  destroy(): void
  readonly primitives: PrimitiveManager
  readonly buffers: BufferManager

  readonly shaders: ShaderManager
  readonly programs: ProgramManager

  readonly textures: TextureManager
  readonly samplers: SamplerManager

  readonly defaultTexture: Texture
  readonly defaultMaterial: RenderMaterial
  readonly maximumTextureUnits: number

  readonly statistics: RenderStatistics

  set cullMode(cullMode: CullMode)
  set blendMode(blendMode: BlendMode)
  set depthTest(depthTest: DepthTest)

  set colorMask(colorMask: ColorMask)
  set depthMask(depthMask: boolean)

  set scissor(scissor: Rectangle | null)

  clear(options: Partial<ClearOptions>): void

  bindTarget(target: RenderTarget): void
  copyDepth(source: RenderTarget, destination: RenderTarget): void
  copyColorToTexture(source: RenderTarget, destination: Texture): void
  bindPipeline(pipeline: RenderPipeline, overrideStates?: Partial<RenderState>, program?: Program): void

  bindCameraUniforms(program: Program, camera: Projector): void
  bindLightUniforms(program: Program, light: Light): void
  bindUniforms(program: Program, values: object): void

  resetMaterialBinding(program: Program): void

  draw(primitive: DrawPrimitive, options?: DrawOptions): void

  render<T extends object>(
    model: RenderModel,
    program: Program,
    transform: Transform,
    additionalUniforms?: T,
    selectedMeshes?: string[]
  ): void
}
