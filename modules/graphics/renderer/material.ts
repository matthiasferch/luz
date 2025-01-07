import { Texture } from '@luz/graphics'
import { vec3 } from '@luz/vectors'

export type SerializedMaterial = {
  baseColor?: number[]
  baseTexture?: Texture
}

export class Material {
  baseColor: vec3
  baseTexture: Texture | null

  constructor({ baseColor = vec3.grey, baseTexture = null } = {}) {
    this.baseColor = baseColor.copy()
    this.baseTexture = baseTexture
  }

  static deserialize({ baseColor, baseTexture }: SerializedMaterial) {
    const material = new Material()

    if (baseColor) {
      material.baseColor.set(baseColor)
    }

    if (baseTexture) {
      material.baseTexture = baseTexture
    }

    return material
  }
}
