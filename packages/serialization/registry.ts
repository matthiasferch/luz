export interface RegisteredClass<T extends object = object> {
  new (...parameters: never[]): T
  readonly name: string
  readonly prototype: T
  deserialize(data: unknown): Promise<T>
}

const classRegistry = new Map<string, RegisteredClass>()
const registeredTypes = new WeakMap<object, string>()

export function Register(type: string) {
  if (!/^[a-z][a-zA-Z0-9]*$/.test(type)) {
    throw new Error(`Invalid registered type '${type}'`)
  }

  return function (classConstructor: RegisteredClass): void {
    const existingClass = classRegistry.get(type)
    const existingType = registeredTypes.get(classConstructor)

    if ((existingClass && existingClass !== classConstructor) || (existingType && existingType !== type)) {
      throw new Error(`Conflicting registration for '${type}'`)
    }

    classRegistry.set(type, classConstructor)
    registeredTypes.set(classConstructor, type)
  }
}

export function findRegisteredClass(
  type: string,
  base?: { prototype: object; name: string }
): RegisteredClass | undefined {
  const classConstructor = classRegistry.get(type)

  if (
    classConstructor &&
    base &&
    classConstructor !== base &&
    !Object.prototype.isPrototypeOf.call(base.prototype, classConstructor.prototype)
  ) {
    throw new Error(`Registered type '${type}' is not a ${base.name}`)
  }

  return classConstructor
}

export function getRegisteredType(classConstructor: object): string | undefined {
  return registeredTypes.get(classConstructor)
}
