import { expect } from 'chai'
import 'mocha'

import { mat3 } from '../src/mat3'

describe('mat3', () => {
  it('transposes', () => {
    const matrix = new mat3([
      1.0, 2.0, 3.0,
      4.0, 5.0, 6.0, 
      7.0, 8.0, 9.0
    ])

    matrix.transpose()

    expect(matrix[0]).to.equal(1.0)
    expect(matrix[1]).to.equal(4.0)
    expect(matrix[2]).to.equal(7.0)

    expect(matrix[3]).to.equal(2.0)
    expect(matrix[4]).to.equal(5.0)
    expect(matrix[5]).to.equal(8.0)

    expect(matrix[6]).to.equal(3.0)
    expect(matrix[7]).to.equal(6.0)
    expect(matrix[8]).to.equal(9.0)
  })
})
