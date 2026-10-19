import { expect } from 'chai'
import { Matrix2, Matrix3, Matrix4 } from '@luz/math'

describe('Matrix rows and columns', () => {
  for (const [Matrix, dimension] of [
    [Matrix2, 2],
    [Matrix3, 3],
    [Matrix4, 4]
  ] as const) {
    it(`${Matrix.name} exposes rows and columns consistent with column-major transforms`, () => {
      const values = Array.from({ length: dimension * dimension }, (_, index) => index + 1)
      const matrix = new Matrix(values)

      for (let index = 0; index < dimension; index++) {
        expect(Array.from(matrix.getRow(index))).to.deep.equal(
          Array.from({ length: dimension }, (_, column) => values[column * dimension + index])
        )
        expect(Array.from(matrix.getColumn(index))).to.deep.equal(
          values.slice(index * dimension, (index + 1) * dimension)
        )
        expect(matrix.getRow(index)).not.to.equal(matrix.getRow(index))
      }

      expect(Array.from(matrix)).to.deep.equal(values)
    })
    it(`${Matrix.name} rejects invalid indices`, () => {
      const matrix = new Matrix()

      for (const index of [-1, dimension, 0.5, NaN, Infinity]) {
        expect(() => matrix.getRow(index)).to.throw(RangeError)
        expect(() => matrix.getColumn(index)).to.throw(RangeError)
      }
    })
  }
})
