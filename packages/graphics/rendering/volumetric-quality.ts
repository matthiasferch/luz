export const VOLUMETRIC_QUALITY = {
  low: { resolutionScale: 0.25, sampleCount: 16 },
  medium: { resolutionScale: 0.5, sampleCount: 24 },
  high: { resolutionScale: 0.75, sampleCount: 48 }
} as const

export type VolumetricQuality = keyof typeof VOLUMETRIC_QUALITY

export const isVolumetricQuality = (value: unknown): value is VolumetricQuality =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(VOLUMETRIC_QUALITY, value)

export const calculateVolumetricTargetSize = (width: number, height: number, quality: VolumetricQuality) => {
  const { resolutionScale } = VOLUMETRIC_QUALITY[quality]

  return {
    width: Math.max(1, Math.ceil(width * resolutionScale)),
    height: Math.max(1, Math.ceil(height * resolutionScale))
  }
}
