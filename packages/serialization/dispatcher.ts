export type PairHandler<T extends { type: string }, R> = (firstItem: T, secondItem: T) => R | null

export class Dispatcher<T extends { type: string }, S, R> {
  private pairHandlers: Map<string, PairHandler<T, R>> = new Map()

  register<First extends T, Second extends T>(
    firstType: First['type'] & S,
    secondType: Second['type'] & S,
    onHandle: (firstItem: First, secondItem: Second) => R | null
  ): void {
    this.pairHandlers.set(`${firstType}-${secondType}`, (firstItem, secondItem) =>
      onHandle(firstItem as First, secondItem as Second)
    )
  }

  dispatch(firstItem: T, secondItem: T): R | null {
    let key = `${firstItem.type}-${secondItem.type}`
    let onHandle = this.pairHandlers.get(key)

    if (!onHandle) {
      key = `${secondItem.type}-${firstItem.type}`
      onHandle = this.pairHandlers.get(key)

      if (onHandle) {
        return onHandle(secondItem, firstItem)
      }
    }

    return onHandle ? onHandle(firstItem, secondItem) : null
  }
}
