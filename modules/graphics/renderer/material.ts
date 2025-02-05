import { Serializable, Uniform } from '@luz/utilities'
import { Serialize } from '@luz/utilities/serializable'
import { vec3 } from '@luz/vectors'
import { Surface } from './surface'
import { Texture } from '../types/texture'

export class Material extends Serializable<Material> {
  @Uniform()
  @Serialize()
  readonly color: vec3 = vec3.one.copy()

  @Serialize()
  surface: Surface | null

  @Uniform()
  texture: Texture

  constructor({ color }: Partial<Material> = {}) {
    super()

    if (color) {
      this.color.set(color)
    }
  }
}
