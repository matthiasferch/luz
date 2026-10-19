export type OverlayDepthMode = 'occluded' | 'visible' | 'always'

export const isOverlayDepthMode = (value: unknown): value is OverlayDepthMode =>
  value === 'occluded' || value === 'visible' || value === 'always'

export interface DebugSettings {
  overlayDepthMode: OverlayDepthMode
  overlayLineWidth: number
  overlayOpacity: number
  areGeometryOverlaysVisible: boolean
  areCameraFrustumsVisible: boolean
  areLightFrustumsVisible: boolean
  areModelBoundingBoxesVisible: boolean
  areBodyBoundingBoxesVisible: boolean
  areLightScissorsVisible: boolean
  areArmaturesVisible: boolean
  areCollidersVisible: boolean
  areCollisionsVisible: boolean
}

export const DEFAULT_DEBUG_SETTINGS: Readonly<DebugSettings> = {
  areGeometryOverlaysVisible: true,
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
  areCollisionsVisible: false
}
export function createDebugSettings(): DebugSettings {
  return { ...DEFAULT_DEBUG_SETTINGS }
}

export function updateDebugSetting<Key extends keyof DebugSettings>(
  settings: DebugSettings,
  key: Key,
  value: unknown
): DebugSettings[Key] {
  let acceptedValue: unknown = settings[key]

  if (typeof acceptedValue === 'boolean' && typeof value === 'boolean') {
    acceptedValue = value
  } else if (key === 'overlayDepthMode' && isOverlayDepthMode(value)) {
    acceptedValue = value
  } else if (typeof value === 'number' && Number.isFinite(value)) {
    if (key === 'overlayLineWidth') {
      acceptedValue = Math.max(1, Math.min(5, value))
    } else if (key === 'overlayOpacity') {
      acceptedValue = Math.max(0.1, Math.min(1, value))
    }
  }

  settings[key] = acceptedValue as DebugSettings[Key]

  return settings[key]
}
