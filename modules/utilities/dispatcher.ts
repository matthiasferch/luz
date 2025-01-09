type Callback<T extends { type: string }, S> = (a: T, b: T) => S | null

export class Dispatcher<T extends { type: string }, S, R> {

  private callbacks: Map<string, Callback<T, R>> = new Map()

  register(firstType: S, otherType: S, callback: Callback<T, R>) {
    this.callbacks.set(`${firstType}-${otherType}`, callback)
  }

  dispatch(first: T, other: T): R | null {
    let key = `${first.type}-${other.type}`
    let callback = this.callbacks.get(key)

    if (!callback) {
      key = `${other.type}-${first.type}`
      callback = this.callbacks.get(key)

      if (callback) {
        return callback(other, first)
      }
    }

    return (callback) ? callback(first, other) : null
  }

}