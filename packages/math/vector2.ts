import type { Tuple2 } from '@luz/formats'
import { readValues } from './definition'
import { Epsilon } from './epsilon'
import type { Matrix2 } from './matrix2'

const { min: calculateMinimum, max: calculateMaximum, abs: calculateAbsolute, sqrt: calculateSquareRoot } = Math

const zeroValues = Object.freeze([0.0, 0.0])
const oneValues = Object.freeze([1.0, 1.0])
const rightValues = Object.freeze([1.0, 0.0])
const upValues = Object.freeze([0.0, 1.0])
const infinityValues = Object.freeze([Infinity, Infinity])

export class Vector2 extends Float32Array {
  static get [Symbol.species](): Float32ArrayConstructor {
    return Float32Array
  }

  static from(
    values: ArrayLike<number> | Iterable<number>,
    mapValue?: (value: number, index: number) => number,
    thisArgument?: unknown
  ): Vector2
  static from<T>(
    values: ArrayLike<T> | Iterable<T>,
    mapValue: (value: T, index: number) => number,
    thisArgument?: unknown
  ): Vector2
  static from<T>(
    values: ArrayLike<T> | Iterable<T>,
    mapValue?: (value: T, index: number) => number,
    thisArgument?: unknown
  ): Vector2 {
    const components = mapValue
      ? Array.from(values, (value, index) => mapValue.call(thisArgument, value, index))
      : Array.from(values as ArrayLike<number> | Iterable<number>)

    return new Vector2(components)
  }

  static of(...values: number[]): Vector2 {
    return new Vector2(values)
  }

  static createZero(destination = new Vector2()): Vector2 {
    destination.set(zeroValues)

    return destination
  }

  static createOne(destination = new Vector2()): Vector2 {
    destination.set(oneValues)

    return destination
  }

  static createRight(destination = new Vector2()): Vector2 {
    destination.set(rightValues)

    return destination
  }

  static createUp(destination = new Vector2()): Vector2 {
    destination.set(upValues)

    return destination
  }

  static createAxes(destination: Vector2[] = []): Vector2[] {
    destination[0] = Vector2.createRight(destination[0])
    destination[1] = Vector2.createUp(destination[1])
    destination.length = 2

    return destination
  }

  static createInfinity(destination = new Vector2()): Vector2 {
    destination.set(infinityValues)

    return destination
  }

  constructor(values: ArrayLike<number> = [0.0, 0.0]) {
    if (values.length !== 2) {
      throw new RangeError('Vector2 requires exactly 2 components')
    }

    super(values)
  }

  get x(): number {
    return this[0]
  }

  set x(x: number) {
    this[0] = x
  }

  get y(): number {
    return this[1]
  }

  set y(y: number) {
    this[1] = y
  }

  get xy(): number[] {
    return Array.from(this)
  }

  set xy(xy: number[]) {
    this.set(xy)
  }

  get magnitude(): number {
    return calculateSquareRoot(this.squaredMagnitude)
  }

  get squaredMagnitude(): number {
    const { x, y } = this

    return x * x + y * y
  }

  reset(): Vector2 {
    this.x = 0.0
    this.y = 0.0

    return this
  }

  clone(): Vector2 {
    return new Vector2(this)
  }

  copyTo(destination: Vector2): Vector2 {
    destination.set(this)

    return destination
  }

  copyFrom(source: Vector2): this {
    this.set(source)

    return this
  }

  negate(destination?: Vector2): Vector2 {
    if (!destination) {
      destination = this
    }

    destination.x = -this.x
    destination.y = -this.y

    return destination
  }

  equals(vector: Vector2, threshold = Epsilon): boolean {
    if (calculateAbsolute(this.x - vector.x) > threshold) {
      return false
    }

    if (calculateAbsolute(this.y - vector.y) > threshold) {
      return false
    }

    return true
  }

  add(vector: Vector2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x + vector.x
    destination.y = this.y + vector.y

    return destination
  }

  subtract(vector: Vector2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x - vector.x
    destination.y = this.y - vector.y

    return destination
  }

  multiply(vector: Vector2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x * vector.x
    destination.y = this.y * vector.y

    return destination
  }

  divide(vector: Vector2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x / vector.x
    destination.y = this.y / vector.y

    return destination
  }

  scale(scalar: number, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x * scalar
    destination.y = this.y * scalar

    return destination
  }

  normalize(destination?: Vector2): Vector2 {
    if (!destination) {
      destination = this
    }

    let magnitude = this.magnitude

    if (magnitude === 1) {
      return this.copyTo(destination)
    }

    if (magnitude === 0) {
      destination.x = 0
      destination.y = 0

      return destination
    }

    magnitude = 1.0 / magnitude
    destination.x = this.x * magnitude
    destination.y = this.y * magnitude

    return destination
  }

  transform(matrix: Matrix2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = this
    }

