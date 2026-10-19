import type { Tuple3, Tuple4 } from '@luz/formats'
import type {
  DebugSettings as DrawingSettings,
  RenderingSettings as EngineSettings,
  EnvironmentSettings,
  VisualizationSettings
} from '@luz/graphics'
import {
  createRenderingSettings,
  normalizeRenderingSettings,
  normalizeEnvironmentSettings,
  DEFAULT_DEBUG_SETTINGS,
  updateDebugSetting,
  DEFAULT_ENVIRONMENT_SETTINGS,
  isOverlayDepthMode
} from '@luz/graphics'

export { isAmbientOcclusionQuality, isAntialiasingMode, isOverlayDepthMode } from '@luz/graphics'
export type {
  AmbientOcclusionQuality,
  AmbientOcclusionSettings,
  AntialiasingMode,
  AntialiasingSettings,
  BloomSettings,
  DepthOfFieldSettings,
  EnvironmentSettings,
  LightingSettings,
  MotionBlurSettings,
  OverlayDepthMode,
  PlanarReflectionSettings,
  ShadowSettings,
  VolumetricLightingSettings
} from '@luz/graphics'
export const DEBUG_OVERLAY_CATEGORY_KEYS = ['active', 'passive', 'sleeping', 'colliding', 'culled'] as const

export type DebugOverlayCategory = (typeof DEBUG_OVERLAY_CATEGORY_KEYS)[number]
export type DebugOverlayCategories = Record<DebugOverlayCategory, boolean>

export const DEFAULT_DEBUG_OVERLAY_CATEGORIES: Readonly<DebugOverlayCategories> = {
  active: true,
  passive: true,
  sleeping: true,
  colliding: true,
  culled: true
}

export interface DebugSettings extends DrawingSettings, VisualizationSettings {
  areOverlaysVisible: boolean
  overlayCategories: DebugOverlayCategories
}
export interface RenderingSettings extends EngineSettings {
  debug: DebugSettings
}
export interface SceneSettings {
  simulation: { timeScale: number; gravity: number | null }
  camera: {
    position: Tuple3 | null
    rotation: Tuple4 | null
  }
  lights: Record<string, { isEnabled: boolean }>
  models: Record<string, { isVisible: boolean }>
  environment: EnvironmentSettings
  rendering: RenderingSettings
}

const DEFAULT_SETTINGS: SceneSettings = {
  simulation: { timeScale: 1, gravity: null },
  camera: { position: null, rotation: null },
  lights: {},
  models: {},
  environment: { ...DEFAULT_ENVIRONMENT_SETTINGS },
  rendering: {
    ...createRenderingSettings(),
    debug: {
      ...createRenderingSettings().debug,
      ...DEFAULT_DEBUG_SETTINGS,
      areOverlaysVisible: true,
      overlayCategories: { ...DEFAULT_DEBUG_OVERLAY_CATEGORIES }
    }
  }
}

const cloneDefaultSettings = (): SceneSettings => JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as SceneSettings

const convertToRecord = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined

const copyPrimitiveValues = (target: Record<string, unknown>, source: unknown): void => {
  const input = convertToRecord(source)

  if (!input) {
    return
  }

  for (const [key, defaultValue] of Object.entries(target)) {
    const value = input[key]

    if (typeof defaultValue === 'boolean' && typeof value === 'boolean') {
      target[key] = value
    }

    if (typeof defaultValue === 'number' && typeof value === 'number' && Number.isFinite(value)) {
      target[key] = value
    }
  }
}

export const normalizeSceneSettings = (source: unknown): SceneSettings => {
  const settings = cloneDefaultSettings()
  const input = convertToRecord(source)

  if (!input) {
    throw new Error('Scene settings must be a JSON object')
  }

  copyPrimitiveValues(settings.simulation, input.simulation)

  const simulation = convertToRecord(input.simulation)

  if (typeof simulation?.gravity === 'number' && Number.isFinite(simulation.gravity)) {
    settings.simulation.gravity = simulation.gravity
  }

  const camera = convertToRecord(input.camera)

  if (
    Array.isArray(camera?.position) &&
    camera.position.length === 3 &&
    camera.position.every((value) => typeof value === 'number' && Number.isFinite(value))
  ) {
    settings.camera.position = camera.position as Tuple3
  }

  if (
    Array.isArray(camera?.rotation) &&
    camera.rotation.length === 4 &&
    camera.rotation.every((value) => typeof value === 'number' && Number.isFinite(value)) &&
    camera.rotation.some((value) => value !== 0)
  ) {
    settings.camera.rotation = camera.rotation as Tuple4
  }

  const lights = convertToRecord(input.lights)

  if (lights) {
    for (const [name, value] of Object.entries(lights)) {
      const light = convertToRecord(value)

      if (typeof light?.isEnabled === 'boolean') {
        settings.lights[name] = { isEnabled: light.isEnabled }
      }
    }
  }

  const models = convertToRecord(input.models)

  if (models) {
    for (const [key, value] of Object.entries(models)) {
      const model = convertToRecord(value)

      if (typeof model?.isVisible === 'boolean') {
        settings.models[key] = { isVisible: model.isVisible }
      }
    }
  }

  settings.environment = normalizeEnvironmentSettings(input.environment)

  const rendering = convertToRecord(input.rendering)
  const engineSettings = normalizeRenderingSettings(rendering)

  settings.rendering = {
    ...engineSettings,
    debug: { ...settings.rendering.debug, ...engineSettings.debug }
  }

  const debug = convertToRecord(rendering?.debug)

  copyPrimitiveValues(settings.rendering.debug as unknown as Record<string, unknown>, debug)

  if (isOverlayDepthMode(debug?.overlayDepthMode)) {
    settings.rendering.debug.overlayDepthMode = debug.overlayDepthMode
  }

  for (const key of Object.keys(DEFAULT_DEBUG_SETTINGS) as Array<keyof DrawingSettings>) {
    updateDebugSetting(settings.rendering.debug, key, settings.rendering.debug[key])
  }

  copyPrimitiveValues(settings.rendering.debug.overlayCategories, convertToRecord(debug?.overlayCategories))

  return settings
}

