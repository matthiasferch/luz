export type Texture = WebGLTexture & {
  target: number

  format: number
  type: number

  width: number
  height: number

  tiling: Texture.Tiling
  filtering: Texture.Filtering

  useMipmaps: boolean
}

export declare module Texture {
  export enum Tiling {
    None,
  
    Both,
  
    Horizontal,
    Vertical
  }

  export enum Filtering {
    None,
    Linear,
    Bilinear,
    Trilinear
  }
}

