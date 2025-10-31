import { Serializable, Uniform } from '@luz/utilities'
import { Serialize } from '@luz/utilities/serializable'
import { vec3 } from '@luz/vectors'
import { Surface } from './surface'
import { Texture } from '../types/texture'
import { BlendMode } from './renderer'

export class Material extends Serializable {
  @Uniform()
  @Serialize()
  readonly color: vec3 = vec3.one.copy()

  @Serialize()
  albedoSurface: Surface | null

  @Uniform()
  texture: Texture

  @Serialize()
  normalSurface: Surface | null

  @Serialize()
  metallicSurface: Surface | null

  @Serialize()
  roughnessSurface: Surface | null

  @Serialize()
  occlusionSurface: Surface | null

  @Serialize()
  emissiveSurface: Surface | null

  @Uniform()
  normalTexture?: Texture

  @Uniform()
  metallicTexture?: Texture

  @Uniform()
  roughnessTexture?: Texture

  @Uniform()
  occlusionTexture?: Texture

  @Uniform()
  emissiveTexture?: Texture

  @Uniform()
  @Serialize()
  opacity: number = 1.0

  @Serialize()
  blendMode: BlendMode = 'None'

  constructor({ color, texture, opacity, blendMode }: Partial<Material> = {}) {
    super()

    if (color) {
      this.color.set(color)
    }

    if (texture) {
      this.texture = texture
    }

    if (opacity !== undefined) {
      this.opacity = opacity
    }

    if (blendMode) {
      this.blendMode = blendMode
    }
  }
}
