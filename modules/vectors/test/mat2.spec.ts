import { expect } from 'chai'
import 'mocha'

import { mat2 } from '../src/mat2'

describe('mat2', () => {
  it('transposes', () => {
    const matrix = new mat2([
      1.0, 2.0,
      3.0, 4.0
    ])

    matrix.transpose()

    expect(matrix[0]).to.equal(1.0)
    expect(matrix[1]).to.equal(3.0)
    expect(matrix[2]).to.equal(2.0)
    expect(matrix[3]).to.equal(4.0)
  })

  it('inverts', () => {
    const matrix = new mat2([
      1.0, 2.0,
      3.0, 4.0
    ])

    matrix.invert()

    expect(matrix[0]).to.equal(-2.0)
    expect(matrix[1]).to.equal(1.0)
    expect(matrix[2]).to.equal(1.5)
    expect(matrix[3]).to.equal(-0.5)
  })
})
