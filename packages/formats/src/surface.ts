export type TexturePrecision = 8 | 16 | 24 | 32
export type TextureFormat = 'color' | 'red' | 'redGreen' | 'alpha' | 'depth'
export type ColorSpace = 'linear' | 'sRGB'
export type TextureTiling = 'none' | 'repeat' | 'mirror'
export type TextureFiltering = 'none' | 'linear' | 'bilinear' | 'trilinear'

export interface SurfaceDefinition {
  path?: string
  data?: number[]
  width?: number
  height?: number
  format?: TextureFormat
  colorSpace?: ColorSpace
  precision?: TexturePrecision
  tiling?: TextureTiling
  filtering?: TextureFiltering
  areMipmapsEnabled?: boolean
}
