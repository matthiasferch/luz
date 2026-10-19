import type { MaterialGraph } from './material-graph'
import type { AlphaMode, MaterialBlendMode } from './render-state'

export interface MaterialDefinition {
  graph: MaterialGraph
  transmissionDepth?: number
  transmissionEdgeFade?: number
  alphaMode?: AlphaMode
  alphaCutoff?: number
  blendMode?: MaterialBlendMode
  isDoubleSided?: boolean
}
