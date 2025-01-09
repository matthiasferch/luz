import { Surface } from '../renderer/surface'

export type TextureInternals = {
  target: number
  dataType: number
  dataFormat: number
  components: number
}

export type Texture = WebGLTexture & Surface & TextureInternals

export namespace Texture {
  export type Precision = 8 | 32

  export type Format = 'color' | 'alpha' | 'depth'
  export type Tiling = 'none' | 'repeat' | 'mirror'
  export type Filtering = 'none' | 'linear' | 'bilinear' | 'trilinear'
}
