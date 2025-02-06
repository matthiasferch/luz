import 'reflect-metadata'

import { getRegisteredClass } from './registry'

const serializedProperties = new WeakMap()

type SerializedProperty = { key: string; type: any; valueType?: any }

export function Serialize(valueType?: any) {
  return function (target: Object, key: string) {
    let properties: SerializedProperty[] = []

    if (serializedProperties.has(target.constructor)) {
      properties = serializedProperties.get(target.constructor)
    } else {
      serializedProperties.set(target.constructor, properties)
    }

    const type = Reflect.getMetadata('design:type', target, key)

    properties.push({ key, type, valueType })
  }
}

const { isArray } = Array

const isObject = (value: any): value is object => {
  return typeof value === 'object'
}
export class Serializable {
  serialize() {
    const isSerializable = (value: any) => {
      return typeof value.serialize === 'function'
    }

    const properties = Serializable.getAllSerializableProperties(this.constructor)

    return properties.reduce((data, { key }) => {
      const value = this[key]

      if (value === undefined) {
        return data
      }

      if (isSerializable(value)) {
        data[key] = value.serialize(value)
      } else if (isArray(value)) {
        data[key] = value.map((value) => {
          return isSerializable(value) ? value.serialize(value) : value
        })
      } else if (isObject(value)) {
        data[key] = Object.entries(value).reduce((entries, [key, value]) => {
          entries[key] = isSerializable(value) ? value.serialize(value) : value

          return entries
        }, {})
      } else {
        data[key] = value
      }

      return data
    }, {})
  }

  static async deserialize(data: any) {
    const isDeserializable = (type: any) => {
      return type && typeof type.deserialize === 'function'
    }

    const instance = new this()

    const properties = Serializable.getAllSerializableProperties(this)

    for (const { key, type, valueType } of properties) {
      const value = data[key]

      if (value === undefined) {
        continue
      }

      let currentType = type
      let currentValueType = valueType

      if (getRegisteredClass(value)) {
        currentType = getRegisteredClass(value)
      }

      if (isDeserializable(currentType)) {
        instance[key] = await currentType.deserialize(value)
      } else if (isArray(value)) {
        instance[key] = await Promise.all(
          value.map(async (item) => {
            let itemValueType = currentValueType

            if (getRegisteredClass(item)) {
              itemValueType = getRegisteredClass(item)
            }

            if (typeof item === 'string' && itemValueType !== undefined) {
              const response = await fetch(item)
              const jsonData = await response.json()

              return await itemValueType.deserialize(jsonData)
            } else {
              return isDeserializable(itemValueType) ? await itemValueType.deserialize(item) : item
            }
          })
        )
      } else if (isObject(value)) {
        const entries = await Promise.all(
          Object.entries(value).map(async ([entryKey, entryValue]) => {
            let entryValueType = currentValueType

            if (getRegisteredClass(entryValue)) {
              entryValueType = getRegisteredClass(entryValue)
            }

            if (typeof entryValue === 'string' && entryValueType !== undefined) {
              const response = await fetch(entryValue)
              const jsonData = await response.json()

              return [entryKey, await entryValueType.deserialize(jsonData)]
            } else {
              return [
                entryKey,
                isDeserializable(entryValueType) ? await entryValueType.deserialize(entryValue) : entryValue
              ]
            }
          })
        )

        instance[key] = Object.fromEntries(entries)
      } else {
        instance[key] = value
      }
    }

    return instance
  }

  private static getAllSerializableProperties(target: Function): SerializedProperty[] {
    let allProperties: SerializedProperty[] = []

    let prototype = target.prototype

    while (prototype && prototype !== Object.prototype) {
      const properties = serializedProperties.get(prototype.constructor) || []

      allProperties = [...allProperties, ...properties]

      prototype = Object.getPrototypeOf(prototype)
    }

    return allProperties
  }
}