    return matrix.transform(this, destination)
  }

  serialize(): Tuple2 {
    const { x, y } = this

    return [x, y]
  }

  static async deserialize(value: unknown): Promise<Vector2> {
    return new Vector2(readValues(value, 2, 'Vector2'))
  }

  static calculateAbsolute(vector: Vector2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = new Vector2()
    }

    destination.x = calculateAbsolute(vector.x)
    destination.y = calculateAbsolute(vector.y)

    return destination
  }

  static calculateMinimum(firstVector: Vector2, secondVector: Vector2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = new Vector2()
    }

    destination.x = calculateMinimum(firstVector.x, secondVector.x)
    destination.y = calculateMinimum(firstVector.y, secondVector.y)

    return destination
  }

  static calculateMaximum(firstVector: Vector2, secondVector: Vector2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = new Vector2()
    }

    destination.x = calculateMaximum(firstVector.x, secondVector.x)
    destination.y = calculateMaximum(firstVector.y, secondVector.y)

    return destination
  }

  static calculateCrossProduct(firstVector: Vector2, secondVector: Vector2): number {
    return firstVector.x * secondVector.y - firstVector.y * secondVector.x
  }

  static calculateDotProduct(firstVector: Vector2, secondVector: Vector2): number {
    return firstVector.x * secondVector.x + firstVector.y * secondVector.y
  }

  static calculateDistance(firstVector: Vector2, secondVector: Vector2): number {
    return calculateSquareRoot(this.calculateSquaredDistance(firstVector, secondVector))
  }

  static calculateSquaredDistance(firstVector: Vector2, secondVector: Vector2): number {
    const x = secondVector.x - firstVector.x
    const y = secondVector.y - firstVector.y

    return x * x + y * y
  }

  static calculateDirection(firstVector: Vector2, secondVector: Vector2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = new Vector2()
    }

    const x = firstVector.x - secondVector.x
    const y = firstVector.y - secondVector.y

    let magnitude = calculateSquareRoot(x * x + y * y)

    if (magnitude === 0) {
      destination.x = 0
      destination.y = 0

      return destination
    }

    magnitude = 1 / magnitude
    destination.x = x * magnitude
    destination.y = y * magnitude

    return destination
  }

  interpolateLinear(secondVector: Vector2, fraction: number, destination: Vector2 = this): Vector2 {
    return Vector2.interpolateLinear(this, secondVector, fraction, destination)
  }

  interpolateClamped(secondVector: Vector2, fraction: number, destination: Vector2 = this): Vector2 {
    return Vector2.interpolateClamped(this, secondVector, fraction, destination)
  }

  static interpolateClamped(
    firstVector: Vector2,
    secondVector: Vector2,
    fraction: number,
    destination: Vector2 = new Vector2()
  ): Vector2 {
    return Vector2.interpolateLinear(firstVector, secondVector, Math.max(0, Math.min(1, fraction)), destination)
  }

  static interpolateLinear(
    firstVector: Vector2,
    secondVector: Vector2,
    fraction: number,
    destination?: Vector2
  ): Vector2 {
    if (!destination) {
      destination = new Vector2()
    }

    const x = firstVector.x
    const y = firstVector.y

    const doubledX = secondVector.x
    const doubledY = secondVector.y

    destination.x = x + fraction * (doubledX - x)
    destination.y = y + fraction * (doubledY - y)

    return destination
  }

  static add(firstVector: Vector2, secondVector: Vector2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = new Vector2()
    }

    destination.x = firstVector.x + secondVector.x
    destination.y = firstVector.y + secondVector.y

    return destination
  }

  static subtract(firstVector: Vector2, secondVector: Vector2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = new Vector2()
    }

    destination.x = firstVector.x - secondVector.x
    destination.y = firstVector.y - secondVector.y

    return destination
  }

  static multiply(firstVector: Vector2, secondVector: Vector2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = new Vector2()
    }

    destination.x = firstVector.x * secondVector.x
    destination.y = firstVector.y * secondVector.y

    return destination
  }

  static divide(firstVector: Vector2, secondVector: Vector2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = new Vector2()
    }

    destination.x = firstVector.x / secondVector.x
    destination.y = firstVector.y / secondVector.y

    return destination
  }

  static scale(vector: Vector2, scalar: number, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = new Vector2()
    }

    return vector.scale(scalar, destination)
  }

  static normalize(vector: Vector2, destination?: Vector2): Vector2 {
    if (!destination) {
      destination = new Vector2()
    }

    return vector.normalize(destination)
  }

  static calculateSum(...vectors: Vector2[]): Vector2 {
    const destination = new Vector2()

    for (const vector of vectors) {
      destination.x += vector.x
      destination.y += vector.y
    }

    return destination
  }

  static calculateDifference(...vectors: Vector2[]): Vector2 {
    const destination = new Vector2()

    for (const vector of vectors) {
      destination.x -= vector.x
      destination.y -= vector.y
    }

    return destination
  }

  static calculateProduct(...vectors: Vector2[]): Vector2 {
    const destination = new Vector2()

    for (const vector of vectors) {
      destination.x *= vector.x
      destination.y *= vector.y
    }

    return destination
  }

  static calculateDivision(...vectors: Vector2[]): Vector2 {
    const destination = new Vector2()

    for (const vector of vectors) {
      destination.x /= vector.x
      destination.y /= vector.y
    }

    return destination
  }
}
