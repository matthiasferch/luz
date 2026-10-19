type PartialDouble<Value, Depth extends unknown[] = []> = Value extends (...parameters: never[]) => unknown
  ? Value
  : Depth['length'] extends 4
    ? Partial<Value>
    : Value extends object
      ? { [Key in keyof Value]?: PartialDouble<Value[Key], [...Depth, unknown]> }
      : Value

// Test doubles deliberately provide only the members exercised by their test.
export function createDouble<Value>(members: PartialDouble<Value>): Value {
  return members as Value
}
