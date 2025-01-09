import { Texture } from '@luz/graphics'
import { Serializable } from '@luz/utilities'
import { Serialize } from '@luz/utilities/serializable'
import { vec3 } from '@luz/vectors'
import { Surface } from './surface'

export class Material extends Serializable {
  @Serialize()
  readonly color = vec3.one.copy()

  @Serialize()
  readonly surface: Surface | null

  texture: Texture | null

  constructor(data: Partial<Material> = {}) {
    super()

    Object.assign(this, data)

    if (data.color) {
      this.color.set(data.color)
    }
  }
}
