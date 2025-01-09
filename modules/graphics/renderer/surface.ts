import { Serializable, Serialize } from '@luz/utilities'
import { Texture } from '../types/texture'

export class Surface extends Serializable {
  @Serialize()
  path?: string

  @Serialize()
  data?: any

  @Serialize()
  width: number = 1

  @Serialize()
  height: number = 1

  @Serialize()
  format: Texture.Format = 'color'

  @Serialize()
  precision: Texture.Precision = 8

  @Serialize()
  tiling: Texture.Tiling = 'none'

  @Serialize()
  filtering: Texture.Filtering = 'none'

  @Serialize()
  useMipmaps: boolean = false

  constructor(data: Partial<Surface> = {}) {
    super()

    Object.assign(this, data)
  }

  static deserialize(data: Partial<Surface>) {
    const surface = super.deserialize(data) as Surface

    if ('data' in surface) {
      const { data, precision = 8 } = surface

      switch (precision) {
        case 8:
          surface.data = new Uint8Array(data)
          break

        case 32:
          surface.data = new Float32Array(data)
          break
      }
    }

    return surface
  }
}
