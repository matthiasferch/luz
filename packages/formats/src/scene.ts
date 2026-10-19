import type { SynchronizationPolicy } from './synchronization-policy'
import type { ColliderDefinition, ComponentDefinition } from './components'
import type { Tuple4, Tuple3 } from './tuples'

export interface EnvironmentDefinition {
  sky: string
  radiance: string
  irradiance: string
  rotation?: number
}

export interface TransformDefinition {
  translation?: Tuple3
  rotation?: Tuple4
  scale?: Tuple3
}

export interface EntityReference extends TransformDefinition {
  $schema?: string
  entity: string
  components?: never
  children?: never
}

export interface EntityDefinition extends TransformDefinition {
  $schema?: string
  entity?: never
  components?: Record<string, ComponentDefinition | string>
  children?: Record<string, EntityDefinition | EntityReference>
}

export interface SceneDefinition {
  $schema?: string
  entities: Record<string, EntityDefinition | EntityReference>
  colliders?: Record<string, ColliderDefinition>
  environment?: EnvironmentDefinition
  gravity?: Tuple3
  linearDamping?: number
  angularDamping?: number
  fixedTimeStep?: number
  maximumSubsteps?: number
  synchronizationPolicy?: SynchronizationPolicy
}
