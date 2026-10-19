import type { Tuple4 } from '@luz/formats'
import { readValues } from './definition'
import { Epsilon } from './epsilon'
import type { Matrix4 } from './matrix4'

const { min: calculateMinimum, max: calculateMaximum, abs: calculateAbsolute, sqrt: calculateSquareRoot } = Math

const zeroValues = Object.freeze([0.0, 0.0, 0.0, 1.0])
const oneValues = Object.freeze([1.0, 1.0, 1.0, 1.0])

export class Vector4 extends Float32Array {
  static get [Symbol.species](): Float32ArrayConstructor {
    return Float32Array
  }

  static from(
    values: ArrayLike<number> | Iterable<number>,
    mapValue?: (value: number, index: number) => number,
    thisArgument?: unknown
  ): Vector4
  static from<T>(
    values: ArrayLike<T> | Iterable<T>,
    mapValue: (value: T, index: number) => number,
    thisArgument?: unknown
  ): Vector4
  static from<T>(
    values: ArrayLike<T> | Iterable<T>,
    mapValue?: (value: T, index: number) => number,
    thisArgument?: unknown
  ): Vector4 {
    const components = mapValue
      ? Array.from(values, (value, index) => mapValue.call(thisArgument, value, index))
      : Array.from(values as ArrayLike<number> | Iterable<number>)

    return new Vector4(components)
  }

  static of(...values: number[]): Vector4 {
    return new Vector4(values)
  }

  static createZero(destination = new Vector4()): Vector4 {
    destination.set(zeroValues)

    return destination
  }

  static createOne(destination = new Vector4()): Vector4 {
    destination.set(oneValues)

    return destination
  }

  constructor(values: ArrayLike<number> = [0.0, 0.0, 0.0, 1.0]) {
    if (values.length !== 4) {
      throw new RangeError('Vector4 requires exactly 4 components')
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

  get w(): number {
    return this[3]
  }

  set w(w: number) {
    this[3] = w
  }

  get r(): number {
    return this[0]
  }

  set r(r: number) {
    this[0] = r
  }

  get g(): number {
    return this[1]
  }

  set g(g: number) {
    this[1] = g
  }

  get b(): number {
    return this[2]
  }

  set b(b: number) {
    this[2] = b
  }

  get a(): number {
    return this[3]
  }

  set a(a: number) {
    this[3] = a
  }

  get xyzw(): number[] {
    return Array.from(this)
  }

  set xyzw(xyzw: number[]) {
    this.set(xyzw)
  }

  get rgba(): number[] {
    return Array.from(this)
  }

  set rgba(rgba: number[]) {
    this.set(rgba)
  }

  get magnitude(): number {
    return calculateSquareRoot(this.squaredMagnitude)
  }

  get squaredMagnitude(): number {
    const { x, y, z, w } = this

    return x * x + y * y + z * z + w * w
  }

  reset(): Vector4 {
    this.x = 0.0
    this.y = 0.0
    this.z = 0.0
    this.w = 1.0

    return this
  }

  clone(): Vector4 {
    return new Vector4(this)
  }

  copyTo(destination: Vector4): Vector4 {
    destination.set(this)

    return destination
  }

  copyFrom(source: Vector4): this {
    this.set(source)

    return this
  }

  negate(destination?: Vector4): Vector4 {
    if (!destination) {
      destination = this
    }

    destination.x = -this.x
    destination.y = -this.y
    destination.z = -this.z
    destination.w = -this.w

    return destination
  }

  equals(vector: Vector4, threshold = Epsilon): boolean {
    if (calculateAbsolute(this.x - vector.x) > threshold) {
      return false
    }

    if (calculateAbsolute(this.y - vector.y) > threshold) {
      return false
    }

    if (calculateAbsolute(this.z - vector.z) > threshold) {
      return false
    }

    if (calculateAbsolute(this.w - vector.w) > threshold) {
      return false
    }

    return true
  }

  add(vector: Vector4, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x + vector.x
    destination.y = this.y + vector.y
    destination.z = this.z + vector.z
    destination.w = this.w + vector.w

    return destination
  }

  subtract(vector: Vector4, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x - vector.x
    destination.y = this.y - vector.y
    destination.z = this.z - vector.z
    destination.w = this.w - vector.w

    return destination
  }

  multiply(vector: Vector4, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x * vector.x
    destination.y = this.y * vector.y
    destination.z = this.z * vector.z
    destination.w = this.w * vector.w

    return destination
  }

  divide(vector: Vector4, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x / vector.x
    destination.y = this.y / vector.y
    destination.z = this.z / vector.z
    destination.w = this.w / vector.w

    return destination
  }

  scale(scalar: number, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = this
    }

    destination.x = this.x * scalar
    destination.y = this.y * scalar
    destination.z = this.z * scalar
    destination.w = this.w * scalar

    return destination
  }

  normalize(destination?: Vector4): Vector4 {
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
      destination.w = 0

      return destination
    }

    magnitude = 1.0 / magnitude
    destination.x = this.x * magnitude
    destination.y = this.y * magnitude
    destination.z = this.z * magnitude
    destination.w = this.w * magnitude

    return destination
  }

  transform(matrix: Matrix4, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = this
    }

