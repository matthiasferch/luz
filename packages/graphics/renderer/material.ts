import { validateMaterialGraph } from './material-validation'
import { Serializable, Serialize } from '@luz/serialization'
import { AlphaMode, MaterialBlendMode } from '@luz/formats'
import type { MaterialDefinition } from '@luz/formats'

export type { AlphaMode, MaterialBlendMode, MaterialDefinition } from '@luz/formats'
import { createDefaultMaterialGraph, MaterialGraph } from './material-graph'

export interface MaterialOptions extends Omit<MaterialDefinition, 'graph'> {
  graph?: MaterialGraph
}

export class Material extends Serializable {
  @Serialize()
  readonly graph: MaterialGraph

  @Serialize()
  transmissionDepth: number = 0.05

  @Serialize()
  transmissionEdgeFade: number = 0

  @Serialize()
  alphaMode: AlphaMode = 'opaque'

  @Serialize()
  alphaCutoff: number = 0.5

  @Serialize()
  blendMode: MaterialBlendMode = 'none'

  @Serialize()
  isDoubleSided: boolean = false

  constructor({
    graph,
    alphaMode,
    alphaCutoff,
    blendMode,
    transmissionDepth,
    transmissionEdgeFade,
    isDoubleSided
  }: MaterialOptions = {}) {
    super()

    this.graph = graph ?? createDefaultMaterialGraph()

    if (alphaMode !== undefined) {
      this.alphaMode = alphaMode
    }

    if (alphaCutoff !== undefined) {
      this.alphaCutoff = alphaCutoff
    }

    if (blendMode) {
      this.blendMode = blendMode
    }

    if (transmissionDepth !== undefined) {
      this.transmissionDepth = transmissionDepth
    }

    if (transmissionEdgeFade !== undefined) {
      this.transmissionEdgeFade = transmissionEdgeFade
    }

    if (isDoubleSided !== undefined) {
      this.isDoubleSided = isDoubleSided
    }
  }

  static async deserialize(data: unknown): Promise<Material> {
    if (!data || typeof data !== 'object' || !('graph' in data) || !data.graph) {
      throw new Error('Material graph is missing; re-export this model with the current Blender exporter')
    }

    validateMaterialGraph(data.graph)

    return (await super.deserialize(data)) as Material
  }
}
