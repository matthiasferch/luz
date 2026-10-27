import { AnimationLoop, decodeImage } from '@luz/browser'
import type { Entity, Light, Camera } from '@luz/core'
import { isLight, isTransformAnimation } from '@luz/core'
import type { PlaybackMode, Tuple3, Tuple4 } from '@luz/formats'
import type { RenderingSettings as EngineSettings, FrameResult, Model, RenderBackend } from '@luz/graphics'
import {
  DebugRenderer,
  EnvironmentLoader,
  ImageLoader,
  ModelManager,
  DEFAULT_DEBUG_SETTINGS,
  updateDebugSetting,
  type DebugSettings,
  SceneRenderer,
  WebGL2RenderBackend,
  isModel
} from '@luz/graphics'
import { Vector3 } from '@luz/math'
import type { Biped, Body } from '@luz/physics'
import { isBody } from '@luz/physics'
import type { Scene } from '@luz/scene'
import { captureCanvasThumbnail } from '../editor/canvas-thumbnail'
import {
  DEBUG_VISUALIZATION_KEYS,
  type AnimationAction,
  type AntialiasingMode,
  type DebugVisualization,
  type EditorApi,
  type EditorState,
  type EditorTelemetry,
  type LoadingProgressReporter,
  type SimulationState
} from '../editor/editor-api'
import { describeEntityTree } from '../editor/entity-tree'
import { DebugOverlay } from '../rendering/debug-overlay'
import { resolveTextureUrl } from '../resources/asset-path'
import { SceneLoader, loadJsonInWorker } from '../resources/scene-loader'
import type { DebugOverlayCategory, RenderingSettings, SceneSettings } from '../settings'
import { SettingsStore, normalizeSceneSettings, type EnvironmentSettings } from '../settings'
import { AnimationController } from './animation-controller'
import { CameraController } from './camera-controller'
import { InputManager } from './input-manager'
import { SceneSession } from './scene-session'
import { SimulationController } from './simulation-controller'
import { RuntimeTelemetry } from './telemetry'

export type { RenderingSettings } from '../settings'

const MAXIMUM_DELTA_TIME = 1 / 15

export class Editor implements EditorApi {
  private sceneRenderer!: SceneRenderer

  private readonly debugRenderer: DebugRenderer

  private frameResult?: FrameResult
  private animationController!: AnimationController

  private readonly simulation: SimulationController
  private readonly settingsStore: SettingsStore
  private readonly settings: SceneSettings
  private readonly renderingSettings: RenderingSettings

  private elapsedTime = 0
  private isDestroyed = false
  private environmentGeneration = 0

  private readonly requests = new AbortController()
  private readonly animationLoop = new AnimationLoop((_time, elapsedTime) => this.update(elapsedTime))
  private readonly onPageHide = () => this.destroy()
  private readonly thumbnailRequests: Array<{
    width: number
    height: number
    resolve: (image: Blob) => void
    reject: (reason: unknown) => void
  }> = []
  private readonly canvas: HTMLCanvasElement
  private readonly backend: RenderBackend
  private readonly modelManager: ModelManager
  private readonly sceneLoader: SceneLoader
  private readonly imageLoader: ImageLoader
  private readonly environmentLoader: EnvironmentLoader

  private loadedEnvironmentKey?: string

  private readonly sceneSession: SceneSession<EditorState>
  private readonly importedModelVisibility = new WeakMap<Model, boolean>()
  private readonly importedLightVisibility = new WeakMap<Light, boolean>()
  private readonly inputManager: InputManager
  private readonly cameraController: CameraController
  private readonly debugOverlay: DebugOverlay
  private readonly telemetry = new RuntimeTelemetry()