    return matrix.transform(this, destination)
  }

  serialize(): Tuple4 {
    const { x, y, z, w } = this

    return [x, y, z, w]
  }

  static async deserialize(value: unknown): Promise<Vector4> {
    return new Vector4(readValues(value, 4, 'Vector4'))
  }

  static calculateAbsolute(vector: Vector4, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = new Vector4()
    }

    destination.x = calculateAbsolute(vector.x)
    destination.y = calculateAbsolute(vector.y)
    destination.z = calculateAbsolute(vector.z)
    destination.w = calculateAbsolute(vector.w)

    return destination
  }

  static calculateMinimum(firstVector: Vector4, secondVector: Vector4, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = new Vector4()
    }

    destination.x = calculateMinimum(firstVector.x, secondVector.x)
    destination.y = calculateMinimum(firstVector.y, secondVector.y)
    destination.z = calculateMinimum(firstVector.z, secondVector.z)
    destination.z = calculateMinimum(firstVector.w, secondVector.w)

    return destination
  }

  static calculateMaximum(firstVector: Vector4, secondVector: Vector4, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = new Vector4()
    }

    destination.x = calculateMaximum(firstVector.x, secondVector.x)
    destination.y = calculateMaximum(firstVector.y, secondVector.y)
    destination.z = calculateMaximum(firstVector.z, secondVector.z)
    destination.z = calculateMaximum(firstVector.w, secondVector.w)

    return destination
  }

  interpolateLinear(secondVector: Vector4, fraction: number, destination: Vector4 = this): Vector4 {
    return Vector4.interpolateLinear(this, secondVector, fraction, destination)
  }

  interpolateClamped(secondVector: Vector4, fraction: number, destination: Vector4 = this): Vector4 {
    return Vector4.interpolateClamped(this, secondVector, fraction, destination)
  }

  static interpolateClamped(
    firstVector: Vector4,
    secondVector: Vector4,
    fraction: number,
    destination: Vector4 = new Vector4()
  ): Vector4 {
    return Vector4.interpolateLinear(firstVector, secondVector, Math.max(0, Math.min(1, fraction)), destination)
  }

  static interpolateLinear(
    firstVector: Vector4,
    secondVector: Vector4,
    fraction: number,
    destination?: Vector4
  ): Vector4 {
    if (!destination) {
      destination = new Vector4()
    }

    destination.x = firstVector.x + fraction * (secondVector.x - firstVector.x)
    destination.y = firstVector.y + fraction * (secondVector.y - firstVector.y)
    destination.z = firstVector.z + fraction * (secondVector.z - firstVector.z)
    destination.w = firstVector.w + fraction * (secondVector.w - firstVector.w)

    return destination
  }

  static add(firstVector: Vector4, secondVector: Vector4, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = new Vector4()
    }

    destination.x = firstVector.x + secondVector.x
    destination.y = firstVector.y + secondVector.y
    destination.z = firstVector.z + secondVector.z
    destination.w = firstVector.w + secondVector.w

    return destination
  }

  static subtract(firstVector: Vector4, secondVector: Vector4, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = new Vector4()
    }

    destination.x = firstVector.x - secondVector.x
    destination.y = firstVector.y - secondVector.y
    destination.z = firstVector.z - secondVector.z
    destination.w = firstVector.w - secondVector.w

    return destination
  }

  static multiply(firstVector: Vector4, secondVector: Vector4, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = new Vector4()
    }

    destination.x = firstVector.x * secondVector.x
    destination.y = firstVector.y * secondVector.y
    destination.z = firstVector.z * secondVector.z
    destination.w = firstVector.w * secondVector.w

    return destination
  }

  static divide(firstVector: Vector4, secondVector: Vector4, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = new Vector4()
    }

    destination.x = firstVector.x / secondVector.x
    destination.y = firstVector.y / secondVector.y
    destination.z = firstVector.z / secondVector.z
    destination.w = firstVector.w / secondVector.w

    return destination
  }

  static scale(vector: Vector4, scalar: number, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = new Vector4()
    }

    return vector.scale(scalar, destination)
  }

  static normalize(vector: Vector4, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = new Vector4()
    }

    return vector.normalize(destination)
  }

  static calculateSum(...vectors: Vector4[]): Vector4 {
    const destination = new Vector4()

    for (const vector of vectors) {
      destination.x += vector.x
      destination.y += vector.y
      destination.z += vector.z
      destination.w += vector.w
    }

    return destination
  }

  static calculateDifference(...vectors: Vector4[]): Vector4 {
    const destination = new Vector4()

    for (const vector of vectors) {
      destination.x -= vector.x
      destination.y -= vector.y
      destination.z -= vector.z
      destination.w -= vector.w
    }

    return destination
  }

  static calculateProduct(...vectors: Vector4[]): Vector4 {
    const destination = new Vector4()

    for (const vector of vectors) {
      destination.x *= vector.x
      destination.y *= vector.y
      destination.z *= vector.z
      destination.w *= vector.w
    }

    return destination
  }

  static calculateDivision(...vectors: Vector4[]): Vector4 {
    const destination = new Vector4()

    for (const vector of vectors) {
      destination.x /= vector.x
      destination.y /= vector.y
      destination.z /= vector.z
      destination.w /= vector.w
    }

    return destination
  }
}
