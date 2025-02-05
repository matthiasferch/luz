const uniformProperties = new WeakMap()

type UniformProperty = { key: string; type: any }

export function Uniform() {
  return function (target: Object, key: string) {
    let properties: UniformProperty[] = []

    if (uniformProperties.has(target.constructor)) {
      properties = uniformProperties.get(target.constructor)
    } else {
      uniformProperties.set(target.constructor, properties)
    }

    const type = Reflect.getMetadata('design:type', target, key)

    properties.push({ key, type })

    console.log(uniformProperties)
  }
}

export function getUniformProperties(target: Function): UniformProperty[] {
  let allProperties: UniformProperty[] = []

  let prototype = target.prototype

  while (prototype && prototype !== Object.prototype) {
    const properties = uniformProperties.get(prototype.constructor) || []

    allProperties = [...allProperties, ...properties]

    prototype = Object.getPrototypeOf(prototype)
  }

  return allProperties
}
