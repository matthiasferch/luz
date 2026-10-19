export function readDefinition(value: unknown, name = 'Definition'): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${name} requires an object definition`)
  }

  return value as Record<string, unknown>
}
