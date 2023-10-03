const { ceil } = Math

export class Pool<T> {

  private readonly pool: T[]

  private maximumSize: number         // maximum number of objects that the pool can grow to

  constructor(
    private create: () => T,
    private reset: (object: T) => T,
    private initialSize: number,      // number of objects to allocate on pool creation
    private batchSize: number = 0     // number of objects to create whenever pool needs to grow
  ) {
    this.pool = new Array<T>()

    this.maximumSize = initialSize

    this.allocate(this.initialSize)
  }

  get length() {
    return this.pool.length
  }

  acquire(): T {
    if (this.pool.length > 0) {
      // if number of available objects is less than 10% of maximum size,
      // double maximum size and fill up pool with newly allocated objects

      if (this.pool.length <= ceil(this.maximumSize * 0.1)) {
        this.maximumSize *= 2

        this.allocate(this.maximumSize - this.pool.length)
      }
    } else {
      // if there are none available, 
      // allocate new batch of objects

      this.allocate(this.batchSize)
    }

    return this.pool.pop() // return last object in pool
  }

  release(object: T) {
    this.pool.push(this.reset(object))
  }

  private allocate(size: number) {
    for (let i = 0; i < size; i++) {
      this.pool.push(this.create())
    }
  }

}
