import type { Tuple3 } from '@luz/formats'
import { readValues } from './definition'
import { Epsilon } from './epsilon'
import type { Matrix3 } from './matrix3'

const { min: calculateMinimum, max: calculateMaximum, abs: calculateAbsolute, sqrt: calculateSquareRoot } = Math

const zeroValues = Object.freeze([0.0, 0.0, 0.0])
const oneValues = Object.freeze([1.0, 1.0, 1.0])
const greyValues = Object.freeze([0.8, 0.8, 0.8])
const rightValues = Object.freeze([1.0, 0.0, 0.0])
const leftValues = Object.freeze([-1.0, 0.0, 0.0])
const upValues = Object.freeze([0.0, 1.0, 0.0])
const downValues = Object.freeze([0.0, -1.0, 0.0])
const forwardValues = Object.freeze([0.0, 0.0, 1.0])
const backwardValues = Object.freeze([0.0, 0.0, -1.0])
const infinityValues = Object.freeze([Infinity, Infinity, Infinity])

export class Vector3 extends Float32Array {
  static get [Symbol.species](): Float32ArrayConstructor {
    return Float32Array
  }

  static from(
    values: ArrayLike<number> | Iterable<number>,
    mapValue?: (value: number, index: number) => number,
    thisArgument?: unknown
  ): Vector3
  static from<T>(
    values: ArrayLike<T> | Iterable<T>,
    mapValue: (value: T, index: number) => number,
    thisArgument?: unknown
  ): Vector3
  static from<T>(
    values: ArrayLike<T> | Iterable<T>,
    mapValue?: (value: T, index: number) => number,
    thisArgument?: unknown
  ): Vector3 {
    const components = mapValue
      ? Array.from(values, (value, index) => mapValue.call(thisArgument, value, index))
      : Array.from(values as ArrayLike<number> | Iterable<number>)

    return new Vector3(components)
  }

  static of(...values: number[]): Vector3 {
    return new Vector3(values)
  }

  static createZero(destination = new Vector3()): Vector3 {
    destination.set(zeroValues)

    return destination
  }

  static createOne(destination = new Vector3()): Vector3 {
    destination.set(oneValues)

    return destination
  }

  static createGrey(destination = new Vector3()): Vector3 {
    destination.set(greyValues)

    return destination
  }

  static createRight(destination = new Vector3()): Vector3 {
    destination.set(rightValues)

    return destination
  }

  static createLeft(destination = new Vector3()): Vector3 {
    destination.set(leftValues)

    return destination
  }

  static createUp(destination = new Vector3()): Vector3 {
    destination.set(upValues)

    return destination
  }

  static createDown(destination = new Vector3()): Vector3 {
    destination.set(downValues)

    return destination
  }

  static createForward(destination = new Vector3()): Vector3 {
    destination.set(forwardValues)

    return destination
  }

  static createBackward(destination = new Vector3()): Vector3 {
    destination.set(backwardValues)

    return destination
  }

  static createAxes(destination: Vector3[] = []): Vector3[] {
    destination[0] = Vector3.createRight(destination[0])
    destination[1] = Vector3.createUp(destination[1])
    destination[2] = Vector3.createForward(destination[2])
    destination.length = 3

    return destination
  }

  static createInfinity(destination = new Vector3()): Vector3 {
    destination.set(infinityValues)

    return destination
  }