  private onResize?: () => void
  private resizeObserver?: ResizeObserver
  private scene!: Scene
  private cameraEntity!: Entity
  private camera!: Camera
  private blenderCameraPose?: {
    position: Tuple3
    rotation: Tuple4
  }
  private sphereBody?: Body
  private cuboidBody?: Body
  private biped?: Biped
  private constructor(
    canvas: HTMLCanvasElement,
    context: WebGL2RenderingContext,
    settingsStore: SettingsStore,
    settings: SceneSettings,
    sceneUrl: string,
    private readonly reportLoading: LoadingProgressReporter
  ) {
    this.canvas = canvas
    this.settingsStore = settingsStore
    this.settings = settings
    this.sceneSession = new SceneSession(sceneUrl)
    this.renderingSettings = settings.rendering
    this.simulation = new SimulationController(settings.simulation)
    this.backend = new WebGL2RenderBackend(context)
    this.inputManager = new InputManager(this.canvas)
    this.imageLoader = new ImageLoader({ baseUrl: document.baseURI, decodeImage })
    this.environmentLoader = new EnvironmentLoader(this.imageLoader)
    this.modelManager = new ModelManager(this.backend, {
      resolveSurface: (path) => this.imageLoader.loadImage(resolveTextureUrl(path)),

      readJson: (url, signal) => loadJsonInWorker(url, 'no-cache', signal)
    })
    this.sceneLoader = new SceneLoader(this.modelManager, this.reportLoading)
    this.debugOverlay = new DebugOverlay(document.getElementById('overlays'))
    this.debugRenderer = new DebugRenderer(this.backend)
    this.cameraController = new CameraController(this.inputManager)

    window.addEventListener('pagehide', this.onPageHide)
    this.installResizeHandler()
  }

  destroy(): void {
    if (this.isDestroyed) {
      return
    }

    this.isDestroyed = true
    this.environmentGeneration += 1

    this.animationLoop.stop()
    window.removeEventListener('pagehide', this.onPageHide)

    if (this.onResize) {
      window.removeEventListener('resize', this.onResize)
    }

    this.resizeObserver?.disconnect()
    this.requests.abort()
    this.sceneLoader.destroy()
    this.imageLoader.clear()
    this.inputManager.destroy()

    for (const request of this.thumbnailRequests.splice(0)) {
      request.reject(new Error('Editor has been destroyed'))
    }

    this.debugOverlay.destroy()
    this.debugRenderer.destroy()
    this.sceneRenderer?.destroy()
    this.modelManager.destroy()
    this.backend.destroy()
    this.settingsStore.flush()
  }

  private onWindowResize() {
    if (this.isDestroyed) {
      return
    }

    if (this.resizeCanvasToDisplaySize()) {
      if (this.camera) {
        this.camera.aspect = this.canvas.width / this.canvas.height
      }
    }
  }

  static async create(
    canvasSelector: string,
    sceneUrl: string,
    reportLoading: LoadingProgressReporter = () => undefined
  ): Promise<Editor> {
    reportLoading({ stage: 'Preparing settings' })

    const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement | null

    if (!canvas) {
      throw new Error(`Canvas element "${canvasSelector}" not found`)
    }

    const context = canvas.getContext('webgl2')

    if (!context) {
      throw new Error('WebGL2 is not supported in this environment')
    }

    const settingsStore = new SettingsStore(sceneUrl)
    const settings = await settingsStore.load()

    const editor = new Editor(canvas, context, settingsStore, settings, sceneUrl, reportLoading)

    try {
      await editor.initialize()

      return editor
    } catch (error) {
      editor.destroy()

      throw error
    }
  }

  private requireActive(): void {
    if (this.isDestroyed) {
      throw new Error('Editor has been destroyed')
    }
  }

  private installResizeHandler() {
    this.onResize = () => this.onWindowResize()

    window.addEventListener('resize', this.onResize)

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.onWindowResize())

