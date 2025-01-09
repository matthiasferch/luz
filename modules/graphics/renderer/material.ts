import { Texture } from '@luz/graphics'
import { Serializable } from '@luz/utilities'
import { Serialize } from '@luz/utilities/serializable'
import { vec3 } from '@luz/vectors'
import { Surface } from './surface'

export class Material extends Serializable {
  @Serialize()
  readonly color: vec3

  @Serialize()
  readonly surface: Surface | null

  texture: Texture | null

  constructor({ color = vec3.one, surface = null, texture = null }: Partial<Material> = {}) {
    super()

    this.color = color.copy()

    this.surface = surface
    this.texture = texture
  }
}
