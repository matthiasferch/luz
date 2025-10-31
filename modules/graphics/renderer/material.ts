import { Serializable, Uniform } from '@luz/utilities'
import { Serialize } from '@luz/utilities/serializable'
import { vec3 } from '@luz/vectors'
import { Surface } from './surface'
import { Texture } from '../types/texture'
import { BlendMode } from './renderer'

export class Material extends Serializable {
  @Uniform()
  @Serialize()
  readonly albedoColor: vec3 = vec3.one.copy()

  @Uniform()
  @Serialize()
  readonly emissiveColor: vec3 = vec3.zero.copy()

  @Serialize()
  albedoSurface: Surface | null

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
  albedoTexture: Texture

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

  @Serialize()
  parallaxSurface: Surface | null

  @Uniform()
  parallaxTexture?: Texture

  @Uniform()
  useParallaxMapping: boolean = false

  @Uniform()
  @Serialize()
  parallaxScale: number = 0.04

  @Uniform()
  @Serialize()
  opacity: number = 1.0

  @Serialize()
  blendMode: BlendMode = 'None'

  constructor({ albedoColor, albedoTexture, opacity, blendMode }: Partial<Material> = {}) {
    super()

    if (albedoColor) {
      this.albedoColor.set(albedoColor)
    }

    if (albedoTexture) {
      this.albedoTexture = albedoTexture
    }

    if (opacity !== undefined) {
      this.opacity = opacity
    }

    if (blendMode) {
      this.blendMode = blendMode
    }
  }

  static async deserialize(data: any) {
    const mapped: any = { ...data }

    // Backward compatibility mappings
    if (mapped.surface !== undefined && mapped.albedoSurface === undefined) {
      mapped.albedoSurface = mapped.surface
      delete mapped.surface
    }
    if (mapped.color !== undefined && mapped.albedoColor === undefined) {
      mapped.albedoColor = mapped.color
      delete mapped.color
    }
    if (mapped.texture !== undefined && mapped.albedoTexture === undefined) {
      mapped.albedoTexture = mapped.texture
      delete mapped.texture
    }
    if (mapped.heightSurface !== undefined && mapped.parallaxSurface === undefined) {
      mapped.parallaxSurface = mapped.heightSurface
      delete mapped.heightSurface
    }

    return (await super.deserialize(mapped)) as Material
  }
}