      this.resizeObserver.observe(this.canvas)
    }
  }

  private resizeCanvasToDisplaySize(): boolean {
    const rectangle = this.canvas.getBoundingClientRect()
    const devicePixelRatio = window.devicePixelRatio || 1
    const displayWidth = Math.max(1, Math.round(rectangle.width * devicePixelRatio))
    const displayHeight = Math.max(1, Math.round(rectangle.height * devicePixelRatio))

    if (this.canvas.width === displayWidth && this.canvas.height === displayHeight) {
      return false
    }

    this.canvas.width = displayWidth
    this.canvas.height = displayHeight

    return true
  }

  captureEditorState(): EditorState {
    const settings = JSON.parse(JSON.stringify(this.settings)) as SceneSettings

    settings.simulation.gravity ??= this.scene?.gravity.y ?? -9.81

    const lights = this.collectSceneLights()

    return {
      settings,
      isSimulationRunning: this.simulation.isRunning,
      lights: lights.map(({ key, label }) => ({ key, label, isEnabled: this.isLightEnabled(key) })),
      entities: this.scene
        ? describeEntityTree(this.scene, this.camera, new Map(lights.map(({ light, key }) => [light, key])))
        : []
    }
  }

  collectAnimationGroups() {
    return this.animationController.collectGroups()
  }

  getAnimationTime(key: string, name: string): number {
    return this.animationController.getTime(key, name)
  }

  controlAnimation(key: string, action: AnimationAction): void {
    this.animationController.control(key, action)
    this.sceneRenderer?.invalidateHistory()
  }

  seekAnimation(key: string, progress: number): void {
    this.animationController.seek(key, progress)
    this.sceneRenderer?.invalidateHistory()
  }

  setAnimationSpeed(key: string, speed: number): void {
    this.animationController.setSpeed(key, speed)
  }

  setAnimationPlayback(key: string, name: string, mode: PlaybackMode): void {
    this.animationController.setPlayback(key, name, mode)
    this.sceneRenderer?.invalidateHistory()
  }

  setAnimationMix(
    key: string,
    weights: Record<string, number>,
    transitionDuration: number,
    isRestartEnabled = false
  ): void {
    this.animationController.setMix(key, weights, transitionDuration, isRestartEnabled)

    if (transitionDuration === 0) {
      this.sceneRenderer?.invalidateHistory()
    }
  }

  setDebugVisualization(value: DebugVisualization | 'none'): void {
    DEBUG_VISUALIZATION_KEYS.forEach((key) => {
      this.renderingSettings.debug[key] = this.sceneRenderer.setRenderingSetting('debug', key, key === value)
    })
    this.sceneRenderer?.invalidateHistory()
    this.persistSettings()
  }

  setDebugOverlayCategory(category: DebugOverlayCategory, isEnabled: boolean): boolean {
    this.renderingSettings.debug.overlayCategories[category] = isEnabled

    this.persistSettings()

    return isEnabled
  }

  setLightEnabled(key: string, isEnabled: boolean): boolean {
    const binding = this.collectSceneLights().find((light) => light.key === key)

    if (!binding) {
      return this.isLightEnabled(key)
    }

    binding.light.isVisible = isEnabled
    this.settings.lights[key] = { isEnabled: isEnabled }

    this.sceneRenderer?.invalidateHistory()
    this.persistSettings()

    return isEnabled
  }

  setComponentVisible(entityPath: string, componentName: string, isVisible: boolean): boolean | undefined {
    const entity = Array.from(this.scene.iterateEntries()).find(([path]) => path === entityPath)?.[1]
    const component = entity?.components[componentName]

    if (!component) {
      return undefined
    }

    if (isLight(component)) {
      const binding = this.collectSceneLights().find(({ light }) => light === component)

      return binding ? this.setLightEnabled(binding.key, isVisible) : undefined
    }

    if (!isModel(component)) {
      return undefined
    }

    component.isVisible = isVisible
    this.settings.models[JSON.stringify([entityPath, componentName])] = { isVisible: isVisible }

    this.sceneRenderer?.invalidateHistory()
    this.persistSettings()

    return isVisible
  }

  resetImportedEntities(): EditorState {
    this.settings.models = {}
    this.settings.lights = {}

    for (const entity of this.scene.collectEntities()) {
      for (const component of Object.values(entity.components)) {
        if (isModel(component)) {
          component.isVisible = this.importedModelVisibility.get(component) ?? true
        }

        if (isLight(component)) {
          component.isVisible = this.importedLightVisibility.get(component) ?? true
        }
      }
    }

    this.restoreImportedCamera()
    this.sceneRenderer?.invalidateHistory()
    this.persistSettings()

    return this.captureEditorState()
  }

  resetCamera(): SceneSettings['camera'] {
    for (let entity: Entity | undefined = this.cameraEntity; entity; entity = entity.parent) {
      if (entity.animationMixer?.hasActiveAnimations) {
        throw new Error('Stop the camera animation before resetting the camera.')
      }
    }

    this.restoreImportedCamera()
    this.sceneRenderer?.invalidateHistory()
    this.persistSettings()

    return {
      position: this.settings.camera.position ? [...this.settings.camera.position] : null,
      rotation: this.settings.camera.rotation ? [...this.settings.camera.rotation] : null
    }
  }

  private restoreImportedCamera(): void {
    if (this.blenderCameraPose) {
      const { position, rotation } = this.blenderCameraPose

      this.cameraEntity.translation.set(position)
      this.cameraEntity.rotation.set(rotation)
      this.cameraEntity.rotation.normalize()

      this.settings.camera.position = [...position]
      this.settings.camera.rotation = [...rotation]

      this.scene.updateTransforms()
      this.camera.update(this.cameraEntity, 0)
      this.cameraController.setTransform(this.cameraEntity)
    }
  }

  private persistSettings(): void {
    this.settingsStore.save(this.settings)
  }

  private collectSceneLights(): Array<{ key: string; label: string; light: Light }> {
    if (!this.scene) {
      return []
    }

    return Array.from(this.scene.iterateEntries()).flatMap(([entityName, entity]) => {
      const lights = Object.entries(entity.components).filter((entry): entry is [string, Light] => isLight(entry[1]))

      return lights.map(([componentName, light]) => ({
        key: lights.length === 1 ? entityName : `${entityName}/${componentName}`,
        label: lights.length === 1 ? entityName : `${entityName} (${componentName})`,
        light
      }))
    })
  }

  private isLightEnabled(key: string): boolean {
    return this.collectSceneLights().find((binding) => binding.key === key)?.light.isVisible ?? true
  }

  private restoreCameraPose() {
    const position = this.settings.camera.position

    if (position) {
      this.cameraEntity.translation.x = position[0]
      this.cameraEntity.translation.y = position[1]
      this.cameraEntity.translation.z = position[2]
    }

    const rotation = this.settings.camera.rotation

    if (rotation) {
      this.cameraEntity.rotation.x = rotation[0]
      this.cameraEntity.rotation.y = rotation[1]
      this.cameraEntity.rotation.z = rotation[2]
      this.cameraEntity.rotation.w = rotation[3]

      this.cameraEntity.rotation.normalize()
    }

    this.captureCameraPose()
  }

  private captureCameraPose() {
    const { x, y, z } = this.cameraEntity.translation
    const rotation = this.cameraEntity.rotation
    const savedPosition = this.settings.camera.position
    const savedRotation = this.settings.camera.rotation
    const isPositionUnchanged =
      savedPosition && savedPosition[0] === x && savedPosition[1] === y && savedPosition[2] === z
    const isRotationUnchanged =
      savedRotation &&
      savedRotation[0] === rotation.x &&
      savedRotation[1] === rotation.y &&
      savedRotation[2] === rotation.z &&
      savedRotation[3] === rotation.w

    if (isPositionUnchanged && isRotationUnchanged) {
      return
    }

    this.settings.camera.position = [x, y, z]
    this.settings.camera.rotation = [rotation.x, rotation.y, rotation.z, rotation.w]

    this.persistSettings()
  }

  setTimeScale(value: number): number {
    const acceptedTimeScale = this.simulation.setTimeScale(value)

    this.persistSettings()

    return acceptedTimeScale
  }

  setGravity(value: number): number {
    if (!Number.isFinite(value)) {
      return this.scene.gravity.y
    }

    const acceptedGravity = Math.max(-30, Math.min(30, value))

    this.scene.gravity.y = acceptedGravity
    this.settings.simulation.gravity = acceptedGravity

    this.persistSettings()

    return acceptedGravity
  }

  setSimulationRunning(isRunning: boolean): boolean {
    this.simulation.setRunning(isRunning)

    if (!isRunning) {
      this.cameraController.setTransform(this.cameraEntity)
    }

    return this.simulation.isRunning
  }

  resetSimulation(): SimulationState {
    this.simulation.reset(this.scene)
    this.cameraController.setTransform(this.cameraEntity)
    this.sceneRenderer?.invalidateHistory()
    this.persistSettings()

    return {
      isRunning: this.simulation.isRunning,
      timeScale: this.simulation.timeScale,
      gravity: this.scene.gravity.y
    }
  }

  async reloadScene(): Promise<EditorState> {
    this.requireActive()
    this.debugOverlay.destroy()

    return this.sceneSession.reload(() => this.performSceneReload())
  }

  private hasAnimatedCamera(): boolean {
    for (let entity: Entity | undefined = this.cameraEntity; entity; entity = entity.parent) {
      if (Object.values(entity.components).some(isTransformAnimation)) {
        return true
      }
    }

    return false
  }

  private start() {
    if (!this.isDestroyed) {
      this.animationLoop.start()
    }
  }

  captureThumbnail(width = 320, height = 240): Promise<Blob> {
    if (this.isDestroyed) {
      return Promise.reject(new Error('Editor has been destroyed'))
    }

    return new Promise((resolve, reject) => {
      this.thumbnailRequests.push({ width, height, resolve, reject })
    })
  }

  private captureRequestedThumbnails(): void {
    for (const request of this.thumbnailRequests.splice(0)) {
      void captureCanvasThumbnail(this.canvas, request.width, request.height).then(request.resolve, request.reject)
    }
  }

  private installScene(scene: Scene): void {
    const { entity: cameraEntity, camera } = scene.selectCamera()

    this.simulation.applyImportedState(scene)

    camera.aspect = this.canvas.width / this.canvas.height
    this.scene = scene
    this.animationController = new AnimationController(scene)

    for (const [path, entity] of scene.iterateEntries()) {
      for (const [name, component] of Object.entries(entity.components)) {
        if (!isModel(component)) {
          continue
        }

        this.importedModelVisibility.set(component, component.isVisible)

        component.isVisible = this.settings.models[JSON.stringify([path, name])]?.isVisible ?? component.isVisible
      }
    }

    for (const { key, light } of this.collectSceneLights()) {
      this.importedLightVisibility.set(light, light.isVisible)

      light.isVisible = this.settings.lights[key]?.isEnabled ?? light.isVisible
    }

    this.cameraEntity = cameraEntity
    this.camera = camera
    this.sphereBody = Object.values(scene.entities['Sphere']?.components ?? {}).find(isBody)
    this.cuboidBody = Object.values(scene.entities['Cuboid']?.components ?? {}).find(isBody)
    this.biped = undefined
    this.blenderCameraPose = {
      position: [cameraEntity.translation.x, cameraEntity.translation.y, cameraEntity.translation.z],
      rotation: [cameraEntity.rotation.x, cameraEntity.rotation.y, cameraEntity.rotation.z, cameraEntity.rotation.w]
    }

    if (!this.hasAnimatedCamera()) {
      this.restoreCameraPose()
    }

    this.cameraController.setTransform(cameraEntity)
    this.sceneRenderer.invalidateHistory()
  }

  private async performSceneReload(): Promise<EditorState> {
    this.environmentGeneration += 1
    this.loadedEnvironmentKey = undefined

    this.imageLoader.beginReload()
    this.modelManager.beginReload()

    const scene = await this.sceneLoader.load(this.sceneSession.url)
    const previousScene = this.scene

    try {
      this.requireActive()
      this.installScene(scene)
    } catch (error) {
      this.modelManager.releaseScene(scene)

      throw error
    }

    this.modelManager.releaseScene(previousScene)
    this.simulation.setRunning(false)

    this.elapsedTime = 0

    this.sceneRenderer.invalidateHistory()

    await this.applySceneEnvironment(scene)
    this.requireActive()

    return this.captureEditorState()
  }

  private update = (frameDeltaTime: number) => {
    if (this.isDestroyed || frameDeltaTime === 0) {
      return
    }

    const deltaTime = Math.min(frameDeltaTime, MAXIMUM_DELTA_TIME)

    this.elapsedTime += deltaTime

    const scaledDeltaTime = Math.min(deltaTime * this.simulation.timeScale, MAXIMUM_DELTA_TIME)

    // Report wall-clock FPS; the simulation cap must not impose a 15 FPS floor.
    this.telemetry.updateFrame(frameDeltaTime)

    const force = 10.0
    const cameraSpeed = 2.0

    const { keys } = this.inputManager

    if (keys.j || keys.l) {
      this.cameraEntity.refreshWorldTransform()

      const position = this.cameraEntity.worldTranslation.clone()

      position.x += ((keys.l ? 1 : 0) - (keys.j ? 1 : 0)) * cameraSpeed * deltaTime

      this.cameraEntity.setWorldTranslation(position)
    }

    if (this.simulation.isRunning && this.biped) {
      this.biped.linearVelocity.x = 0
      this.biped.linearVelocity.z = 0
    }

    if (this.simulation.isRunning) {
      Object.entries(keys).forEach(([key, isPressed]) => {
        if (!isPressed) {
          return
        }

        switch (key) {
          case 'a':
            this.sphereBody?.force.add(new Vector3([-force, 0, 0]))
            break

          case 'd':
            this.sphereBody?.force.add(new Vector3([force, 0, 0]))
            break

          case 'w':
            this.sphereBody?.force.add(new Vector3([0, 0, -force]))
            break

          case 's':
            this.sphereBody?.force.add(new Vector3([0, 0, force]))
            break

          case 'f':
            this.cuboidBody?.force.add(new Vector3([-force, 0, 0]))
            break

          case 'h':
            this.cuboidBody?.force.add(new Vector3([force, 0, 0]))
            break

          case 't':
            this.cuboidBody?.force.add(new Vector3([0, 0, -force]))
            break

          case 'g':
            this.cuboidBody?.force.add(new Vector3([0, 0, force]))
            break

          case 'ArrowLeft':
            this.biped?.force.add(new Vector3([-100, 0, 0]))
            break

          case 'ArrowRight':
            this.biped?.force.add(new Vector3([100, 0, 0]))
            break

          case 'ArrowUp':
            this.biped?.force.add(new Vector3([0, 0, -100]))
            break

          case 'ArrowDown':
            this.biped?.force.add(new Vector3([0, 0, 100]))
            break

          case ' ':
            if (this.biped?.isGrounded) {
              this.biped?.force.add(new Vector3([0, 0.4 * force, 0]))
            }
        }
      })
    }

    let isCameraAnimationActive = false

    for (let entity: Entity | undefined = this.cameraEntity; entity; entity = entity.parent) {
      isCameraAnimationActive ||= entity.animationMixer?.hasActiveAnimations ?? false
    }

    this.cameraController.update(isCameraAnimationActive)

    if (!isCameraAnimationActive) {
      this.captureCameraPose()
    }

    this.scene.update(scaledDeltaTime, this.simulation.isRunning)

    const target = { width: this.canvas.width, height: this.canvas.height }
    const frame = this.sceneRenderer.render(this.scene, { camera: this.camera, target, time: this.elapsedTime })

    this.frameResult = frame

    this.telemetry.updateCulling(
      frame.cullingStatistics.visibleBodyCount,
      frame.cullingStatistics.culledBodyCount,
      frame.cullingStatistics.visibleLightCount,
      frame.cullingStatistics.culledLightCount
    )
    this.captureRequestedThumbnails()
    this.debugRenderer.render(
      this.scene,
      this.camera,
      this.renderingSettings.debug,
      frame,
      this.canvas.width / Math.max(1, this.canvas.clientWidth)
    )
    this.debugOverlay.render(this.scene, this.camera, this.renderingSettings.debug)
  }

  private async initialize(): Promise<void> {
    this.reportLoading({ stage: 'Preparing renderer' })
    this.resizeCanvasToDisplaySize()

    this.sceneRenderer = await SceneRenderer.create({
      signal: this.requests.signal,
      backend: this.backend,
      models: this.modelManager.compiler,
      decodeImage,
      settings: this.renderingSettings,
      environmentSettings: this.settings.environment
    })

    if (this.isDestroyed) {
      this.sceneRenderer.destroy()
      this.requireActive()
    }

    this.reportLoading({ stage: 'Loading scene' })

    const scene = await this.sceneLoader.load(this.sceneSession.url)

    this.requireActive()
    this.installScene(scene)
    this.onWindowResize()
    this.reportLoading({ stage: 'Loading environment' })

    await this.applySceneEnvironment(scene)
    this.requireActive()
    this.reportLoading({ stage: 'Starting scene' })
    this.start()
  }

  private async applySceneEnvironment(scene: Scene): Promise<void> {
    this.requireActive()

    const generation = ++this.environmentGeneration
    const environment = scene.environment

    if (!environment) {
      this.loadedEnvironmentKey = undefined

      this.sceneRenderer.setEnvironment(null)

      return
    }

    const key = JSON.stringify(environment)

    if (this.loadedEnvironmentKey === key) {
      return
    }

    try {
      const sources = await this.environmentLoader.load(environment)

      this.requireActive()

      if (generation !== this.environmentGeneration) {
        return
      }

      this.sceneRenderer.setEnvironment(sources)

      this.loadedEnvironmentKey = key
    } catch (error) {
      if (!this.isDestroyed && generation === this.environmentGeneration) {
        console.warn('Failed to load environment textures:', error)
      }
    }
  }

  async resetImportedEnvironment(): Promise<SceneSettings['environment']> {
    Object.assign(this.settings.environment, normalizeSceneSettings({}).environment)

    for (const key of Object.keys(this.settings.environment) as Array<keyof EnvironmentSettings>) {
      this.sceneRenderer.setEnvironmentSetting(key, this.settings.environment[key])
    }

    await this.applySceneEnvironment(this.scene)
    this.persistSettings()

    return { ...this.settings.environment }
  }

  setEnvironmentSetting(key: keyof EnvironmentSettings, value: number): number {
    const acceptedValue = this.sceneRenderer.setEnvironmentSetting(key, value)

    this.settings.environment[key] = acceptedValue

    this.persistSettings()

    return acceptedValue
  }

  setRenderingSetting<Section extends keyof RenderingSettings, Key extends keyof RenderingSettings[Section]>(
    section: Section,
    key: Key,
    value: RenderingSettings[Section][Key]
  ): RenderingSettings[Section][Key] {
    const sectionSettings = this.renderingSettings[section]

    let acceptedValue = sectionSettings[key]

    if (section === 'debug' && !(DEBUG_VISUALIZATION_KEYS as readonly string[]).includes(String(key))) {
      if (String(key) in DEFAULT_DEBUG_SETTINGS) {
        acceptedValue = updateDebugSetting(
          this.renderingSettings.debug,
          key as keyof DebugSettings,
          value
        ) as RenderingSettings[Section][Key]
      } else if (typeof acceptedValue === 'boolean' && typeof value === 'boolean') {
        acceptedValue = value
      }
    } else {
      acceptedValue = this.sceneRenderer.setRenderingSetting(
        section,
        key as unknown as keyof EngineSettings[Section],
        value as unknown as EngineSettings[Section][keyof EngineSettings[Section]]
      ) as unknown as RenderingSettings[Section][Key]
    }

    sectionSettings[key] = acceptedValue

    this.persistSettings()

    return acceptedValue
  }

  setAntialiasingMode(mode: AntialiasingMode): AntialiasingMode {
    const acceptedMode = this.sceneRenderer.setAntialiasingMode(mode)

    this.renderingSettings.antialiasing.method = acceptedMode

    this.persistSettings()

    return acceptedMode
  }

  collectEditorTelemetry(): EditorTelemetry {
    const environment = this.sceneRenderer.environmentDiagnostics

    return this.telemetry.capture({
      scene: this.scene,
      backend: this.backend,
      renderedReflectorCount: this.frameResult?.renderedReflectorCount ?? 0,
      reflectorCount: this.frameResult?.reflectorCount ?? 0,
      diffuseEnvironment: environment.diffuseEnvironment,
      specularEnvironment: environment.specularEnvironment,
      usesCubeEnvironment: environment.isCubeEnvironmentEnabled
    })
  }
}
