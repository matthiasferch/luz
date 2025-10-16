import { Serializable, Uniform } from '@luz/utilities'
import { Serialize } from '@luz/utilities/serializable'
import { vec3 } from '@luz/vectors'
import { Surface } from './surface'
import { Texture } from '../types/texture'

export class Material extends Serializable {
  @Uniform()
  @Serialize()
  readonly color: vec3 = vec3.one.copy()

  @Serialize()
  surface: Surface | null

  @Uniform()
  texture: Texture

  // Controls if the material participates in opaque or transparent rendering.
  // Mask is intentionally not supported in this iteration.
  @Serialize()
  alphaMode: 'Opaque' | 'Blend' = 'Opaque'

  // Opacity factor used by shaders; when alphaMode === 'Blend' this should be < 1
  @Uniform()
  @Serialize()
  opacity: number = 1.0

  // Optional refinement for transparent blending behavior. Only relevant when alphaMode === 'Blend'.
  // When unspecified, treat as standard alpha blending.
  @Serialize()
  blendMode?: 'Transparent' | 'Additive'

  constructor({ color, texture, alphaMode, opacity, blendMode }: Partial<Material> = {}) {
    super()

    if (color) {
      this.color.set(color)
    }

    if (texture) {
      this.texture = texture
    }

    if (alphaMode) {
      this.alphaMode = alphaMode
    }

    if (opacity !== undefined) {
      this.opacity = opacity
    }

    if (blendMode) {
      this.blendMode = blendMode
    }
  }
}
