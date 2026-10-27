import type { PlaybackMode } from '@luz/formats'
import { computed, inject, readonly, ref, type InjectionKey, type Ref } from 'vue'
import type { DebugOverlayCategory, EnvironmentSettings, RenderingSettings, SceneSettings } from '../settings'
import {
  DEBUG_VISUALIZATION_KEYS,
  type AntialiasingMode,
  type DebugVisualization,
  type EditorApi,
  type AnimationGroup,
  type AnimationAction,
  type EditorEntity,
  type EditorLight,
  type EditorTelemetry,
  type LoadingProgress
} from './editor-api'
import type { SceneDescriptor, ExportProgress } from './scene-catalog'

const createEmptyTelemetry = (): EditorTelemetry => ({
  framesPerSecond: null,
  collisions: {
    bodyCount: null,
    colliderCount: null,
    candidateBodyPairCount: null,
    candidateBodyColliderPairCount: null,
    manifoldCount: null
  },
  culling: { visibleBodyCount: null, culledBodyCount: null, visibleLightCount: null, culledLightCount: null },
  renderer: {
    planarReflections: { renderedCount: 0, totalCount: 0 },
    primitives: { renderedCount: 0, submittedCount: 0 },
    cullChanges: 0,
    blendChanges: 0,
    depthChanges: 0,
    colorMaskChanges: 0,
    depthMaskChanges: 0
  },
  environment: { diffuse: '—', specular: '—', mode: '—' }
})

export type EditorStore = ReturnType<typeof createEditorStore>
export const editorStoreKey: InjectionKey<EditorStore> = Symbol('luz-editor-store')