  constructor(values: ArrayLike<number> = [0.0, 0.0, 0.0]) {
    if (values.length !== 3) {
      throw new RangeError('Vector3 requires exactly 3 components')
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

  get z(): number {
    return this[2]
  }

  set z(z: number) {
    this[2] = z
  }

  get xyz(): number[] {
    return Array.from(this)
  }

  set xyz(xyz: number[]) {
    this.set(xyz)
  }

  get rgb(): number[] {
    return Array.from(this)
  }

  set rgb(rgb: number[]) {
    this.set(rgb)
  }

  get magnitude(): number {
    return calculateSquareRoot(this.squaredMagnitude)
  }

  get squaredMagnitude(): number {
    const { x, y, z } = this

    return x * x + y * y + z * z
  }

  reset(): Vector3 {
    this.x = 0.0
    this.y = 0.0
    this.z = 0.0

    return this
  }

  clone(): Vector3 {
    return new Vector3(this)
  }

  copyTo(destination: Vector3): Vector3 {
    destination.set(this)

    return destination
  }

  copyFrom(source: Vector3): this {
    this.set(source)

    return this
  }

  negate(destination?: Vector3): Vector3 {
    if (!destination) {
      destination = this
    }

    destination.x = -this.x
    destination.y = -this.y
    destination.z = -this.z

    return destination
  }

  equals(vector: Vector3, threshold = Epsilon): boolean {
    if (calculateAbsolute(this.x - vector.x) > threshold) {
      return false
    }

    if (calculateAbsolute(this.y - vector.y) > threshold) {
      return false
    }

    if (calculateAbsolute(this.z - vector.z) > threshold) {
      return false
    }

    return true
  }

  add(vector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x + vector.x
    destination.y = this.y + vector.y
    destination.z = this.z + vector.z

    return destination
  }

  subtract(vector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x - vector.x
    destination.y = this.y - vector.y
    destination.z = this.z - vector.z

    return destination
  }

  multiply(vector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x * vector.x
    destination.y = this.y * vector.y
    destination.z = this.z * vector.z

    return destination
  }

  divide(vector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x / vector.x
    destination.y = this.y / vector.y
    destination.z = this.z / vector.z

    return destination
  }

  scale(scalar: number, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x * scalar
    destination.y = this.y * scalar
    destination.z = this.z * scalar

    return destination
  }

  normalize(destination?: Vector3): Vector3 {
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
      destination.z = 0

      return destination
    }

    magnitude = 1.0 / magnitude
    destination.x = this.x * magnitude
    destination.y = this.y * magnitude
    destination.z = this.z * magnitude

    return destination
  }

  reflect(normal: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = this
    }

    const { x, y, z } = this
    const reflectionScale = 2 * Vector3.calculateDotProduct(this, normal)

    destination.x = x - reflectionScale * normal.x
    destination.y = y - reflectionScale * normal.y
    destination.z = z - reflectionScale * normal.z

    return destination
  }

  transform(matrix: Matrix3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = this
    }

