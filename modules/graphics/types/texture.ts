export type Texture = WebGLTexture & {
  target: number

  width: number
  height: number

  dataType: number
  dataFormat: number
  components: number

  useMipmaps: boolean

  data?: any
}

export namespace Texture {
  export type Precision = 8 | 32

  export type Format = 'color' | 'alpha' | 'depth'
  export type Tiling = 'none' | 'repeat' | 'mirror'
  export type Filtering = 'none' | 'linear' | 'bilinear' | 'trilinear'
}
