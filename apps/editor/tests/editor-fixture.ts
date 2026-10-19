import type { SceneSettings } from '../src/settings'
import type { EditorApi, EditorTelemetry } from '../src/editor/editor-api'

export const makeSettings = (): SceneSettings => ({
  simulation: { timeScale: 1, gravity: -9.81 },
  camera: { position: null, rotation: null },
  lights: {},
  models: {},
  environment: {
    rotationDegrees: 0,
    ambientBrightness: 0.02,
    diffuseStrength: 0.5,
    specularStrength: 0.5
  },
  rendering: {
    lighting: { scissorMargin: 2, isSubsurfaceLightingEnabled: true },
    shadows: { isEnabled: true, softness: 0.5, grain: 0.7 },
    planarReflections: { isEnabled: true },
    antialiasing: { method: 'taa' },
    ambientOcclusion: {
      isEnabled: true,
      quality: 'medium',
      radius: 1.5,
      intensity: 1,
      falloff: 1.5,
      thickness: 0.02,
      temporalStability: 0.9
    },
    volumetricLighting: {
      isEnabled: false,
      quality: 'medium',
      intensityMultiplier: 1,
      density: 0.02,
      anisotropy: 0.35,
      noiseScale: 1.5,
      noiseSpeed: 0.002,
      noiseStrength: 0.6
    },
    bloom: { isEnabled: false, threshold: 1, knee: 0.5, intensity: 0.35, scatter: 0.7 },
    motionBlur: {
      isEnabled: false,
      isCameraBlurEnabled: true,
      shutterAngle: 180,
      maximumRadius: 32,
      maximumSamples: 24
    },
    depthOfField: {
      isEnabled: false,
      isCameraOverridden: false,
      focusDistance: 10,
      focalLength: 50,
      sensorHeight: 32,
      fStop: 2.8,
      maximumBlurRadius: 20,
      maximumSamples: 64
    },
    debug: {
      areGeometryOverlaysVisible: true,
      areOverlaysVisible: true,
      overlayCategories: { active: true, passive: true, sleeping: true, colliding: true, culled: true },
      areCameraFrustumsVisible: false,
      areLightFrustumsVisible: false,
      areModelBoundingBoxesVisible: false,
      overlayDepthMode: 'occluded',
      overlayLineWidth: 2,
      overlayOpacity: 0.9,
      areBodyBoundingBoxesVisible: false,
      areLightScissorsVisible: false,
      areArmaturesVisible: false,
      areCollidersVisible: false,
      areCollisionsVisible: false,
      isDepthVisualized: false,
      isDepthOfFieldVisualized: false,
      areWorldNormalsVisualized: false,
      areCameraNormalsVisualized: false,
      isRoughnessVisualized: false,
      isMetallicVisualized: false,
      isAmbientOcclusionVisualized: false,
      isScreenOcclusionVisualized: false,
      isNormalLightDotVisualized: false,
      areShadowsVisualized: false,
      isTransmissionVisualized: false,
      isVolumetricLightVisualized: false,
      areMotionVectorsVisualized: false
    }
  }
})

export const makeTelemetry = (framesPerSecond = 60): EditorTelemetry => ({
  framesPerSecond,
  collisions: {
    bodyCount: 2,
    colliderCount: 3,
    candidateBodyPairCount: 1,
    candidateBodyColliderPairCount: 2,
    manifoldCount: 1
  },
  culling: { visibleBodyCount: 8, culledBodyCount: 4, visibleLightCount: 2, culledLightCount: 1 },
  renderer: {
    planarReflections: { renderedCount: 1, totalCount: 2 },
    primitives: { renderedCount: 8, submittedCount: 14 },
    cullChanges: 2,
    blendChanges: 3,
    depthChanges: 4,
    colorMaskChanges: 1,
    depthMaskChanges: 1
  },
  environment: { diffuse: '64×64', specular: '256×256', mode: 'Cubemap' }
})

export const makeRuntime = (overrides: Partial<EditorApi> = {}): EditorApi => {
  const settings = makeSettings()
  const runtime: EditorApi = {
    destroy: () => {},

    captureEditorState: () => ({
      settings,
      isSimulationRunning: false,
      entities: [],
      lights: [
        { key: 'sun', label: 'Sun', isEnabled: true },
        { key: 'lamp', label: 'Desk lamp', isEnabled: false }
      ]
    }),

    collectEditorTelemetry: () => makeTelemetry(),

    setRenderingSetting: (_section, _key, value) => value,

    setEnvironmentSetting: (_key, value) => value,

    setAntialiasingMode: (mode) => mode,

    setDebugVisualization: () => undefined,

    setDebugOverlayCategory: (_category, isEnabled) => isEnabled,

    setTimeScale: (value) => value,

    setGravity: (value) => value,

    setSimulationRunning: (isRunning) => isRunning,

    resetSimulation: () => ({ isRunning: false, timeScale: 1, gravity: -9.81 }),

    setLightEnabled: (_key, isEnabled) => isEnabled,

    setComponentVisible: (_path, _name, isVisible) => isVisible,

    collectAnimationGroups: () => [],

    getAnimationTime: () => 0,

    setAnimationPlayback: () => {},

    controlAnimation: () => {},

    seekAnimation: () => {},

    setAnimationSpeed: () => {},

    setAnimationMix: () => undefined,

    resetImportedEnvironment: async () => ({ ...settings.environment }),

    resetImportedEntities: () => runtime.captureEditorState()
  }

  return Object.assign(runtime, overrides)
}
