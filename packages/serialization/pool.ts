export interface PoolOptions<T> {
  createObject: () => T
  resetObject: (object: T) => T
  initialCapacity?: number
  growthSize?: number
}

export type SynchronousCallback<Result> = (() => Result) &
  (Extract<Result, PromiseLike<unknown>> extends never ? unknown : never)

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  value !== null &&
  (typeof value === 'object' || typeof value === 'function') &&
  'then' in value &&
  typeof value.then === 'function'

export class Pool<T> {
  private readonly objects: T[] = []
  private readonly scopes: Set<T>[] = []
  private readonly deferredScopes = new Set<Set<T>>()
  private readonly createObject: () => T
  private readonly resetObject: (object: T) => T
  private readonly growthSize: number

  constructor({
    createObject,
    resetObject,
    initialCapacity = 0,
    growthSize = Math.max(1, initialCapacity)
  }: PoolOptions<T>) {
    if (!Number.isInteger(initialCapacity) || initialCapacity < 0 || !Number.isInteger(growthSize) || growthSize < 1) {
      throw new RangeError('Pool initialCapacity must be nonnegative and growthSize must be positive integers')
    }

    this.createObject = createObject
    this.resetObject = resetObject
    this.growthSize = growthSize

    this.createObjects(initialCapacity)
  }

  get availableCount(): number {
    return this.objects.length
  }

  acquire(): T {
    if (this.objects.length === 0) {
      this.createObjects(this.growthSize)
    }

    const object = this.objects.pop() as T

    this.scopes[this.scopes.length - 1]?.add(object)

    return object
  }

  release(object: T): void {
    for (const scope of this.scopes) {
      scope.delete(object)
    }

    for (const scope of this.deferredScopes) {
      scope.delete(object)
    }

    this.objects.push(this.resetObject(object))
  }

  runInScope<Result>(run: SynchronousCallback<Result>): Result {
    const objects = new Set<T>()

    let isDeferred = false

    this.scopes.push(objects)

    try {
      const result = run()

      if (isThenable(result)) {
        isDeferred = true

        this.deferredScopes.add(objects)

        const releaseObjects = () => {
          this.deferredScopes.delete(objects)
          this.releaseObjects(objects)
        }

        // A rejected async scope still owns its existing leases until the callback settles.
        void Promise.resolve(result).then(releaseObjects, releaseObjects)

        throw new TypeError('Pool scopes must be synchronous; use explicit acquire/release across await')
      }

      return result
    } finally {
      this.scopes.pop()

      if (!isDeferred) {
        this.releaseObjects(objects)
      }
    }
  }

  private releaseObjects(objects: Set<T>): void {
    for (const object of objects) {
      this.release(object)
    }
  }

  private createObjects(objectCount: number): void {
    for (let index = 0; index < objectCount; index++) {
      this.objects.push(this.createObject())
    }
  }
}
