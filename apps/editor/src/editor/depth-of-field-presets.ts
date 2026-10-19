import type { DepthOfFieldSettings } from '../settings'

type FocusSettings = Omit<DepthOfFieldSettings, 'isEnabled' | 'isCameraOverridden'>

interface FocusPreset {
  value: string
  label: string
  settings: Readonly<FocusSettings>
}

export const depthOfFieldPresets: readonly FocusPreset[] = [
  {
    value: 'gentle',
    label: 'Gentle background blur',
    settings: {
      focusDistance: 2.5,
      focalLength: 50,
      sensorHeight: 24,
      fStop: 2.8,
      maximumBlurRadius: 12,
      maximumSamples: 32
    }
  },
  {
    value: 'foreground',
    label: 'Sharp foreground',
    settings: {
      focusDistance: 2.5,
      focalLength: 75,
      sensorHeight: 24,
      fStop: 1.4,
      maximumBlurRadius: 20,
      maximumSamples: 64
    }
  },
  {
    value: 'isolation',
    label: 'Strong subject isolation',
    settings: {
      focusDistance: 2.5,
      focalLength: 100,
      sensorHeight: 24,
      fStop: 1.2,
      maximumBlurRadius: 30,
      maximumSamples: 64
    }
  },
  {
    value: 'closeUp',
    label: 'Close-up',
    settings: {
      focusDistance: 0.75,
      focalLength: 50,
      sensorHeight: 24,
      fStop: 2.8,
      maximumBlurRadius: 20,
      maximumSamples: 64
    }
  }
]

export function getDepthOfFieldPreset(settings: DepthOfFieldSettings): string {
  if (!settings.isCameraOverridden) {
    return 'camera'
  }

  return (
    depthOfFieldPresets.find((preset) =>
      Object.entries(preset.settings).every(
        ([key, value]) => Math.abs(settings[key as keyof FocusSettings] - value) < 1e-6
      )
    )?.value ?? 'custom'
  )
}