export const createEditorStore = () => {
  const runtime = ref<EditorApi | null>(null)
  const settings = ref<SceneSettings | null>(null)
  const lights = ref<EditorLight[]>([])
  const entities = ref<EditorEntity[]>([])
  const animationGroups = ref<AnimationGroup[]>([])
  const scenes = ref<SceneDescriptor[]>([])
  const activeSceneId = ref<string | null>(null)
  const telemetry = ref<EditorTelemetry>(createEmptyTelemetry())
  const status = ref<'loading' | 'ready' | 'error'>('loading')
  const loadingProgress = ref<LoadingProgress>({ stage: 'Preparing renderer' })
  const error = ref<string | null>(null)
  const isEnvironmentResetting = ref(false)
  const isSceneReloading = ref(false)
  const sceneExportProgress = ref<ExportProgress | null>(null)
  const isSimulationRunning = ref(false)
  const lastAntialiasingMode = ref<Exclude<AntialiasingMode, 'off'>>('taa')

  let telemetryTimer: number | undefined
  let loadSceneCatalog: (() => Promise<SceneDescriptor[]>) | undefined
  let activateSceneById: ((id: string) => void) | undefined

  const configureScenes = (
    catalog: SceneDescriptor[],
    activeId: string | null,
    refresh: () => Promise<SceneDescriptor[]>,
    activate: (id: string) => void
  ) => {
    scenes.value = catalog
    activeSceneId.value = activeId
    loadSceneCatalog = refresh
    activateSceneById = activate
  }

  const refreshScenes = async (): Promise<void> => {
    if (!loadSceneCatalog) {
      return
    }

    scenes.value = await loadSceneCatalog()
  }

  const activateScene = (id: string): boolean => {
    const scene = scenes.value.find((candidate) => candidate.id === id)

    if (!scene?.isValid) {
      return false
    }

    if (id !== activeSceneId.value) {
      activateSceneById?.(id)
    }

    return true
  }

  const attach = (api: EditorApi) => {
    if (telemetryTimer !== undefined) {
      window.clearInterval(telemetryTimer)
    }

    runtime.value = api

    const state = api.captureEditorState()

    settings.value = state.settings
    isSimulationRunning.value = state.isSimulationRunning

    if (state.settings.rendering.antialiasing.method !== 'off') {
      lastAntialiasingMode.value = state.settings.rendering.antialiasing.method
    }

    lights.value = state.lights
    entities.value = state.entities
    telemetry.value = api.collectEditorTelemetry()
    animationGroups.value = api.collectAnimationGroups?.() ?? []
    status.value = 'ready'
    telemetryTimer = window.setInterval(() => {
      telemetry.value = api.collectEditorTelemetry()
      animationGroups.value = api.collectAnimationGroups?.() ?? []
    }, 250)
  }

  const fail = (reason: unknown) => {
    if (telemetryTimer !== undefined) {
      window.clearInterval(telemetryTimer)

      telemetryTimer = undefined
    }

    error.value = reason instanceof Error ? reason.message : String(reason)
    status.value = 'error'
  }

  const setLoadingProgress = (progress: LoadingProgress) => {
    if (status.value !== 'loading') {
      return
    }

    loadingProgress.value = progress
  }

  const setSceneReloading = (isReloading: boolean) => {
    isSceneReloading.value = isReloading
  }

  const setSceneExportProgress = (progress: ExportProgress | null) => {
    sceneExportProgress.value = progress
  }

  const sceneActivityDetail = computed(() => {
    if (isSceneReloading.value) {
      return 'Reloading scene'
    }

    const progress = sceneExportProgress.value

    if (!progress) {
      return null
    }

    return progress.completed !== undefined && progress.total !== undefined
      ? `${progress.stage} (${progress.completed}/${progress.total})`
      : progress.stage
  })

  const loadingDetail = computed(() => {
    const { stage, completed, total } = loadingProgress.value

    return completed !== undefined && total !== undefined ? `${stage} (${completed}/${total})` : stage
  })

  const dispose = () => {
    if (telemetryTimer !== undefined) {
      window.clearInterval(telemetryTimer)

      telemetryTimer = undefined
    }
  }

  const getAnimationTime = (key: string, name: string): number => runtime.value?.getAnimationTime(key, name) ?? 0

  const controlAnimation = (key: string, action: AnimationAction) => {
    runtime.value?.controlAnimation(key, action)

    animationGroups.value = runtime.value?.collectAnimationGroups() ?? []
  }

  const seekAnimation = (key: string, progress: number) => {
    runtime.value?.seekAnimation(key, progress)

    animationGroups.value = runtime.value?.collectAnimationGroups() ?? []
  }

  const setAnimationSpeed = (key: string, speed: number) => {
    runtime.value?.setAnimationSpeed(key, speed)

    animationGroups.value = runtime.value?.collectAnimationGroups() ?? []
  }

  const setAnimationPlayback = (key: string, name: string, mode: PlaybackMode) => {
    runtime.value?.setAnimationPlayback(key, name, mode)

    entities.value = runtime.value?.captureEditorState().entities ?? []
    animationGroups.value = runtime.value?.collectAnimationGroups() ?? []
  }

  const setAnimationMix = (
    key: string,
    weights: Record<string, number>,
    transitionDuration = 0,
    isRestartEnabled = false
  ) => {
    runtime.value?.setAnimationMix(key, weights, transitionDuration, isRestartEnabled)

    animationGroups.value = runtime.value?.collectAnimationGroups() ?? []
  }

  const setRendering = <Section extends keyof RenderingSettings, Key extends keyof RenderingSettings[Section]>(
    section: Section,
    key: Key,
    value: RenderingSettings[Section][Key]
  ) => {
    if (!runtime.value || !settings.value) {
      return
    }

    const acceptedValue = runtime.value.setRenderingSetting(section, key, value)

    ;(settings.value.rendering[section] as unknown as Record<string, unknown>)[String(key)] = acceptedValue
  }

  const antialiasingMode = computed<AntialiasingMode>(() => {
    return settings.value?.rendering.antialiasing.method ?? 'off'
  })

  const selectedAntialiasingMode = computed<Exclude<AntialiasingMode, 'off'>>(() =>
    antialiasingMode.value === 'off' ? lastAntialiasingMode.value : antialiasingMode.value
  )

  const setAntialiasingMode = (mode: AntialiasingMode) => {
    if (!runtime.value || !settings.value) {
      return
    }

    const acceptedMode = runtime.value.setAntialiasingMode(mode)

    if (acceptedMode !== 'off') {
      lastAntialiasingMode.value = acceptedMode
    }

    settings.value.rendering.antialiasing.method = acceptedMode
  }

  const setAntialiasingEnabled = (isEnabled: boolean) => {
    setAntialiasingMode(isEnabled ? lastAntialiasingMode.value : 'off')
  }

  const setDebugVisualization = (value: DebugVisualization | 'none') => {
    if (!runtime.value || !settings.value) {
      return
    }

    runtime.value.setDebugVisualization(value)

    const state = runtime.value.captureEditorState()

    settings.value.rendering.debug = state.settings.rendering.debug
  }

  const setDebugOverlayCategory = (category: DebugOverlayCategory, isEnabled: boolean) => {
    if (!runtime.value || !settings.value) {
      return
    }

    settings.value.rendering.debug.overlayCategories[category] = runtime.value.setDebugOverlayCategory(
      category,
      isEnabled
    )
  }

  const setTimeScale = (value: number) => {
    if (!runtime.value || !settings.value) {
      return
    }

    settings.value.simulation.timeScale = runtime.value.setTimeScale(value)
  }

  const setGravity = (value: number) => {
    if (!runtime.value || !settings.value) {
      return
    }

    settings.value.simulation.gravity = runtime.value.setGravity(value)
  }

  const toggleSimulation = () => {
    if (!runtime.value) {
      return
    }

    isSimulationRunning.value = runtime.value.setSimulationRunning(!isSimulationRunning.value)
  }

  const resetSimulation = () => {
    if (!runtime.value || !settings.value) {
      return
    }

    const simulation = runtime.value.resetSimulation()

    isSimulationRunning.value = simulation.isRunning
    settings.value.simulation.timeScale = simulation.timeScale
    settings.value.simulation.gravity = simulation.gravity
  }

  const setEnvironmentSetting = (key: keyof EnvironmentSettings, value: number) => {
    if (!runtime.value || !settings.value) {
      return
    }

    settings.value.environment[key] = runtime.value.setEnvironmentSetting(key, value)
  }

  const setLightEnabled = (key: string, isEnabled: boolean) => {
    if (!runtime.value || !settings.value) {
      return
    }

    const isAcceptedEnabled = runtime.value.setLightEnabled(key, isEnabled)
    const light = lights.value.find((candidate) => candidate.key === key)

    if (light) {
      light.isEnabled = isAcceptedEnabled
    }

    settings.value.lights[key] = { isEnabled: isAcceptedEnabled }
  }

  const setComponentVisible = (entityPath: string, componentName: string, isVisible: boolean) => {
    if (!runtime.value || !settings.value) {
      return
    }

    const findEntity = (nodes: EditorEntity[]): EditorEntity | undefined => {
      for (const node of nodes) {
        if (node.key === entityPath) {
          return node
        }

        const child = findEntity(node.children)

        if (child) {
          return child
        }
      }
    }
    const component = findEntity(entities.value)?.components.find((candidate) => candidate.name === componentName)

    if (!component || (component.type !== 'model' && component.type !== 'light')) {
      return
    }

    const isAcceptedVisible = runtime.value.setComponentVisible(entityPath, componentName, isVisible)

    if (isAcceptedVisible === undefined) {
      return
    }

    component.isVisible = isAcceptedVisible

    if (component.type === 'light' && component.lightKey !== undefined) {
      const light = lights.value.find((candidate) => candidate.key === component.lightKey)

      if (light) {
        light.isEnabled = isAcceptedVisible
      }

      settings.value.lights[component.lightKey] = { isEnabled: isAcceptedVisible }
    } else if (component.type === 'model') {
      settings.value.models[JSON.stringify([entityPath, componentName])] = { isVisible: isAcceptedVisible }
    }
  }

  const resetImportedEnvironment = async () => {
    if (!runtime.value || isEnvironmentResetting.value) {
      return
    }

    isEnvironmentResetting.value = true
    error.value = null

    try {
      const environment = await runtime.value.resetImportedEnvironment()

      if (settings.value) {
        settings.value.environment = environment
      }
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : String(reason)
    } finally {
      isEnvironmentResetting.value = false
    }
  }

  const resetImportedEntities = () => {
    if (!runtime.value || !settings.value) {
      return
    }

    error.value = null

    try {
      const state = runtime.value.resetImportedEntities()

      settings.value.camera = state.settings.camera
      settings.value.models = state.settings.models
      settings.value.lights = state.settings.lights
      lights.value = state.lights
      entities.value = state.entities
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : String(reason)
    }
  }

  const resetCamera = () => {
    if (!runtime.value || !settings.value) {
      return
    }

    error.value = null

    try {
      settings.value.camera = runtime.value.resetCamera()
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : String(reason)
    }
  }

  const currentDebugVisualization = computed<DebugVisualization | 'none'>(() => {
    if (!settings.value) {
      return 'none'
    }

    return DEBUG_VISUALIZATION_KEYS.find((key) => settings.value?.rendering.debug[key]) ?? 'none'
  })

  return {
    status: readonly(status),
    error: readonly(error),
    loadingDetail,
    settings: settings as Ref<SceneSettings | null>,
    lights,
    entities,
    animationGroups,
    getAnimationTime,
    setAnimationMix,
    setAnimationPlayback,
    controlAnimation,
    seekAnimation,
    setAnimationSpeed,
    scenes,
    activeSceneId: readonly(activeSceneId),
    telemetry,
    isEnvironmentResetting: readonly(isEnvironmentResetting),
    isSceneReloading: readonly(isSceneReloading),
    sceneExportProgress: readonly(sceneExportProgress),
    sceneActivityDetail,
    isSimulationRunning: readonly(isSimulationRunning),
    currentDebugVisualization,
    antialiasingMode,
    selectedAntialiasingMode,
    attach,
    configureScenes,
    refreshScenes,
    activateScene,
    fail,
    setLoadingProgress,
    setSceneReloading,
    setSceneExportProgress,
    dispose,
    setRendering,
    setAntialiasingMode,
    setAntialiasingEnabled,
    setDebugVisualization,
    setDebugOverlayCategory,
    setTimeScale,
    setGravity,
    toggleSimulation,
    resetSimulation,
    resetCamera,
    setEnvironmentSetting,
    setLightEnabled,
    setComponentVisible,
    resetImportedEnvironment,
    resetImportedEntities
  }
}

export const useEditorStore = (): EditorStore => {
  const store = inject(editorStoreKey)

  if (!store) {
    throw new Error('Editor store was not provided')
  }

  return store
}
