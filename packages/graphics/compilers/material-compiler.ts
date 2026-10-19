import type { Material } from '../renderer/material'
import { RenderMaterial } from '../renderer/render-material'
import { GraphCompiler, type CompiledMaterialGraph } from './graph-compiler'
import type { TextureCompiler } from './texture-compiler'

export class MaterialCompiler {
  private readonly graphs: GraphCompiler
  private readonly allocations = new Map<RenderMaterial, CompiledMaterialGraph>()

  private generation = 0

  constructor(textures: TextureCompiler, maximumTextures: number = 16) {
    this.graphs = new GraphCompiler(textures, maximumTextures)
  }

  async compile(material: Material): Promise<RenderMaterial> {
    const generation = this.generation
    const graph = await this.graphs.compile(material.graph)

    if (generation !== this.generation) {
      this.graphs.release(graph)

      throw new Error('Material compilation was invalidated')
    }

    const compiledMaterial = new RenderMaterial(material, graph)

    this.allocations.set(compiledMaterial, graph)

    return compiledMaterial
  }

  release(material: RenderMaterial): void {
    const graph = this.allocations.get(material)

    if (!graph) {
      return
    }

    this.allocations.delete(material)
    this.graphs.release(graph)
  }

  clear(): void {
    this.generation += 1

    this.allocations.clear()
    this.graphs.clear()
  }
}
