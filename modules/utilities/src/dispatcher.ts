type Callback<T extends { type: string }, S> = (a: T, b: T) => S | null

export class Dispatcher<T extends { type: string }, S> {

  private callbacks: Map<string, Callback<T, S>> = new Map()

  register(firstType: string, otherType: string, callback: Callback<T, S>) {
    this.callbacks.set(`${firstType}-${otherType}`, callback)
  }

  dispatch(first: T, other: T): S | null {
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