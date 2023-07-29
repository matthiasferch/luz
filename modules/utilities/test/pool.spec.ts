import { expect } from 'chai'
import 'mocha'

import { Pool } from '../src/pool'

import { vec3 } from '../../vectors/src/vec3'

const initialSize = 20
const batchSize = 10

describe('pool', () => {
  let pool: Pool<vec3>

  beforeEach(() => {
    pool = new Pool<vec3>(
      () => new vec3(),
      (vector) => vector.reset(),
      initialSize,
      batchSize
    )
  })

  it('allocates', () => {
    expect(pool.length).to.equal(initialSize)
  })

  it('acquires', () => {
    const vector = pool.acquire()

    vector.xyz = [1, 2, 3]

    expect(pool.length).to.equal(initialSize - 1)
    expect(vector.xyz).to.deep.equal([1, 2, 3])
  })

  it('releases', () => {
    const vector = pool.acquire()

    pool.release(vector)

    expect(pool.length).to.equal(initialSize)
    expect(vector.xyz).to.deep.equal([0, 0, 0])
  })

  it('increases', () => {
    const vectors: vec3[] = []

    for (let i = 0; i < initialSize; i++) {
      vectors.push(pool.acquire())
    }

    expect(pool.length).to.be.greaterThan(initialSize);
  })
})