    return matrix.transform(this, destination)
  }

  serialize(): Tuple3 {
    const { x, y, z } = this

    return [x, y, z]
  }

  static async deserialize(value: unknown): Promise<Vector3> {
    return new Vector3(readValues(value, 3, 'Vector3'))
  }

  static calculateAbsolute(vector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    destination.x = calculateAbsolute(vector.x)
    destination.y = calculateAbsolute(vector.y)
    destination.z = calculateAbsolute(vector.z)

    return destination
  }

  static calculateMinimum(firstVector: Vector3, secondVector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    destination.x = calculateMinimum(firstVector.x, secondVector.x)
    destination.y = calculateMinimum(firstVector.y, secondVector.y)
    destination.z = calculateMinimum(firstVector.z, secondVector.z)

    return destination
  }

  static calculateMaximum(firstVector: Vector3, secondVector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    destination.x = calculateMaximum(firstVector.x, secondVector.x)
    destination.y = calculateMaximum(firstVector.y, secondVector.y)
    destination.z = calculateMaximum(firstVector.z, secondVector.z)

    return destination
  }

  static calculateCrossProduct(firstVector: Vector3, secondVector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    const x = firstVector.x
    const y = firstVector.y
    const z = firstVector.z

    const secondX = secondVector.x
    const secondY = secondVector.y
    const secondZ = secondVector.z

    destination.x = y * secondZ - z * secondY
    destination.y = z * secondX - x * secondZ
    destination.z = x * secondY - y * secondX

    return destination
  }

  static calculateDotProduct(firstVector: Vector3, secondVector: Vector3): number {
    const x = firstVector.x
    const y = firstVector.y
    const z = firstVector.z

    const secondX = secondVector.x
    const secondY = secondVector.y
    const secondZ = secondVector.z

    return x * secondX + y * secondY + z * secondZ
  }

  static calculateDistance(firstVector: Vector3, secondVector: Vector3): number {
    return calculateSquareRoot(this.calculateSquaredDistance(firstVector, secondVector))
  }

  static calculateSquaredDistance(firstVector: Vector3, secondVector: Vector3): number {
    const x = secondVector.x - firstVector.x
    const y = secondVector.y - firstVector.y
    const z = secondVector.z - firstVector.z

    return x * x + y * y + z * z
  }

  static calculateDirection(firstVector: Vector3, secondVector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    const x = firstVector.x - secondVector.x
    const y = firstVector.y - secondVector.y
    const z = firstVector.z - secondVector.z

    let magnitude = calculateSquareRoot(x * x + y * y + z * z)

    if (magnitude === 0) {
      destination.x = 0
      destination.y = 0
      destination.z = 0

      return destination
    }

    magnitude = 1 / magnitude
    destination.x = x * magnitude
    destination.y = y * magnitude
    destination.z = z * magnitude

    return destination
  }

  interpolateLinear(secondVector: Vector3, fraction: number, destination: Vector3 = this): Vector3 {
    return Vector3.interpolateLinear(this, secondVector, fraction, destination)
  }

  interpolateClamped(secondVector: Vector3, fraction: number, destination: Vector3 = this): Vector3 {
    return Vector3.interpolateClamped(this, secondVector, fraction, destination)
  }

  static interpolateClamped(
    firstVector: Vector3,
    secondVector: Vector3,
    fraction: number,
    destination: Vector3 = new Vector3()
  ): Vector3 {
    return Vector3.interpolateLinear(firstVector, secondVector, Math.max(0, Math.min(1, fraction)), destination)
  }

  static interpolateLinear(
    firstVector: Vector3,
    secondVector: Vector3,
    fraction: number,
    destination?: Vector3
  ): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    destination.x = firstVector.x + fraction * (secondVector.x - firstVector.x)
    destination.y = firstVector.y + fraction * (secondVector.y - firstVector.y)
    destination.z = firstVector.z + fraction * (secondVector.z - firstVector.z)

    return destination
  }

  static add(firstVector: Vector3, secondVector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    destination.x = firstVector.x + secondVector.x
    destination.y = firstVector.y + secondVector.y
    destination.z = firstVector.z + secondVector.z

    return destination
  }

  static subtract(firstVector: Vector3, secondVector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    destination.x = firstVector.x - secondVector.x
    destination.y = firstVector.y - secondVector.y
    destination.z = firstVector.z - secondVector.z

    return destination
  }

  static multiply(firstVector: Vector3, secondVector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    destination.x = firstVector.x * secondVector.x
    destination.y = firstVector.y * secondVector.y
    destination.z = firstVector.z * secondVector.z

    return destination
  }

  static divide(firstVector: Vector3, secondVector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    destination.x = firstVector.x / secondVector.x
    destination.y = firstVector.y / secondVector.y
    destination.z = firstVector.z / secondVector.z

    return destination
  }

  static scale(vector: Vector3, scalar: number, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    return vector.scale(scalar, destination)
  }

  static normalize(vector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    return vector.normalize(destination)
  }

  static calculateSum(...vectors: Vector3[]): Vector3 {
    const destination = new Vector3()

    for (const vector of vectors) {
      destination.x += vector.x
      destination.y += vector.y
      destination.z += vector.z
    }

    return destination
  }

  static calculateDifference(...vectors: Vector3[]): Vector3 {
    const destination = new Vector3()

    for (const vector of vectors) {
      destination.x -= vector.x
      destination.y -= vector.y
      destination.z -= vector.z
    }

    return destination
  }

  static calculateProduct(...vectors: Vector3[]): Vector3 {
    const destination = new Vector3()

    for (const vector of vectors) {
      destination.x *= vector.x
      destination.y *= vector.y
      destination.z *= vector.z
    }

    return destination
  }

  static calculateDivision(...vectors: Vector3[]): Vector3 {
    const destination = new Vector3()

    for (const vector of vectors) {
      destination.x /= vector.x
      destination.y /= vector.y
      destination.z /= vector.z
    }

    return destination
  }
}
