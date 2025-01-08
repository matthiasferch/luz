import { Material, Mesh, Texture } from '@luz/graphics'
import { SerializedMaterial } from '@luz/graphics/renderer/material'
import { SerializedMesh } from '@luz/graphics/renderer/mesh'
import { SerializedTexture } from '@luz/graphics/types/texture'

const serializableProperties = new WeakMap()

export function Serialize(target: Object, propertyKey: string) {
  let properties: string[] = []

  if (serializableProperties.has(target.constructor)) {
    properties = serializableProperties.get(target.constructor)
  } else {
    serializableProperties.set(target.constructor, properties)
  }

  properties.push(propertyKey)
}

export type DeserializationCallbacks = {
  onDeserializeMesh: (mesh: SerializedMesh, materials?: Record<string, Material>) => Mesh
  onDeserializeTexture: (texture: SerializedTexture) => Texture
}

export class Serializable {
  serialize() {
    const isPlainObject = (value: any) => {
      return typeof value === 'object' && value.constructor === Object
    }

    const isSerializable = (value: any) => {
      return typeof value.serialize === 'function'
    }

    const data = {}

    const properties = Serializable.getAllSerializableProperties(this.constructor)

    for (const prop of properties) {
      const value = this[prop]

      if (Array.isArray(value)) {
        data[prop] = value.map((item) => {
          if (item && isSerializable(item)) {
            return item.serialize()
          }

          return item
        })
      } else if (value && isPlainObject(value)) {
        data[prop] = {}

        for (const key in value) {
          if (value[key] && isSerializable(value[key])) {
            data[prop][key] = value[key].serialize()
          } else {
            data[prop][key] = value[key]
          }
        }
      } else if (value && isSerializable(value)) {
        data[prop] = value.serialize()
      } else {
        data[prop] = value
      }
    }

    return data
  }

  static async deserialize(data: any, callbacks: DeserializationCallbacks) {
    const isDeserializable = (value: any) => {
      return typeof value.deserialize === 'function'
    }

    const instance = new this()

    const keys = Serializable.getAllSerializableProperties(this)

    for (const key of keys) {
      if (data.hasOwnProperty(key)) {
        if (instance[key] && isDeserializable(instance[key].constructor)) {
          instance[key] = instance[key].constructor.deserialize(data[key])
        } else {
          instance[key] = data[key]
        }
      }
    }

    return instance
  }

  private static getAllSerializableProperties(target: Function): string[] {
    let allProperties: string[] = []

    let prototype = target.prototype

    while (prototype && prototype !== Object.prototype) {
      const properties = serializableProperties.get(prototype.constructor) || []

      allProperties = [...allProperties, ...properties]

      prototype = Object.getPrototypeOf(prototype)
    }

    return allProperties
  }
}
