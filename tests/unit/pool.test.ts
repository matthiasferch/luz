import { expect } from 'chai'
import { rejects } from 'node:assert/strict'
import { Pool } from '@luz/serialization'

const createPool = () =>
  new Pool({
    createObject: () => ({ value: 0 }),

    resetObject: (object) => {
      object.value = 0

      return object
    },
    initialCapacity: 16
  })

describe('Pool scopes', () => {
  it('grows an initially empty pool and allocates only when exhausted', () => {
    let createdCount = 0

    const pool = new Pool({
      createObject: () => ({ id: createdCount++ }),

      resetObject: (object) => object,
      initialCapacity: 0,
      growthSize: 2
    })
    const firstObject = pool.acquire()
    const secondObject = pool.acquire()

    expect(firstObject).not.to.equal(undefined)
    expect(secondObject).not.to.equal(firstObject)
    expect(createdCount).to.equal(2)
    expect(pool.availableCount).to.equal(0)
    pool.release(firstObject)
    expect(pool.acquire()).to.equal(firstObject)
    expect(createdCount).to.equal(2)
    pool.acquire()
    expect(createdCount).to.equal(4)
    expect(pool.availableCount).to.equal(1)
  })
  it('rejects invalid capacities and keeps default empty pools usable', () => {
    const options = {
      createObject: () => ({}),

      resetObject: (object: object) => object
    }

    for (const value of [-1, 0.5, Infinity, NaN]) {
      expect(() => new Pool({ ...options, initialCapacity: value })).to.throw(RangeError)
      expect(() => new Pool({ ...options, growthSize: value })).to.throw(RangeError)
    }

    expect(() => new Pool({ ...options, growthSize: 0 })).to.throw(RangeError)
    expect(new Pool(options).acquire()).to.be.an('object')
  })

  for (const doesCallbackFail of [false, true]) {
    it(`rejects asynchronous callbacks and retains their leases until ${doesCallbackFail ? 'rejection' : 'completion'}`, async () => {
      const pool = createPool()

      let finishWaiting!: () => void
      let borrowedObject: { value: number } | undefined
      let observedValue: number | undefined
      let scopeResult: Promise<void> | undefined

      const waiting = new Promise<void>((resolve) => {
        finishWaiting = resolve
      })
      const runAsyncScope = async () => {
        borrowedObject = pool.acquire()
        borrowedObject.value = 7

        await waiting

        observedValue = borrowedObject.value

        if (doesCallbackFail) {
          throw new Error('Async callback failed')
        }
      }

      expect(() => {
        // @ts-expect-error Pool scopes reject callbacks returning promises.
        void pool.runInScope(() => (scopeResult = runAsyncScope()))
      }).to.throw(TypeError, 'must be synchronous')

      const otherObject = pool.acquire()

      otherObject.value = 99

      expect(otherObject).not.to.equal(borrowedObject)
      expect(borrowedObject!.value).to.equal(7)
      finishWaiting()

      if (doesCallbackFail) {
        await rejects(scopeResult!, /Async callback failed/)
      } else {
        await scopeResult
      }

      expect(observedValue).to.equal(7)
      expect(borrowedObject!.value).to.equal(0)
      expect(otherObject.value).to.equal(99)
      pool.release(otherObject)
      expect(pool.availableCount).to.equal(16)
    })
  }

  it('rejects thenables returned by untyped callers', async () => {
    const pool = createPool()
    const completion = Promise.resolve()
    const thenable = { then: completion.then.bind(completion) }

    expect(() => {
      // @ts-expect-error Promise-like callbacks are also forbidden.
      void pool.runInScope(() => thenable)
    }).to.throw(TypeError, 'must be synchronous')

    await completion
  })
  it('returns callback results and resets and reuses borrowed objects', () => {
    const pool = createPool()
    const objects: Array<{ value: number }> = []
    const result = pool.runInScope(() => {
      const object = pool.acquire()

      object.value = 7

      objects.push(object)

      return object.value * 2
    })

    expect(result).to.equal(14)
    expect(objects[0].value).to.equal(0)
    expect(pool.acquire()).to.equal(objects[0])
  })
  it('leaves explicitly borrowed objects alive until they are released', () => {
    const pool = createPool()
    const persistentObject = pool.acquire()

    persistentObject.value = 7

    pool.runInScope(() => {
      const temporaryObject = pool.acquire()

      expect(temporaryObject).not.to.equal(persistentObject)
    })
    expect(persistentObject.value).to.equal(7)
    pool.release(persistentObject)
    expect(persistentObject.value).to.equal(0)
    expect(pool.acquire()).to.equal(persistentObject)
  })
  it('releases an inner scope without resetting objects owned by the outer scope', () => {
    const pool = createPool()

    pool.runInScope(() => {
      const outerObject = pool.acquire()

      outerObject.value = 7

      pool.runInScope(() => {
        const innerObject = pool.acquire()

        innerObject.value = 3

        expect(innerObject).not.to.equal(outerObject)
      })

      const recycledObject = pool.acquire()

      expect(recycledObject).not.to.equal(outerObject)
      expect(recycledObject.value).to.equal(0)
      expect(outerObject.value).to.equal(7)
    })
    expect(pool.availableCount).to.equal(16)
  })
  it('releases objects and restores the outer scope after an inner callback throws', () => {
    const pool = createPool()
    const failure = new Error('Scope failed')

    expect(() =>
      pool.runInScope(() => {
        const outerObject = pool.acquire()

        outerObject.value = 7

        expect(() =>
          pool.runInScope(() => {
            pool.acquire().value = 3

            throw failure
          })
        ).to.throw(failure)
        expect(outerObject.value).to.equal(7)
        expect(pool.acquire().value).to.equal(0)

        throw failure
      })
    ).to.throw(failure)
    expect(pool.availableCount).to.equal(16)
    pool.runInScope(() => {
      expect(pool.acquire().value).to.equal(0)
    })
    expect(pool.availableCount).to.equal(16)
  })
  it('does not release objects twice after explicit release and reacquisition in a nested scope', () => {
    const pool = createPool()

    pool.runInScope(() => {
      const outerObject = pool.acquire()

      outerObject.value = 7

      pool.runInScope(() => {
        pool.release(outerObject)

        const recycledObject = pool.acquire()

        recycledObject.value = 3

        expect(recycledObject).to.equal(outerObject)
      })
      expect(pool.availableCount).to.equal(16)
    })
    expect(pool.availableCount).to.equal(16)

    const firstObject = pool.acquire()
    const secondObject = pool.acquire()

    expect(firstObject).not.to.equal(secondObject)
  })
})
