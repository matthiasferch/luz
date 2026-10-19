import type { TextureSource } from './texture-source'
import type { ColorSpace } from '@luz/formats'

export type Texture = WebGLTexture & {
  target: number

  width: number
  height: number

  dataType: number
  dataFormat: number
  components: number

  colorSpace: ColorSpace
  areMipmapsEnabled: boolean

  data?: TextureSource
}
