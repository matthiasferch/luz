import { expect } from 'chai'
import 'mocha'

import { Epsilon } from '../src/constants'

import { mat4 } from '../src/mat4'

describe('mat4', () => {
  it('transposes', () => {
    const matrix = new mat4([
      1.0, 2.0, 3.0, 4.0,
      5.0, 6.0, 7.0, 8.0,
      9.0, 10.0, 11.0, 12.0,
      13.0, 14.0, 15.0, 16.0
    ])

    matrix.transpose()

    expect(matrix[0]).to.equal(1.0)
    expect(matrix[1]).to.equal(5.0)
    expect(matrix[2]).to.equal(9.0)
    expect(matrix[3]).to.equal(13.0)

    expect(matrix[4]).to.equal(2.0)
    expect(matrix[5]).to.equal(6.0)
    expect(matrix[6]).to.equal(10.0)
    expect(matrix[7]).to.equal(14.0)

    expect(matrix[8]).to.equal(3.0)
    expect(matrix[9]).to.equal(7.0)
    expect(matrix[10]).to.equal(11.0)
    expect(matrix[11]).to.equal(15.0)

    expect(matrix[12]).to.equal(4.0)
    expect(matrix[13]).to.equal(8.0)
    expect(matrix[14]).to.equal(12.0)
    expect(matrix[15]).to.equal(16.0)
  })

  it('computes perspective projection', () => {
    const matrix = mat4.perspective(45, 1, 1, 100)

    expect(matrix[0]).to.be.approximately(2.414213, Epsilon)
    expect(matrix[1]).to.equal(0.0)
    expect(matrix[2]).to.equal(0.0)
    expect(matrix[3]).to.equal(0.0)

    expect(matrix[4]).to.equal(0.0)
    expect(matrix[5]).to.be.approximately(2.414213, Epsilon)
    expect(matrix[6]).to.equal(0.0)
    expect(matrix[7]).to.equal(0.0)

    expect(matrix[8]).to.equal(0.0)
    expect(matrix[9]).to.equal(0.0)
    expect(matrix[10]).to.be.approximately(-1.0202, Epsilon)
    expect(matrix[11]).to.equal(-1.0)

    expect(matrix[12]).to.equal(0.0)
    expect(matrix[13]).to.equal(0.0)
    expect(matrix[14]).to.be.approximately(-2.0202, Epsilon)
    expect(matrix[15]).to.equal(0.0)
  })

  it('computes orthographic projection', () => {
    const matrix = mat4.orthographic(0, 800, 0, 600, 1, 100)

    expect(matrix[0]).to.be.approximately(0.002499, Epsilon)
    expect(matrix[1]).to.equal(0.0)
    expect(matrix[2]).to.equal(0.0)
    expect(matrix[3]).to.equal(0.0)

    expect(matrix[4]).to.equal(0.0)
    expect(matrix[5]).to.be.approximately(0.003333, Epsilon)
    expect(matrix[6]).to.equal(0.0)
    expect(matrix[7]).to.equal(0.0)

    expect(matrix[8]).to.equal(0.0)
    expect(matrix[9]).to.equal(0.0)
    expect(matrix[10]).to.be.approximately(-0.020202, Epsilon)
    expect(matrix[11]).to.equal(0.0)

    expect(matrix[12]).to.equal(-1.0)
    expect(matrix[13]).to.equal(-1.0)
    expect(matrix[14]).to.be.approximately(-1.020202, Epsilon)
    expect(matrix[15]).to.equal(1.0)
  })
})
