import { Texture } from '@luz/graphics'
import { Serializable } from '@luz/utilities'
import { DeserializationCallbacks, Serialize } from '@luz/utilities/serializable'
import { vec3 } from '@luz/vectors'

export class Material extends Serializable {
  @Serialize
  readonly baseColor: vec3

  @Serialize
  baseTexture: Texture | null

  constructor({ baseColor = vec3.one, baseTexture = null }: { baseColor?: vec3; baseTexture?: Texture | null } = {}) {
    super()

    this.baseColor = baseColor.copy()
    this.baseTexture = baseTexture
  }

  static async deserialize(serializedMaterial: SerializedMaterial, callbacks: DeserializationCallbacks) {
    const material = (await super.deserialize(serializedMaterial, callbacks)) as Material

    const { baseTexture } = serializedMaterial

    if (baseTexture) {
      //material.baseTexture = await Texture.deserialize(baseTexture, callbacks)
    }

    console.log(material)

    return material
  }
}

export class SerializedMaterial extends Material {}
