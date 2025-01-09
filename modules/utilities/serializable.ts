import 'reflect-metadata'

const serializableProperties = new WeakMap()

type SerializableProperty = { key: string; type: any; valueType?: any }

export function Serialize(valueType?: any) {
  return function (target: Object, key: string) {
    let properties: SerializableProperty[] = []

    if (serializableProperties.has(target.constructor)) {
      properties = serializableProperties.get(target.constructor)
    } else {
      serializableProperties.set(target.constructor, properties)
    }

    const type = Reflect.getMetadata('design:type', target, key)

    properties.push({ key, type, valueType })
  }
}

const { isArray } = Array

export class Serializable {
  serialize() {
    const data: Record<string, any> = {}

    const properties = Serializable.getAllSerializableProperties(this.constructor)

    for (const { key } of properties) {
      const value = this[key]
      // Serialization logic here...
      data[key] = value
    }

    return data
  }

  static deserialize(data: any) {
    const isObject = (value: any) => {
      return value && typeof value === 'object'
    }

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

      if (isDeserializable(type)) {
        instance[key] = type.deserialize(value)
      } else if (isArray(value)) {
        instance[key] = value.map((value) => {
          return isDeserializable(valueType) ? valueType.deserialize(value) : value
        })
      } else if (isObject(value)) {
        instance[key] = Object.entries(value).reduce((entries, [key, value]) => {
          entries[key] = isDeserializable(valueType) ? valueType.deserialize(value) : value

          return entries
        }, {})
      } else {
        instance[key] = value
      }
    }

    return instance
  }

  private static getAllSerializableProperties(target: Function): SerializableProperty[] {
    let allProperties: SerializableProperty[] = []

    let prototype = target.prototype

    while (prototype && prototype !== Object.prototype) {
      const properties = serializableProperties.get(prototype.constructor) || []

      allProperties = [...allProperties, ...properties]

      prototype = Object.getPrototypeOf(prototype)
    }

    return allProperties
  }
}
