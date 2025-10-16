import type { IGpuBuffers, IGpuMeshes, IGpuPrograms } from './resources'
import { Program } from '../types/program'
import { Mesh } from '../types/mesh'
import { RenderStats } from './stats'
import { State } from './state'
import { RenderTarget } from './target'
import { Scissor } from './scissor'
import { RenderPipeline } from './pipeline'
import { ClearOptions, GpuBackend, GpuCommandEncoder, GpuRenderPassEncoder, MaskOptions, RenderPassBeginDesc } from './backend'
import { Uniform } from '../types/uniform'
import { PipelineCache } from './pipeline-cache'
import { PipelineDescriptor } from './pipeline'

class WebGL2RenderPassEncoder implements GpuRenderPassEncoder {
  private currentScissor?: Scissor
  private activePipeline?: RenderPipeline
  private lastMaterialByProgram: WeakMap<Program, any> = new WeakMap()

  constructor(
    private gl: WebGL2RenderingContext,
    private deps: {
      state: State
      programs: IGpuPrograms
      meshes: IGpuMeshes
      buffers: IGpuBuffers
      stats?: RenderStats
    },
    private target: RenderTarget
  ) {}

  setViewport(x: number, y: number, width: number, height: number): void {
    this.gl.viewport(x, y, width, height)
  }

  setScissor(scissor?: Scissor): void {
    if (!scissor) {
      if (this.currentScissor) {
        this.gl.disable(this.gl.SCISSOR_TEST)
        this.currentScissor = undefined
      }
      return
    }
    this.gl.enable(this.gl.SCISSOR_TEST)
    this.gl.scissor(scissor.x, scissor.y, scissor.width, scissor.height)
    this.currentScissor = scissor
  }

  setMask({ color, depth }: Partial<MaskOptions>): void {
    if (color !== undefined) {
      const [r = true, g = true, b = true, a = true] = color
      this.gl.colorMask(r, g, b, a)
      if (this.deps.stats) this.deps.stats.stateChanges.maskColor += 1
    }
    if (depth !== undefined) {
      this.gl.depthMask(depth)
      if (this.deps.stats) this.deps.stats.stateChanges.maskDepth += 1
    }
  }

  clear({ color, depth, stencil }: Partial<ClearOptions>): void {
    let clearMask = 0

    if (color !== undefined) {
      const { r = 0.0, g = 0.0, b = 0.0, a = 1.0 } = color
      this.gl.clearColor(r, g, b, a)
      clearMask |= this.gl.COLOR_BUFFER_BIT
    }

    if (depth !== undefined) {
      this.gl.clearDepth(depth)
      clearMask |= this.gl.DEPTH_BUFFER_BIT
    }

    if (stencil !== undefined) {
      this.gl.clearStencil(stencil)
      clearMask |= this.gl.STENCIL_BUFFER_BIT
    }

    if (clearMask !== 0) {
      this.gl.clear(clearMask)
    }
  }

  setPipeline(pipeline: RenderPipeline): void {
    if (this.activePipeline === pipeline) {
      return
    }
    this.deps.programs.use(pipeline.program)
    this.deps.state.cullMode = pipeline.cullMode
    this.deps.state.blendMode = pipeline.blendMode
    this.deps.state.depthTest = pipeline.depthTest
    this.setMask({ color: pipeline.colorMask, depth: pipeline.depthMask })
    this.activePipeline = pipeline
    if (this.deps.stats) this.deps.stats.pipelineBinds += 1
  }

  bindProgramUniforms(program: Program, uniforms: Record<string, any>): void {
    if (!uniforms) return
    const keys = Object.keys(uniforms)
    if (keys.length === 0) return
    this.deps.programs.update(program, { uniforms })
  }

  drawMesh(mesh: Mesh): void {
    this.deps.meshes.render(mesh)
    if (this.deps.stats) this.deps.stats.draws += 1
  }

  bindMaterial(program: Program, material: any, keys: string[]): void {
    const last = this.lastMaterialByProgram.get(program)
    if (last === material) return
    const uniforms: Record<string, Uniform.Value> = Object.create(null)
    const available = program.uniforms ?? {}
    for (const key of keys) {
      const uname = `material.${key}`
      if (Object.prototype.hasOwnProperty.call(available, uname)) {
        ;(uniforms as any)[uname] = (material as any)[key]
      }
    }
    const names = Object.keys(uniforms)
    if (names.length > 0) {
      this.deps.programs.update(program, { uniforms })
    }
    this.lastMaterialByProgram.set(program, material)
  }

  resetMaterialBinding(program: Program): void {
    this.lastMaterialByProgram.delete(program)
  }

  end(): void {
    // No-op for WebGL2; scissor and state are left as-is intentionally.
  }
}

class WebGL2CommandEncoder implements GpuCommandEncoder {
  constructor(
    private gl: WebGL2RenderingContext,
    private deps: {
      state: State
      programs: IGpuPrograms
      meshes: IGpuMeshes
      buffers: IGpuBuffers
      stats?: RenderStats
    }
  ) {}

  beginRenderPass(desc: RenderPassBeginDesc): GpuRenderPassEncoder {
    const { target, viewport, scissor, clear } = desc

    if (target.frameBuffer) {
      this.deps.buffers.bind(target.frameBuffer)
    } else {
      this.deps.buffers.unbind('FrameBuffer')
    }

    const pass = new WebGL2RenderPassEncoder(this.gl, this.deps, target)

    const vp = viewport ?? { x: 0, y: 0, width: target.width, height: target.height }
    pass.setViewport(vp.x, vp.y, vp.width, vp.height)
    if (scissor) pass.setScissor(scissor)
    if (clear) pass.clear(clear)
    return pass
  }

  finish(): void {
    // No explicit finish needed for WebGL2
  }
}

export class WebGL2Backend implements GpuBackend {
  readonly device: WebGL2RenderingContext
  readonly queue?: unknown
  private pipelines: PipelineCache

  constructor(
    gl: WebGL2RenderingContext,
    private deps: {
      state: State
      programs: IGpuPrograms
      meshes: IGpuMeshes
      buffers: IGpuBuffers
      stats?: RenderStats
    }
  ) {
    this.device = gl
    this.pipelines = new PipelineCache()
  }

  createCommandEncoder(): GpuCommandEncoder {
    return new WebGL2CommandEncoder(this.device, this.deps)
  }

  getOrCreatePipeline(desc: PipelineDescriptor): RenderPipeline {
    return this.pipelines.getOrCreate(desc)
  }
}
