import type { MaterialNode } from './material-node'

export type MaterialGraphValue = number | number[]

export type MaterialGraphInput = { value: MaterialGraphValue } | { node: string; output: string }

export type MaterialGraphOutput =
  | 'baseColor'
  | 'alpha'
  | 'normal'
  | 'metallic'
  | 'roughness'
  | 'occlusion'
  | 'emissionColor'
  | 'emissionStrength'
  | 'transmission'
  | 'indexOfRefraction'
  | 'specularLevel'
  | 'subsurfaceWeight'
  | 'subsurfaceScale'

type OptionalMaterialGraphOutput = 'specularLevel' | 'subsurfaceWeight' | 'subsurfaceScale'
type RequiredMaterialGraphOutput = Exclude<MaterialGraphOutput, OptionalMaterialGraphOutput>

export type MaterialClosure =
  | { type: 'principled' }
  | {
      type: 'glossy'
      color: MaterialGraphInput
      roughness: MaterialGraphInput
      normal?: MaterialGraphInput
    }
  | { type: 'transparent'; color: MaterialGraphInput }
  | { type: 'emission'; color: MaterialGraphInput; strength: MaterialGraphInput }
  | {
      type: 'add'
      firstClosure: MaterialClosure
      secondClosure: MaterialClosure
    }
  | {
      type: 'mix'
      factor: MaterialGraphInput
      firstClosure: MaterialClosure
      secondClosure: MaterialClosure
    }

export interface MaterialVolume {
  type: 'absorption'
  color: MaterialGraphInput
  density: MaterialGraphInput
}

export interface MaterialGraph {
  version: 1
  nodes: Record<string, MaterialNode>
  outputs: Record<RequiredMaterialGraphOutput, MaterialGraphInput> &
    Partial<Record<OptionalMaterialGraphOutput, MaterialGraphInput>>
  surface?: MaterialClosure
  volume?: MaterialVolume
}
