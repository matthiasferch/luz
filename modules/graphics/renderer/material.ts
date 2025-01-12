import { Serializable } from '@luz/utilities'
import { Serialize } from '@luz/utilities/serializable'
import { vec3 } from '@luz/vectors'
import { Surface } from './surface'

export class Material extends Serializable<Material> {
  @Serialize()
  readonly color: vec3 = vec3.one.copy()

  @Serialize()
  surface: Surface | null

  constructor({ color }: Partial<Material> = {}) {
    super()

    if (color) {
      this.color.set(color)
    }
  }
}
