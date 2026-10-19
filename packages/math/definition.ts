export function readValues(value: unknown, componentCount: number, name: string): number[] {
  if (
    !Array.isArray(value) ||
    value.length !== componentCount ||
    value.some(
      (component: unknown) =>
        typeof component !== 'number' || !Number.isFinite(component) || !Number.isFinite(Math.fround(component))
    )
  ) {
    throw new Error(`${name} requires ${componentCount} finite Float32 components`)
  }

  return value
}
