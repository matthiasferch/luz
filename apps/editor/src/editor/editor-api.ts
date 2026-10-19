import type { LightType, MotionType, PlaybackMode } from '@luz/formats'
import type {
  AntialiasingMode,
  DebugOverlayCategory,
  EnvironmentSettings,
  RenderingSettings,
  SceneSettings
} from '../settings'

export type { AntialiasingMode } from '../settings'

export type AnimationAction = 'pause' | 'resume' | 'stop'

export interface LoadingProgress {
  stage: string
  completed?: number
  total?: number
}

export type LoadingProgressReporter = (progress: LoadingProgress) => void

export { DEBUG_VISUALIZATION_KEYS } from '@luz/graphics'
export type { DebugVisualization } from '@luz/graphics'
import type { DebugVisualization } from '@luz/graphics'

export interface EditorLight {
  key: string
  label: string
  isEnabled: boolean
}

export interface ModelContent {
  name: string
  type: 'armature' | 'bone' | 'animation'
  boneCount?: number
  children?: ModelContent[]
}

export interface EditorComponent {
  name: string
  type: string
  isVisible?: boolean
  motionMode?: MotionType
  collisionShape?: string
  isActiveCamera?: boolean
  color?: string
  lightKey?: string
  lightType?: LightType
  contents?: ModelContent[]
}

export interface EditorEntity {
  key: string
  label: string
  components: EditorComponent[]
  children: EditorEntity[]
}

export interface SimulationState {
  isRunning: boolean
  timeScale: number
  gravity: number
}

export interface EditorState {
  settings: SceneSettings
  isSimulationRunning: boolean
  lights: EditorLight[]
  entities: EditorEntity[]
}

export interface EditorTelemetry {
  framesPerSecond: number | null
  collisions: {
    bodyCount: number | null
    colliderCount: number | null
    candidateBodyPairCount: number | null
    candidateBodyColliderPairCount: number | null
    manifoldCount: number | null
  }
  culling: {
    visibleBodyCount: number | null
    culledBodyCount: number | null
    visibleLightCount: number | null
    culledLightCount: number | null
  }
  renderer: {
    planarReflections: { renderedCount: number; totalCount: number }
    primitives: { renderedCount: number; submittedCount: number }
    cullChanges: number
    blendChanges: number
    depthChanges: number
    colorMaskChanges: number
    depthMaskChanges: number
  }
  environment: {
    diffuse: string
    specular: string
    mode: string
  }
}

export interface AnimationEntry {
  name: string
  duration: number
  playback?: PlaybackMode
  weight: number
  time: number
  isPlaying: boolean
}

export interface AnimationGroup {
  key: string
  label: string
  isPaused: boolean
  speed: number
  clips: AnimationEntry[]
}

export interface EditorApi {
  destroy(): void
  collectAnimationGroups(): AnimationGroup[]
  getAnimationTime(key: string, name: string): number
  controlAnimation(key: string, action: AnimationAction): void
  seekAnimation(key: string, progress: number): void
  setAnimationSpeed(key: string, speed: number): void
  setAnimationPlayback(key: string, name: string, mode: PlaybackMode): void
  setAnimationMix(
    key: string,
    weights: Record<string, number>,
    transitionDuration: number,
    isRestartEnabled?: boolean
  ): void
  captureEditorState(): EditorState
  collectEditorTelemetry(): EditorTelemetry
  setRenderingSetting<Section extends keyof RenderingSettings, Key extends keyof RenderingSettings[Section]>(
    section: Section,
    key: Key,
    value: RenderingSettings[Section][Key]
  ): RenderingSettings[Section][Key]
  setEnvironmentSetting(key: keyof EnvironmentSettings, value: number): number
  setAntialiasingMode(mode: AntialiasingMode): AntialiasingMode
  setDebugVisualization(value: DebugVisualization | 'none'): void
  setDebugOverlayCategory(category: DebugOverlayCategory, isEnabled: boolean): boolean
  setTimeScale(value: number): number
  setGravity(value: number): number
  setSimulationRunning(isRunning: boolean): boolean
  resetSimulation(): SimulationState
  setLightEnabled(key: string, isEnabled: boolean): boolean
  setComponentVisible(entityPath: string, componentName: string, isVisible: boolean): boolean | undefined
  resetImportedEnvironment(): Promise<SceneSettings['environment']>
  resetImportedEntities(): EditorState
}
