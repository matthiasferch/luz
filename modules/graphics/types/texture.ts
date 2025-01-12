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
  export type Precision = 8 | 24 | 32

  export type Format = 'Color' | 'Alpha' | 'Depth'
  export type Tiling = 'None' | 'Repeat' | 'Mirror'
  export type Filtering = 'None' | 'Linear' | 'Bilinear' | 'Trilinear'
}
