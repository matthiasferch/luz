import { validateMaterialGraph } from '../renderer/material-validation'
import type { MaterialGraph } from '../renderer/material-graph'
import type { UniformValue } from '../types/uniform'
import type { TextureCompiler } from './texture-compiler'
import type { Texture } from '../types/texture'
import { generateGraphSource } from './material/generate-source'
import { createTopologyKey } from './material/topology'
import { compileGraphBindings } from './material/compile-bindings'

export { defaultMaterialGraphSource, materialGraphHelpers } from './material/shader-source'

export interface CompiledMaterialGraph {
  source: string
  topology: string
  uniforms: Record<string, UniformValue>
  textureCount: number
}

export class GraphCompiler {
  private readonly allocations = new Map<CompiledMaterialGraph, Texture[]>()

  private generation = 0

  constructor(
    private readonly textures: TextureCompiler,
    private readonly maximumTextures: number = 16
  ) {}

  async compile(graph: MaterialGraph): Promise<CompiledMaterialGraph> {
    this.validate(graph)

    const generation = this.generation
    const source = generateGraphSource(graph)
    const textureCount = Object.keys(source.textures).length

    if (textureCount > this.maximumTextures) {
      throw new Error(
        `Material graph uses ${textureCount} textures, exceeding the configured limit of ${this.maximumTextures}`
      )
    }

    const topology = createTopologyKey(graph)
    const bindings = await compileGraphBindings(source, this.textures)

    if (generation !== this.generation) {
      for (const texture of bindings.textures) {
        this.textures.release(texture)
      }

      throw new Error('Material graph compilation was invalidated')
    }

    const compiledGraph = {
      source: source.source,
      topology,
      uniforms: bindings.uniforms,
      textureCount
    }

    this.allocations.set(compiledGraph, bindings.textures)

    return compiledGraph
  }

  release(graph: CompiledMaterialGraph): void {
    const textures = this.allocations.get(graph)

    if (!textures) {
      return
    }

    this.allocations.delete(graph)

    for (const texture of textures) {
      this.textures.release(texture)
    }
  }

  clear(): void {
    this.generation += 1

    for (const graph of this.allocations.keys()) {
      this.release(graph)
    }
  }

  validate(graph: unknown): asserts graph is MaterialGraph {
    validateMaterialGraph(graph)
  }
}
