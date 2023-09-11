const serializableProperties = new WeakMap()

export function Serialized(target: Object, propertyKey: string) {
  let properties: string[] = []

  if (serializableProperties.has(target.constructor)) {
    properties = serializableProperties.get(target.constructor)
  } else {
    serializableProperties.set(target.constructor, properties)
  }

  properties.push(propertyKey)
}

export class Serializable {

  serialize() {
    const isObject = (value: any) => {
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
      } else if (value && isObject(value)) {
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

  static deserialize<T extends Serializable>(this: new () => T, data: any): T {
    const isDeserializable = (value: any) => {
      return typeof value.deserialize === 'function'
    }

    const instance = new this()

    const properties = Serializable.getAllSerializableProperties(this)

    for (const prop of properties) {
      if (data.hasOwnProperty(prop)) {
        if (instance[prop] && isDeserializable(instance[prop].constructor)) {
          instance[prop] = instance[prop].constructor.deserialize(data[prop])
        } else {
          instance[prop] = data[prop]
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