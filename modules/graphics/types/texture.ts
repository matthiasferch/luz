export type TextureProperties = {
  path?: string
  data?: any

  width: number
  height: number

  format: Texture.Format
  precision: Texture.Precision

  tiling: Texture.Tiling
  filtering: Texture.Filtering

  useMipmaps: boolean
}

export type Texture = WebGLTexture &
  TextureProperties & {
    target: number

    dataType: number
    dataFormat: number
    components: number
  }

export namespace Texture {
  export type Precision = 8 | 32

  export type Format = 'color' | 'alpha' | 'depth'
  export type Tiling = 'none' | 'repeat' | 'mirror'
  export type Filtering = 'none' | 'linear' | 'bilinear' | 'trilinear'
}
