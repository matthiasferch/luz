type ClassConstructor = new (...args: any[]) => any

const classRegistry = new Map()

export function Register() {
  return function (classConstructor: ClassConstructor) {
    classRegistry.set(classConstructor.name, classConstructor)
  }
}

export function getRegisteredClass(value: any) {
  return classRegistry.get(value?.type)
}
