import type { RenderBackend } from '../renderer/render-backend'
import type { RenderMaterial } from '../renderer/render-material'
import type { RenderPipeline } from '../renderer/render-pipeline'
import type { Program } from '../types/program'
import type { Shader } from '../types/shader'
import { defaultMaterialGraphSource } from './material/shader-source'

export class PipelineCompiler {
  private readonly allocations = new Map<RenderPipeline, { shader: Shader; programs: Set<Program> }>()

  constructor(
    private readonly backend: RenderBackend,
    private readonly vertexHeaders: string[],
    private readonly fragmentHeaders: string[]
  ) {}

  compile(pipeline: RenderPipeline, vertexSource: string, fragmentSource: string): void {
    const isMaterialAware = /\bevaluateMaterial\s*\(/.test(fragmentSource)
    const vertexShader = this.backend.shaders.create('vertex', vertexSource, this.vertexHeaders)

    if (!vertexShader) {
      throw new Error(`Failed to compile vertex shader '${pipeline.vertexShader}'`)
    }

    const allocation = { shader: vertexShader, programs: new Set<Program>() }
    const compileProgram = (graphSource: string): Program => {
      const headers = isMaterialAware ? [...this.fragmentHeaders, graphSource] : this.fragmentHeaders
      const fragmentShader = this.backend.shaders.create('fragment', fragmentSource, headers)

      if (!fragmentShader) {
        throw new Error(`Failed to compile fragment shader '${pipeline.fragmentShader}'`)
      }

      // The linker enforces sampler limits after eliminating unused uniforms.
      // Shared headers and material graphs can declare textures this pass never uses.
      try {
        const program = this.backend.programs.create(vertexShader, fragmentShader)

        if (!program) {
          throw new Error(`Failed to link pipeline '${pipeline.fragmentShader}'`)
        }

        allocation.programs.add(program)

        return program
      } finally {
        this.backend.shaders.destroy(fragmentShader)
      }
    }

    let program: Program

    try {
      program = compileProgram(defaultMaterialGraphSource)
    } catch (error) {
      this.backend.shaders.destroy(vertexShader)

      throw error
    }

    this.release(pipeline)
    this.allocations.set(pipeline, allocation)

    pipeline.program = program

    if (!isMaterialAware) {
      pipeline.resolveProgram = null

      return
    }

    const programs = new Map<string, Program>()

    pipeline.resolveProgram = (material: RenderMaterial): Program => {
      if (this.allocations.get(pipeline) !== allocation) {
        throw new Error('Pipeline compilation has been released')
      }

      const cachedProgram = programs.get(material.graphTopology)

      if (cachedProgram) {
        return cachedProgram
      }

      const program = compileProgram(material.graphSource)

      programs.set(material.graphTopology, program)

      return program
    }
  }

  release(pipeline: RenderPipeline): void {
    const allocation = this.allocations.get(pipeline)

    if (!allocation) {
      return
    }

    this.allocations.delete(pipeline)

    for (const program of allocation.programs) {
      this.backend.programs.destroy(program)
    }

    this.backend.shaders.destroy(allocation.shader)

    pipeline.program = null
    pipeline.resolveProgram = null
  }

  clear(): void {
    for (const pipeline of this.allocations.keys()) {
      this.release(pipeline)
    }
  }
}
