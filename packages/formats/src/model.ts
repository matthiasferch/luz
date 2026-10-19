import type { GeometryReference, IndexDescriptor, BoundingBoxDefinition, VertexDescriptor } from './geometry'
import type { MaterialDefinition } from './material'
import type { PrimitiveTopology } from './render-state'
import type { AnimationReferences } from './skeletal-animation'
import type { Tuple3, Tuple4, Tuple16 } from './tuples'

export interface BoneWeight {
  vertex: number
  indices: Tuple4
  weights: Tuple4
}

export interface BoneDefinition {
  name: string
  parent?: string
  head: Tuple3
  tail: Tuple3
  bindMatrix: Tuple16
}

export interface ArmatureDefinition {
  bones: BoneDefinition[]
}

export interface MeshDefinition {
  topology: PrimitiveTopology
  vertices: number[] | VertexDescriptor
  indices?: number[] | IndexDescriptor
  boundingBox?: BoundingBoxDefinition
  weights?: BoneWeight[]
  material?: string
}

export interface ModelDefinition {
  $schema?: string
  type: 'model'
  isVisible?: boolean
  meshes: Record<string, MeshDefinition>
  materials?: Record<string, MaterialDefinition>
  armatures?: Record<string, ArmatureDefinition>
  geometry?: GeometryReference
  animations?: AnimationReferences
}
