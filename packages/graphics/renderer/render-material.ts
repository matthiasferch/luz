import type { UniformValue } from '../types/uniform'
import type { CompiledMaterialGraph } from '../compilers/graph-compiler'
import type { AlphaMode, Material, MaterialBlendMode } from './material'

export class RenderMaterial {
  readonly graphSource: string
  readonly graphTopology: string
  readonly graphTextureCount: number
  readonly uniforms: Record<string, UniformValue>
  readonly alphaMode: AlphaMode
  readonly blendMode: MaterialBlendMode
  readonly isDoubleSided: boolean

  get isOpaque(): boolean {
    return this.alphaMode !== 'blend' && this.blendMode !== 'additive' && this.blendMode !== 'transmissive'
  }

  constructor(source: Material, graph: CompiledMaterialGraph) {
    this.graphSource = graph.source
    this.graphTopology = graph.topology
    this.graphTextureCount = graph.textureCount
    this.uniforms = {
      ...graph.uniforms,
      isMaterialAlphaMasked: source.alphaMode === 'mask',
      materialAlphaCutoff: source.alphaCutoff,
      materialTransmissionDepth: source.transmissionDepth,
      materialTransmissionEdgeFade: source.transmissionEdgeFade,
      isMaterialDoubleSided: source.isDoubleSided,
      isMaterialAlphaBlended: source.alphaMode === 'blend',
      materialTemporalReactive:
        source.alphaMode === 'blend' || source.blendMode === 'additive'
          ? 1
          : source.blendMode === 'transmissive'
            ? 0.85
            : 0
    }
    this.alphaMode = source.alphaMode
    this.blendMode = source.blendMode
    this.isDoubleSided = source.isDoubleSided
  }
}
