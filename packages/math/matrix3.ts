import { readValues } from './definition'
import { hasUsableDeterminant } from './inversion'
import { Epsilon } from './epsilon'
import { Matrix4 } from './matrix4'
import { Quaternion } from './quaternion'
import { Vector3 } from './vector3'

export class Matrix3 extends Float32Array {
  constructor(values: ArrayLike<number> = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]) {
    if (values.length !== 9) {
      throw new RangeError('Matrix3 requires exactly 9 components')
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
  ): Matrix3
  static from<T>(
    values: ArrayLike<T> | Iterable<T>,
    mapValue: (value: T, index: number) => number,
    thisArgument?: unknown
  ): Matrix3
  static from<T>(
    values: ArrayLike<T> | Iterable<T>,
    mapValue?: (value: T, index: number) => number,
    thisArgument?: unknown
  ): Matrix3 {
    const components = mapValue
      ? Array.from(values, (value, index) => mapValue.call(thisArgument, value, index))
      : Array.from(values as ArrayLike<number> | Iterable<number>)

    return new Matrix3(components)
  }

  static of(...values: number[]): Matrix3 {
    return new Matrix3(values)
  }

  static createIdentity(destination = new Matrix3()): Matrix3 {
    return destination.reset()
  }

  get determinant(): number {
    const element00 = this[0]
    const element01 = this[1]
    const element02 = this[2]
    const element10 = this[3]
    const element11 = this[4]
    const element12 = this[5]
    const element20 = this[6]
    const element21 = this[7]
    const element22 = this[8]

    const determinant01 = element22 * element11 - element12 * element21
    const determinant11 = -element22 * element10 + element12 * element20
    const determinant21 = element21 * element10 - element11 * element20

    return element00 * determinant01 + element01 * determinant11 + element02 * determinant21
  }

  clone(): Matrix3 {
    return new Matrix3(this)
  }

  copyTo(destination: Matrix3): Matrix3 {
    destination.set(this)

    return destination
  }

  copyFrom(source: Matrix3): this {
    this.set(source)

    return this
  }

  getRow(index: number, destination = new Vector3()): Vector3 {
    if (!Number.isInteger(index) || index < 0 || index >= 3) {
      throw new RangeError('Matrix3 row index must be between 0 and 2')
    }

    destination.x = this[index + 0]
    destination.y = this[index + 3]
    destination.z = this[index + 6]

    return destination
  }

  getColumn(index: number, destination = new Vector3()): Vector3 {
    if (!Number.isInteger(index) || index < 0 || index >= 3) {
      throw new RangeError('Matrix3 column index must be between 0 and 2')
    }

    destination.x = this[index * 3 + 0]
    destination.y = this[index * 3 + 1]
    destination.z = this[index * 3 + 2]

    return destination
  }

  equals(otherMatrix: Matrix3, threshold = Epsilon): boolean {
    for (let index = 0; index < 9; index++) {
      if (Math.abs(this[index] - otherMatrix[index]) > threshold) {
        return false
      }
    }

    return true
  }

  reset(): Matrix3 {
    this[0] = 1.0
    this[1] = 0.0
    this[2] = 0.0
    this[3] = 0.0
    this[4] = 1.0
    this[5] = 0.0
    this[6] = 0.0
    this[7] = 0.0
    this[8] = 1.0

    return this
  }

  transpose(destination?: Matrix3): Matrix3 {
    if (!destination) {
      destination = this
    }

    const element00 = this[0]
    const element01 = this[1]
    const element02 = this[2]

    const element10 = this[3]
    const element11 = this[4]
    const element12 = this[5]

    const element20 = this[6]
    const element21 = this[7]
    const element22 = this[8]

    destination[0] = element00
    destination[1] = element10
    destination[2] = element20
    destination[3] = element01
    destination[4] = element11
    destination[5] = element21
    destination[6] = element02
    destination[7] = element12
    destination[8] = element22

    return destination
  }

  invert(destination: Matrix3 = this): Matrix3 {
    if (!this.tryInvert(destination)) {
      throw new RangeError('Matrix has no finite, numerically stable inverse')
    }

    return destination
  }

  tryInvert(destination: Matrix3 = this): boolean {
    const element00 = this[0]
    const element01 = this[1]
    const element02 = this[2]
    const element10 = this[3]
    const element11 = this[4]
    const element12 = this[5]
    const element20 = this[6]
    const element21 = this[7]
    const element22 = this[8]

    const determinant01 = element22 * element11 - element12 * element21
    const determinant11 = -element22 * element10 + element12 * element20
    const determinant21 = element21 * element10 - element11 * element20

    let determinant = element00 * determinant01 + element01 * determinant11 + element02 * determinant21

    if (!hasUsableDeterminant(this, 3, determinant)) {
      return false
    }

    determinant = 1.0 / determinant

    const inverse0 = Math.fround(determinant01 * determinant)
    const inverse1 = Math.fround((-element22 * element01 + element02 * element21) * determinant)
    const inverse2 = Math.fround((element12 * element01 - element02 * element11) * determinant)
    const inverse3 = Math.fround(determinant11 * determinant)
    const inverse4 = Math.fround((element22 * element00 - element02 * element20) * determinant)
    const inverse5 = Math.fround((-element12 * element00 + element02 * element10) * determinant)
    const inverse6 = Math.fround(determinant21 * determinant)
    const inverse7 = Math.fround((-element21 * element00 + element01 * element20) * determinant)
    const inverse8 = Math.fround((element11 * element00 - element01 * element10) * determinant)

    if (
      !Number.isFinite(inverse0) ||
      !Number.isFinite(inverse1) ||
      !Number.isFinite(inverse2) ||
      !Number.isFinite(inverse3) ||
      !Number.isFinite(inverse4) ||
      !Number.isFinite(inverse5) ||
      !Number.isFinite(inverse6) ||
      !Number.isFinite(inverse7) ||
      !Number.isFinite(inverse8)
    ) {
      return false
    }

    destination[0] = inverse0
    destination[1] = inverse1
    destination[2] = inverse2
    destination[3] = inverse3
    destination[4] = inverse4
    destination[5] = inverse5
    destination[6] = inverse6
    destination[7] = inverse7
    destination[8] = inverse8

    return true
  }

  multiply(otherMatrix: Matrix3, destination?: Matrix3): Matrix3 {
    if (!destination) {
      destination = this
    }

    const firstMatrix00 = this[0]
    const firstMatrix01 = this[1]
    const firstMatrix02 = this[2]
    const firstMatrix10 = this[3]
    const firstMatrix11 = this[4]
    const firstMatrix12 = this[5]
    const firstMatrix20 = this[6]
    const firstMatrix21 = this[7]
    const firstMatrix22 = this[8]

    const secondMatrix00 = otherMatrix[0]
    const secondMatrix01 = otherMatrix[1]
    const secondMatrix02 = otherMatrix[2]
    const secondMatrix10 = otherMatrix[3]
    const secondMatrix11 = otherMatrix[4]
    const secondMatrix12 = otherMatrix[5]
    const secondMatrix20 = otherMatrix[6]
    const secondMatrix21 = otherMatrix[7]
    const secondMatrix22 = otherMatrix[8]

    destination[0] = secondMatrix00 * firstMatrix00 + secondMatrix01 * firstMatrix10 + secondMatrix02 * firstMatrix20
    destination[1] = secondMatrix00 * firstMatrix01 + secondMatrix01 * firstMatrix11 + secondMatrix02 * firstMatrix21
    destination[2] = secondMatrix00 * firstMatrix02 + secondMatrix01 * firstMatrix12 + secondMatrix02 * firstMatrix22
    destination[3] = secondMatrix10 * firstMatrix00 + secondMatrix11 * firstMatrix10 + secondMatrix12 * firstMatrix20
    destination[4] = secondMatrix10 * firstMatrix01 + secondMatrix11 * firstMatrix11 + secondMatrix12 * firstMatrix21
    destination[5] = secondMatrix10 * firstMatrix02 + secondMatrix11 * firstMatrix12 + secondMatrix12 * firstMatrix22
    destination[6] = secondMatrix20 * firstMatrix00 + secondMatrix21 * firstMatrix10 + secondMatrix22 * firstMatrix20
    destination[7] = secondMatrix20 * firstMatrix01 + secondMatrix21 * firstMatrix11 + secondMatrix22 * firstMatrix21
    destination[8] = secondMatrix20 * firstMatrix02 + secondMatrix21 * firstMatrix12 + secondMatrix22 * firstMatrix22

    return destination
  }

  transform(vector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    const { x, y, z } = vector

    destination.x = x * this[0] + y * this[3] + z * this[6]
    destination.y = x * this[1] + y * this[4] + z * this[7]
    destination.z = x * this[2] + y * this[5] + z * this[8]

    return destination
  }

  // Angle in radians.
  rotate(angle: number, axis: Vector3, destination?: Matrix3): null | Matrix3 {
    if (!destination) {
      destination = this
    }

    let { x, y, z } = axis

    let magnitude = Math.sqrt(x * x + y * y + z * z)

    if (!magnitude) {
      return null
    }

    if (magnitude !== 1) {
      magnitude = 1 / magnitude
      x *= magnitude
      y *= magnitude
      z *= magnitude
    }

    const sine = Math.sin(angle)
    const cosine = Math.cos(angle)

    const cosineComplement = 1.0 - cosine

    const firstMatrix00 = this[0]
    const firstMatrix01 = this[1]
    const firstMatrix02 = this[2]
    const firstMatrix10 = this[3]
    const firstMatrix11 = this[4]
    const firstMatrix12 = this[5]
    const firstMatrix20 = this[6]
    const firstMatrix21 = this[7]
    const firstMatrix22 = this[8]

    const rotationMatrix00 = x * x * cosineComplement + cosine
    const rotationMatrix01 = y * x * cosineComplement + z * sine
    const rotationMatrix02 = z * x * cosineComplement - y * sine
    const rotationMatrix10 = x * y * cosineComplement - z * sine
    const rotationMatrix11 = y * y * cosineComplement + cosine
    const rotationMatrix12 = z * y * cosineComplement + x * sine
    const rotationMatrix20 = x * z * cosineComplement + y * sine
    const rotationMatrix21 = y * z * cosineComplement - x * sine
    const rotationMatrix22 = z * z * cosineComplement + cosine

    destination[0] =
      firstMatrix00 * rotationMatrix00 + firstMatrix10 * rotationMatrix01 + firstMatrix20 * rotationMatrix02
    destination[1] =
      firstMatrix01 * rotationMatrix00 + firstMatrix11 * rotationMatrix01 + firstMatrix21 * rotationMatrix02
    destination[2] =
      firstMatrix02 * rotationMatrix00 + firstMatrix12 * rotationMatrix01 + firstMatrix22 * rotationMatrix02
    destination[3] =
      firstMatrix00 * rotationMatrix10 + firstMatrix10 * rotationMatrix11 + firstMatrix20 * rotationMatrix12
    destination[4] =
      firstMatrix01 * rotationMatrix10 + firstMatrix11 * rotationMatrix11 + firstMatrix21 * rotationMatrix12
    destination[5] =
      firstMatrix02 * rotationMatrix10 + firstMatrix12 * rotationMatrix11 + firstMatrix22 * rotationMatrix12
    destination[6] =
      firstMatrix00 * rotationMatrix20 + firstMatrix10 * rotationMatrix21 + firstMatrix20 * rotationMatrix22
    destination[7] =
      firstMatrix01 * rotationMatrix20 + firstMatrix11 * rotationMatrix21 + firstMatrix21 * rotationMatrix22
    destination[8] =
      firstMatrix02 * rotationMatrix20 + firstMatrix12 * rotationMatrix21 + firstMatrix22 * rotationMatrix22

    return destination
  }

  toMatrix4(destination?: Matrix4): Matrix4 {
    if (!destination) {
      destination = new Matrix4()
    }

    destination.set([
      this[0],
      this[1],
      this[2],
      0.0,

      this[3],
      this[4],
      this[5],
      0.0,

      this[6],
      this[7],
      this[8],
      0.0,

      0.0,
      0.0,
      0.0,
      1.0
    ])

    return destination
  }

  toQuaternion(destination?: Quaternion): Quaternion {
    if (!destination) {
      destination = new Quaternion()
    }

    const element00 = this[0]
    const element01 = this[1]
    const element02 = this[2]
    const element10 = this[3]
    const element11 = this[4]
    const element12 = this[5]
    const element20 = this[6]
    const element21 = this[7]
    const element22 = this[8]

    const x = element00 - element11 - element22
    const y = element11 - element00 - element22
    const z = element22 - element00 - element11
    const w = element00 + element11 + element22

    let largestIndex = 0
    let largestTrace = w

    if (x > largestTrace) {
      largestTrace = x
      largestIndex = 1
    }

    if (y > largestTrace) {
      largestTrace = y
      largestIndex = 2
    }

    if (z > largestTrace) {
      largestTrace = z
      largestIndex = 3
    }

    const largestComponent = Math.sqrt(largestTrace + 1) * 0.5
    const componentScale = 0.25 / largestComponent

    switch (largestIndex) {
      case 0:
        destination.w = largestComponent
        destination.x = (element12 - element21) * componentScale
        destination.y = (element20 - element02) * componentScale
        destination.z = (element01 - element10) * componentScale

        break

      case 1:
        destination.w = (element12 - element21) * componentScale
        destination.x = largestComponent
        destination.y = (element01 + element10) * componentScale
        destination.z = (element20 + element02) * componentScale

        break

      case 2:
        destination.w = (element20 - element02) * componentScale
        destination.x = (element01 + element10) * componentScale
        destination.y = largestComponent
        destination.z = (element12 + element21) * componentScale

        break

      case 3:
        destination.w = (element01 - element10) * componentScale
        destination.x = (element20 + element02) * componentScale
        destination.y = (element12 + element21) * componentScale
        destination.z = largestComponent

        break
    }

    return destination
  }

  serialize(): number[] {
    return Array.from(this)
  }

  static async deserialize(value: unknown): Promise<Matrix3> {
    return new Matrix3(readValues(value, 9, 'Matrix3'))
  }

  static transform(matrix: Matrix3, vector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    const { x, y, z } = vector

    destination.x = x * matrix[0] + y * matrix[3] + z * matrix[6]
    destination.y = x * matrix[1] + y * matrix[4] + z * matrix[7]
    destination.z = x * matrix[2] + y * matrix[5] + z * matrix[8]

    return destination
  }

  static multiply(firstMatrix: Matrix3, secondMatrix: Matrix3, destination?: Matrix3): Matrix3 {
    if (!destination) {
      destination = new Matrix3()
    }

    const firstMatrix00 = firstMatrix[0]
    const firstMatrix01 = firstMatrix[1]
    const firstMatrix02 = firstMatrix[2]
    const firstMatrix10 = firstMatrix[3]
    const firstMatrix11 = firstMatrix[4]
    const firstMatrix12 = firstMatrix[5]
    const firstMatrix20 = firstMatrix[6]
    const firstMatrix21 = firstMatrix[7]
    const firstMatrix22 = firstMatrix[8]

    const secondMatrix00 = secondMatrix[0]
    const secondMatrix01 = secondMatrix[1]
    const secondMatrix02 = secondMatrix[2]
    const secondMatrix10 = secondMatrix[3]
    const secondMatrix11 = secondMatrix[4]
    const secondMatrix12 = secondMatrix[5]
    const secondMatrix20 = secondMatrix[6]
    const secondMatrix21 = secondMatrix[7]
    const secondMatrix22 = secondMatrix[8]

    destination.set([
      secondMatrix00 * firstMatrix00 + secondMatrix01 * firstMatrix10 + secondMatrix02 * firstMatrix20,
      secondMatrix00 * firstMatrix01 + secondMatrix01 * firstMatrix11 + secondMatrix02 * firstMatrix21,
      secondMatrix00 * firstMatrix02 + secondMatrix01 * firstMatrix12 + secondMatrix02 * firstMatrix22,

      secondMatrix10 * firstMatrix00 + secondMatrix11 * firstMatrix10 + secondMatrix12 * firstMatrix20,
      secondMatrix10 * firstMatrix01 + secondMatrix11 * firstMatrix11 + secondMatrix12 * firstMatrix21,
      secondMatrix10 * firstMatrix02 + secondMatrix11 * firstMatrix12 + secondMatrix12 * firstMatrix22,

      secondMatrix20 * firstMatrix00 + secondMatrix21 * firstMatrix10 + secondMatrix22 * firstMatrix20,
      secondMatrix20 * firstMatrix01 + secondMatrix21 * firstMatrix11 + secondMatrix22 * firstMatrix21,
      secondMatrix20 * firstMatrix02 + secondMatrix21 * firstMatrix12 + secondMatrix22 * firstMatrix22
    ])

    return destination
  }

  static createLookAtRotation(
    eyePosition: Vector3,
    targetPosition: Vector3,
    upDirection: Vector3 = Vector3.createUp(),
    destination?: Matrix3
  ): Matrix3 {
    if (!destination) {
      destination = new Matrix3()
    }

    if (eyePosition.equals(targetPosition)) {
      return this.createIdentity(destination)
    }

    const backwardAxis = Vector3.subtract(eyePosition, targetPosition).normalize()

    const rightAxis = Vector3.calculateCrossProduct(upDirection, backwardAxis).normalize()
    const upAxis = Vector3.calculateCrossProduct(backwardAxis, rightAxis).normalize()

    destination.set([
      rightAxis.x,
      rightAxis.y,
      rightAxis.z,
      upAxis.x,
      upAxis.y,
      upAxis.z,
      backwardAxis.x,
      backwardAxis.y,
      backwardAxis.z
    ])

    return destination
  }
}
