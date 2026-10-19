import { readValues } from './definition'
import { hasUsableDeterminant } from './inversion'
import { Epsilon } from './epsilon'
import { Vector2 } from './vector2'

export class Matrix2 extends Float32Array {
  constructor(values: ArrayLike<number> = [1.0, 0.0, 0.0, 1.0]) {
    if (values.length !== 4) {
      throw new RangeError('Matrix2 requires exactly 4 components')
    }

    super(values)
  }

  static get [Symbol.species](): Float32ArrayConstructor {
    return Float32Array
  }

  static from(
    values: ArrayLike<number> | Iterable<number>,
    mapValue?: (value: number, index: number) => number,
    thisArgument?: unknown
  ): Matrix2
  static from<T>(
    values: ArrayLike<T> | Iterable<T>,
    mapValue: (value: T, index: number) => number,
    thisArgument?: unknown
  ): Matrix2
  static from<T>(
    values: ArrayLike<T> | Iterable<T>,
    mapValue?: (value: T, index: number) => number,
    thisArgument?: unknown
  ): Matrix2 {
    const components = mapValue
      ? Array.from(values, (value, index) => mapValue.call(thisArgument, value, index))
      : Array.from(values as ArrayLike<number> | Iterable<number>)

    return new Matrix2(components)
  }

  static of(...values: number[]): Matrix2 {
    return new Matrix2(values)
  }

  static createIdentity(destination = new Matrix2()): Matrix2 {
    return destination.reset()
  }

  get determinant(): number {
    return this[0] * this[3] - this[2] * this[1]
  }

  clone(): Matrix2 {
    return new Matrix2(this)
  }

  copyTo(destination: Matrix2): Matrix2 {
    destination.set(this)

    return destination
  }

  copyFrom(source: Matrix2): this {
    this.set(source)

    return this
  }

  getRow(index: number, destination = new Vector2()): Vector2 {
    if (!Number.isInteger(index) || index < 0 || index >= 2) {
      throw new RangeError('Matrix2 row index must be between 0 and 1')
    }

    destination.x = this[index + 0]
    destination.y = this[index + 2]

    return destination
  }

  getColumn(index: number, destination = new Vector2()): Vector2 {
    if (!Number.isInteger(index) || index < 0 || index >= 2) {
      throw new RangeError('Matrix2 column index must be between 0 and 1')
    }

    destination.x = this[index * 2 + 0]
    destination.y = this[index * 2 + 1]

    return destination
  }

  equals(otherMatrix: Matrix2, threshold = Epsilon): boolean {
    for (let index = 0; index < 4; index++) {
      if (Math.abs(this[index] - otherMatrix[index]) > threshold) {
        return false
      }
    }

    return true
  }

  reset(): Matrix2 {
    this[0] = 1.0
    this[1] = 0.0
    this[2] = 0.0
    this[3] = 1.0

    return this
  }

  transpose(destination?: Matrix2): Matrix2 {
    if (!destination) {
      destination = this
    }

    const element01 = this[1]

    destination[1] = destination[2]
    destination[2] = element01

    return destination
  }

  invert(destination: Matrix2 = this): Matrix2 {
    if (!this.tryInvert(destination)) {
      throw new RangeError('Matrix has no finite, numerically stable inverse')
    }

    return destination
  }

  tryInvert(destination: Matrix2 = this): boolean {
    let determinant = this.determinant

    if (!hasUsableDeterminant(this, 2, determinant)) {
      return false
    }

    determinant = 1.0 / determinant

    const element00 = this[0]
    const element01 = this[1]
    const element10 = this[2]
    const element11 = this[3]

    const inverse0 = Math.fround(determinant * element11)
    const inverse1 = Math.fround(determinant * -element01)
    const inverse2 = Math.fround(determinant * -element10)
    const inverse3 = Math.fround(determinant * element00)

    if (
      !Number.isFinite(inverse0) ||
      !Number.isFinite(inverse1) ||
      !Number.isFinite(inverse2) ||
      !Number.isFinite(inverse3)
    ) {
      return false
    }

    destination[0] = inverse0
    destination[1] = inverse1
    destination[2] = inverse2
    destination[3] = inverse3

    return true
  }

  multiply(otherMatrix: Matrix2, destination?: Matrix2): Matrix2 {
    if (!destination) {
      destination = this
    }

    const firstMatrix00 = this[0]
    const firstMatrix01 = this[1]
    const firstMatrix10 = this[2]
    const firstMatrix11 = this[3]

    const secondMatrix00 = otherMatrix[0]
    const secondMatrix01 = otherMatrix[1]
    const secondMatrix10 = otherMatrix[2]
    const secondMatrix11 = otherMatrix[3]

    destination[0] = firstMatrix00 * secondMatrix00 + firstMatrix01 * secondMatrix10
    destination[1] = firstMatrix00 * secondMatrix01 + firstMatrix01 * secondMatrix11
    destination[2] = firstMatrix10 * secondMatrix00 + firstMatrix11 * secondMatrix10
    destination[3] = firstMatrix10 * secondMatrix01 + firstMatrix11 * secondMatrix11

    return destination
  }

  transform(vector: Vector2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = new Vector2()
    }

    const x = vector.x
    const y = vector.y

    destination.x = x * this[0] + y * this[1]
    destination.y = x * this[2] + y * this[3]

    return destination
  }

  scale(vector: Vector2, destination?: Matrix2): Matrix2 {
    if (!destination) {
      destination = this
    }

    const element00 = this[0]
    const element01 = this[1]
    const element10 = this[2]
    const element11 = this[3]

    const x = vector.x
    const y = vector.y

    destination[0] = element00 * x
    destination[1] = element01 * y
    destination[2] = element10 * x
    destination[3] = element11 * y

    return destination
  }

  // Angle in radians.
  rotate(angle: number, destination?: Matrix2): Matrix2 {
    if (!destination) {
      destination = this
    }

    const element00 = this[0]
    const element01 = this[1]
    const element10 = this[2]
    const element11 = this[3]

    const sine = Math.sin(angle)
    const cosine = Math.cos(angle)

    destination[0] = element00 * cosine + element01 * sine
    destination[1] = element00 * -sine + element01 * cosine
    destination[2] = element10 * cosine + element11 * sine
    destination[3] = element10 * -sine + element11 * cosine

    return destination
  }

  serialize(): number[] {
    return Array.from(this)
  }

  static async deserialize(value: unknown): Promise<Matrix2> {
    return new Matrix2(readValues(value, 4, 'Matrix2'))
  }

  static multiply(firstMatrix: Matrix2, secondMatrix: Matrix2, destination?: Matrix2): Matrix2 {
    if (!destination) {
      destination = new Matrix2()
    }

    const firstMatrix00 = firstMatrix[0]
    const firstMatrix01 = firstMatrix[1]
    const firstMatrix10 = firstMatrix[2]
    const firstMatrix11 = firstMatrix[3]

    const secondMatrix00 = secondMatrix[0]
    const secondMatrix01 = secondMatrix[1]
    const secondMatrix10 = secondMatrix[2]
    const secondMatrix11 = secondMatrix[3]

    destination[0] = firstMatrix00 * secondMatrix00 + firstMatrix01 * secondMatrix10
    destination[1] = firstMatrix00 * secondMatrix01 + firstMatrix01 * secondMatrix11
    destination[2] = firstMatrix10 * secondMatrix00 + firstMatrix11 * secondMatrix10
    destination[3] = firstMatrix10 * secondMatrix01 + firstMatrix11 * secondMatrix11

    return destination
  }
}
