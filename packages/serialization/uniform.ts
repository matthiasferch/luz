const uniformProperties = new WeakMap<object, UniformProperty[]>()

export interface UniformProperty {
  key: string
  type: unknown
}

export function Uniform() {
  return function (target: object, key: string) {
    let properties: UniformProperty[] = []

    const existingProperties = uniformProperties.get(target.constructor)

    if (existingProperties) {
      properties = existingProperties
    } else {
      uniformProperties.set(target.constructor, properties)
    }

    const type: unknown = Reflect.getMetadata('design:type', target, key)

    properties.push({ key, type })
  }
}

export function collectUniformProperties(target: { prototype: object }): UniformProperty[] {
  let allProperties: UniformProperty[] = []

  let prototype = target.prototype

  while (prototype && prototype !== Object.prototype) {
    const properties = uniformProperties.get(prototype.constructor) || []

    allProperties = [...allProperties, ...properties]
    prototype = Object.getPrototypeOf(prototype)
  }

  return allProperties
}
