import type { MaterialGraph } from '@luz/formats'

export type {
  MaterialGraphValue,
  MaterialGraphInput,
  MaterialNodeType,
  MaterialNode,
  MaterialGraphOutput,
  MaterialClosure,
  MaterialVolume,
  MaterialGraph
} from '@luz/formats'

export const createDefaultMaterialGraph = (): MaterialGraph => ({
  version: 1,
  nodes: {},
  surface: { type: 'principled' },
  outputs: {
    baseColor: { value: [0.8, 0.8, 0.8, 1] },
    alpha: { value: 1 },
    normal: { value: [0, 0, 1] },
    metallic: { value: 0 },
    roughness: { value: 0.5 },
    occlusion: { value: 1 },
    emissionColor: { value: [0, 0, 0, 1] },
    emissionStrength: { value: 1 },
    transmission: { value: 0 },
    indexOfRefraction: { value: 1.45 },
    specularLevel: { value: 0.5 },
    subsurfaceWeight: { value: 0 },
    subsurfaceScale: { value: 0.01 }
  }
})
