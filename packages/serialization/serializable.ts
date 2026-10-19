import 'reflect-metadata'

import { findRegisteredClass, getRegisteredType } from './registry'

const serializedProperties = new WeakMap<object, SerializedProperty[]>()

export type DeserializableClass = (abstract new (...parameters: never[]) => object) & {
  readonly name: string
  deserialize(data: unknown): Promise<object>
}

interface SerializedProperty {
  key: string
  type: unknown
  valueType?: DeserializableClass
}

export function Serialize(valueType?: DeserializableClass) {
  if (valueType !== undefined && !isDeserializable(valueType)) {
    throw new TypeError('Serialized collection entries require a class with a deserialize method')
  }

  return function (target: object, key: string) {
    let properties: SerializedProperty[] = []

    const registered = serializedProperties.get(target.constructor)

    if (registered) {
      properties = registered
    } else {
      serializedProperties.set(target.constructor, properties)
    }

    const type: unknown = Reflect.getMetadata('design:type', target, key)

    properties.push({ key, type, valueType })
  }
}

const { isArray } = Array

const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object'
}

const isDeserializable = (type: unknown): type is DeserializableClass => {
  return (
    typeof type === 'function' &&
    'deserialize' in type &&
    typeof type.deserialize === 'function' &&
    typeof type.prototype === 'object'
  )
}

export class Serializable {
  serialize(): Record<string, unknown> {
    const isSerializable = (value: unknown): value is Serializable => {
      return isObject(value) && typeof value.serialize === 'function'
    }

    const properties = Serializable.collectSerializableProperties(this.constructor)
    const source = this as unknown as Record<string, unknown>
    const data: Record<string, unknown> = {}

    for (const { key } of properties) {
      const value = source[key]

      if (value === undefined) {
        continue
      }

      if (isSerializable(value)) {
        data[key] = value.serialize()
      } else if (isArray(value)) {
        data[key] = value.map((value) => {
          return isSerializable(value) ? value.serialize() : value
        })
      } else if (isObject(value)) {
        data[key] = Object.entries(value).reduce<Record<string, unknown>>((entries, [key, value]) => {
          entries[key] = isSerializable(value) ? value.serialize() : value

          return entries
        }, {})
      } else {
        data[key] = value
      }
    }

    return data
  }

  static async deserialize(data: unknown): Promise<Serializable> {
    if (!isObject(data) || isArray(data)) {
      throw new Error(`${this.name} requires an object definition`)
    }

    const properties = Serializable.collectSerializableProperties(this)
    const registeredType = getRegisteredType(this)

    if (registeredType !== undefined && data.type !== registeredType) {
      throw new Error(`Expected type '${registeredType}' for ${this.name}, received '${String(data.type)}'`)
    }

    const resolveType = (value: unknown, expectedType: unknown): unknown => {
      if (
        !isDeserializable(expectedType) ||
        !Serializable.collectSerializableProperties(expectedType).some(({ key }) => key === 'type')
      ) {
        return expectedType
      }

      if (!isObject(value) || typeof value.type !== 'string') {
        throw new Error(`Missing type for ${expectedType.name}`)
      }

      const resolvedType = findRegisteredClass(value.type, expectedType)

      if (!resolvedType) {
        throw new Error(`Unknown type '${value.type}' for ${expectedType.name}`)
      }

      return resolvedType
    }

    if (registeredType === undefined && properties.some(({ key }) => key === 'type')) {
      const resolvedType = resolveType(data, this)

      if (!isDeserializable(resolvedType)) {
        throw new Error(`Missing deserializer for ${this.name}`)
      }

      return (await resolvedType.deserialize(data)) as Serializable
    }

    const instance = new this()
    const target = instance as unknown as Record<string, unknown>

    if (registeredType !== undefined && target.type !== registeredType) {
      throw new Error(`Registered type '${registeredType}' does not match the runtime discriminator`)
    }

    for (const { key, type, valueType } of properties) {
      const value = data[key]

      if (value === undefined || (key === 'type' && registeredType !== undefined)) {
        continue
      }

      const currentType = resolveType(value, type)
      const currentValueType = valueType

      if (isDeserializable(currentType)) {
        target[key] = await currentType.deserialize(value)
      } else if (isArray(value)) {
        target[key] = await Promise.all(
          value.map(async (item) => {
            if (typeof item === 'string' && currentValueType !== undefined) {
              throw new Error(
                `Unresolved asset reference '${item}' in '${key}'; use an asset loader before deserialization`
              )
            }

            const itemValueType = resolveType(item, currentValueType)

            return isDeserializable(itemValueType) ? await itemValueType.deserialize(item) : item
          })
        )
      } else if (isObject(value)) {
        const entries = await Promise.all(
          Object.entries(value).map(async ([entryKey, entryValue]) => {
            if (typeof entryValue === 'string' && currentValueType !== undefined) {
              throw new Error(
                `Unresolved asset reference '${entryValue}' in '${key}/${entryKey}'; use an asset loader before deserialization`
              )
            }

            const entryValueType = resolveType(entryValue, currentValueType)

            if (isDeserializable(entryValueType) && entryValue instanceof entryValueType) {
              return [entryKey, entryValue]
            }

            return [
              entryKey,
              isDeserializable(entryValueType) ? await entryValueType.deserialize(entryValue) : entryValue
            ]
          })
        )

        target[key] = Object.fromEntries(entries)
      } else {
        target[key] = value
      }
    }

    return instance
  }

  private static collectSerializableProperties(target: { prototype: object }): SerializedProperty[] {
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