type SettingsStorage = Pick<Storage, 'getItem' | 'setItem'>

export const SCENE_SETTINGS_STORAGE_KEY = 'luz.scene.settings'

const resolveBrowserStorage = (): SettingsStorage | undefined => {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

export const createSceneSettingsId = (sceneUrl: string, baseUrl?: string): string => {
  const fallbackBase = typeof document === 'undefined' ? 'http://localhost/' : document.baseURI
  const url = new URL(sceneUrl, baseUrl ?? fallbackBase)
  const defaultPath = '/assets/scenes/'
  const defaultPathIndex = url.pathname.lastIndexOf(defaultPath)
  const path =
    defaultPathIndex >= 0 ? url.pathname.slice(defaultPathIndex + defaultPath.length) : url.pathname.replace(/^\/+/, '')

  let decodedPath = path

  try {
    decodedPath = decodeURIComponent(path)
  } catch {
    // Keep the undecoded URL when it contains malformed escape sequences.
  }

  return `${decodedPath}${url.search}`
}

export class SettingsStore {
  readonly key = SCENE_SETTINGS_STORAGE_KEY
  readonly sceneId: string

  private pendingSettings?: SceneSettings
  private saveTimer?: ReturnType<typeof setTimeout>

  constructor(
    sceneUrl: string,
    private readonly storage: SettingsStorage | undefined = resolveBrowserStorage(),
    private readonly saveDelay = 150
  ) {
    this.sceneId = createSceneSettingsId(sceneUrl)
  }

  async load(): Promise<SceneSettings> {
    if (!this.storage) {
      return cloneDefaultSettings()
    }

    try {
      const serialized = this.storage.getItem(this.key)

      if (serialized === null) {
        return cloneDefaultSettings()
      }

      const storedScenes = convertToRecord(JSON.parse(serialized))

      if (!storedScenes) {
        throw new Error('Stored scene settings must be a JSON object')
      }

      const storedSettings = storedScenes[this.sceneId]

      if (storedSettings === undefined) {
        return cloneDefaultSettings()
      }

      const settings = normalizeSceneSettings(storedSettings)

      storedScenes[this.sceneId] = settings

      try {
        this.storage.setItem(this.key, JSON.stringify(storedScenes))
      } catch {
        // Settings remain available in memory when browser storage is unavailable.
      }

      return settings
    } catch (error) {
      console.warn(`Ignoring invalid scene settings for '${this.sceneId}' stored at '${this.key}'`, error)

      return cloneDefaultSettings()
    }
  }

  save(settings: SceneSettings): void {
    this.pendingSettings = normalizeSceneSettings(settings)

    if (this.saveTimer !== undefined) {
      clearTimeout(this.saveTimer)
    }

    if (this.saveDelay <= 0) {
      return this.flush()
    }

    this.saveTimer = setTimeout(() => this.flush(), this.saveDelay)
  }

  flush(): void {
    if (this.saveTimer !== undefined) {
      clearTimeout(this.saveTimer)

      this.saveTimer = undefined
    }

    if (!this.storage || !this.pendingSettings) {
      return
    }

    try {
      let storedScenes: Record<string, unknown> = {}

      const serialized = this.storage.getItem(this.key)

      if (serialized !== null) {
        try {
          storedScenes = convertToRecord(JSON.parse(serialized)) ?? {}
        } catch {
          // Replace malformed stored data with a fresh scene-settings map.
        }
      }

      storedScenes[this.sceneId] = this.pendingSettings

      this.storage.setItem(this.key, JSON.stringify(storedScenes))

      this.pendingSettings = undefined
    } catch (error) {
      console.warn(`Unable to store scene settings for '${this.sceneId}' at '${this.key}'`, error)
    }
  }
}
