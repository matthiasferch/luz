import { readValues } from './definition'
import { hasUsableDeterminant } from './inversion'
import { Epsilon } from './epsilon'
import { Matrix3 } from './matrix3'
import type { Quaternion } from './quaternion'
import { Vector3 } from './vector3'
import { Vector4 } from './vector4'

export class Matrix4 extends Float32Array {
  constructor(
    values: ArrayLike<number> = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0]
  ) {
    if (values.length !== 16) {
      throw new RangeError('Matrix4 requires exactly 16 components')
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
  ): Matrix4
  static from<T>(
    values: ArrayLike<T> | Iterable<T>,
    mapValue: (value: T, index: number) => number,
    thisArgument?: unknown
  ): Matrix4
  static from<T>(
    values: ArrayLike<T> | Iterable<T>,
    mapValue?: (value: T, index: number) => number,
    thisArgument?: unknown
  ): Matrix4 {
    const components = mapValue
      ? Array.from(values, (value, index) => mapValue.call(thisArgument, value, index))
      : Array.from(values as ArrayLike<number> | Iterable<number>)

    return new Matrix4(components)
  }

  static of(...values: number[]): Matrix4 {
    return new Matrix4(values)
  }

  static createIdentity(destination = new Matrix4()): Matrix4 {
    return destination.reset()
  }

  get determinant(): number {
    const element00 = this[0]
    const element01 = this[1]
    const element02 = this[2]
    const element03 = this[3]
    const element10 = this[4]
    const element11 = this[5]
    const element12 = this[6]
    const element13 = this[7]
    const element20 = this[8]
    const element21 = this[9]
    const element22 = this[10]
    const element23 = this[11]
    const element30 = this[12]
    const element31 = this[13]
    const element32 = this[14]
    const element33 = this[15]

    const determinant00 = element00 * element11 - element01 * element10
    const determinant01 = element00 * element12 - element02 * element10
    const determinant02 = element00 * element13 - element03 * element10
    const determinant03 = element01 * element12 - element02 * element11
    const determinant04 = element01 * element13 - element03 * element11
    const determinant05 = element02 * element13 - element03 * element12
    const determinant06 = element20 * element31 - element21 * element30
    const determinant07 = element20 * element32 - element22 * element30
    const determinant08 = element20 * element33 - element23 * element30
    const determinant09 = element21 * element32 - element22 * element31
    const determinant10 = element21 * element33 - element23 * element31
    const determinant11 = element22 * element33 - element23 * element32

    return (
      determinant00 * determinant11 -
      determinant01 * determinant10 +
      determinant02 * determinant09 +
      determinant03 * determinant08 -
      determinant04 * determinant07 +
      determinant05 * determinant06
    )
  }

  clone(): Matrix4 {
    return new Matrix4(this)
  }

  copyTo(destination: Matrix4): Matrix4 {
    destination.set(this)

    return destination
  }

  copyFrom(source: Matrix4): this {
    this.set(source)

    return this
  }

  getRow(index: number, destination = new Vector4()): Vector4 {
    if (!Number.isInteger(index) || index < 0 || index >= 4) {
      throw new RangeError('Matrix4 row index must be between 0 and 3')
    }

    destination.x = this[index + 0]
    destination.y = this[index + 4]
    destination.z = this[index + 8]
    destination.w = this[index + 12]

    return destination
  }

  getColumn(index: number, destination = new Vector4()): Vector4 {
    if (!Number.isInteger(index) || index < 0 || index >= 4) {
      throw new RangeError('Matrix4 column index must be between 0 and 3')
    }

    destination.x = this[index * 4 + 0]
    destination.y = this[index * 4 + 1]
    destination.z = this[index * 4 + 2]
    destination.w = this[index * 4 + 3]

    return destination
  }

  equals(otherMatrix: Matrix4, threshold = Epsilon): boolean {
    for (let index = 0; index < 16; index++) {
      if (Math.abs(this[index] - otherMatrix[index]) > threshold) {
        return false
      }
    }

    return true
  }

  reset(): Matrix4 {
    this[0] = 1.0
    this[1] = 0.0
    this[2] = 0.0
    this[3] = 0.0
    this[4] = 0.0
    this[5] = 1.0
    this[6] = 0.0
    this[7] = 0.0
    this[8] = 0.0
    this[9] = 0.0
    this[10] = 1.0
    this[11] = 0.0
    this[12] = 0.0
    this[13] = 0.0
    this[14] = 0.0
    this[15] = 1.0

    return this
  }

  transpose(destination?: Matrix4): Matrix4 {
    if (!destination) {
      destination = this
    }

    const element01 = this[1]
    const element02 = this[2]
    const element03 = this[3]
    const element12 = this[6]
    const element13 = this[7]
    const element23 = this[11]

    destination[1] = this[4]
    destination[2] = this[8]
    destination[3] = this[12]
    destination[4] = element01
    destination[6] = this[9]
    destination[7] = this[13]
    destination[8] = element02
    destination[9] = element12
    destination[11] = this[14]
    destination[12] = element03
    destination[13] = element13
    destination[14] = element23

    if (destination !== this) {
      destination[0] = this[0]
      destination[5] = this[5]
      destination[10] = this[10]
      destination[15] = this[15]
    }

    return destination
  }

  invert(destination: Matrix4 = this): Matrix4 {
    if (!this.tryInvert(destination)) {
      throw new RangeError('Matrix has no finite, numerically stable inverse')
    }

    return destination
  }

  tryInvert(destination: Matrix4 = this): boolean {
    const element00 = this[0]
    const element01 = this[1]
    const element02 = this[2]
    const element03 = this[3]
    const element10 = this[4]
    const element11 = this[5]
    const element12 = this[6]
    const element13 = this[7]
    const element20 = this[8]
    const element21 = this[9]
    const element22 = this[10]
    const element23 = this[11]
    const element30 = this[12]
    const element31 = this[13]
    const element32 = this[14]
    const element33 = this[15]

    const minor00 = element00 * element11 - element01 * element10
    const minor01 = element00 * element12 - element02 * element10
    const minor02 = element00 * element13 - element03 * element10
    const minor03 = element01 * element12 - element02 * element11
    const minor04 = element01 * element13 - element03 * element11
    const minor05 = element02 * element13 - element03 * element12
    const minor06 = element20 * element31 - element21 * element30
    const minor07 = element20 * element32 - element22 * element30
    const minor08 = element20 * element33 - element23 * element30
    const minor09 = element21 * element32 - element22 * element31
    const minor10 = element21 * element33 - element23 * element31
    const minor11 = element22 * element33 - element23 * element32

    let determinant =
      minor00 * minor11 -
      minor01 * minor10 +
      minor02 * minor09 +
      minor03 * minor08 -
      minor04 * minor07 +
      minor05 * minor06

    if (!hasUsableDeterminant(this, 4, determinant)) {
      return false
    }

    determinant = 1.0 / determinant

    const inverse0 = Math.fround((element11 * minor11 - element12 * minor10 + element13 * minor09) * determinant)
    const inverse1 = Math.fround((-element01 * minor11 + element02 * minor10 - element03 * minor09) * determinant)
    const inverse2 = Math.fround((element31 * minor05 - element32 * minor04 + element33 * minor03) * determinant)
    const inverse3 = Math.fround((-element21 * minor05 + element22 * minor04 - element23 * minor03) * determinant)
    const inverse4 = Math.fround((-element10 * minor11 + element12 * minor08 - element13 * minor07) * determinant)
    const inverse5 = Math.fround((element00 * minor11 - element02 * minor08 + element03 * minor07) * determinant)
    const inverse6 = Math.fround((-element30 * minor05 + element32 * minor02 - element33 * minor01) * determinant)
    const inverse7 = Math.fround((element20 * minor05 - element22 * minor02 + element23 * minor01) * determinant)
    const inverse8 = Math.fround((element10 * minor10 - element11 * minor08 + element13 * minor06) * determinant)
    const inverse9 = Math.fround((-element00 * minor10 + element01 * minor08 - element03 * minor06) * determinant)
    const inverse10 = Math.fround((element30 * minor04 - element31 * minor02 + element33 * minor00) * determinant)
    const inverse11 = Math.fround((-element20 * minor04 + element21 * minor02 - element23 * minor00) * determinant)
    const inverse12 = Math.fround((-element10 * minor09 + element11 * minor07 - element12 * minor06) * determinant)
    const inverse13 = Math.fround((element00 * minor09 - element01 * minor07 + element02 * minor06) * determinant)
    const inverse14 = Math.fround((-element30 * minor03 + element31 * minor01 - element32 * minor00) * determinant)
    const inverse15 = Math.fround((element20 * minor03 - element21 * minor01 + element22 * minor00) * determinant)

    if (
      !Number.isFinite(inverse0) ||
      !Number.isFinite(inverse1) ||
      !Number.isFinite(inverse2) ||
      !Number.isFinite(inverse3) ||
      !Number.isFinite(inverse4) ||
      !Number.isFinite(inverse5) ||
      !Number.isFinite(inverse6) ||
      !Number.isFinite(inverse7) ||
      !Number.isFinite(inverse8) ||
      !Number.isFinite(inverse9) ||
      !Number.isFinite(inverse10) ||
      !Number.isFinite(inverse11) ||
      !Number.isFinite(inverse12) ||
      !Number.isFinite(inverse13) ||
      !Number.isFinite(inverse14) ||
      !Number.isFinite(inverse15)
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
    destination[9] = inverse9
    destination[10] = inverse10
    destination[11] = inverse11
    destination[12] = inverse12
    destination[13] = inverse13
    destination[14] = inverse14
    destination[15] = inverse15

    return true
  }

  multiply(otherMatrix: Matrix4, destination?: Matrix4): Matrix4 {
    if (!destination) {
      destination = this
    }

    const firstMatrix00 = this[0]
    const firstMatrix01 = this[1]
    const firstMatrix02 = this[2]
    const firstMatrix03 = this[3]
    const firstMatrix10 = this[4]
    const firstMatrix11 = this[5]
    const firstMatrix12 = this[6]
    const firstMatrix13 = this[7]
    const firstMatrix20 = this[8]
    const firstMatrix21 = this[9]
    const firstMatrix22 = this[10]
    const firstMatrix23 = this[11]
    const firstMatrix30 = this[12]
    const firstMatrix31 = this[13]
    const firstMatrix32 = this[14]
    const firstMatrix33 = this[15]

    const secondMatrix00 = otherMatrix[0]
    const secondMatrix01 = otherMatrix[1]
    const secondMatrix02 = otherMatrix[2]
    const secondMatrix03 = otherMatrix[3]
    const secondMatrix10 = otherMatrix[4]
    const secondMatrix11 = otherMatrix[5]
    const secondMatrix12 = otherMatrix[6]
    const secondMatrix13 = otherMatrix[7]
    const secondMatrix20 = otherMatrix[8]
    const secondMatrix21 = otherMatrix[9]
    const secondMatrix22 = otherMatrix[10]
    const secondMatrix23 = otherMatrix[11]
    const secondMatrix30 = otherMatrix[12]
    const secondMatrix31 = otherMatrix[13]
    const secondMatrix32 = otherMatrix[14]
    const secondMatrix33 = otherMatrix[15]

    destination[0] =
      secondMatrix00 * firstMatrix00 +
      secondMatrix01 * firstMatrix10 +
      secondMatrix02 * firstMatrix20 +
      secondMatrix03 * firstMatrix30
    destination[1] =
      secondMatrix00 * firstMatrix01 +
      secondMatrix01 * firstMatrix11 +
      secondMatrix02 * firstMatrix21 +
      secondMatrix03 * firstMatrix31
    destination[2] =
      secondMatrix00 * firstMatrix02 +
      secondMatrix01 * firstMatrix12 +
      secondMatrix02 * firstMatrix22 +
      secondMatrix03 * firstMatrix32
    destination[3] =
      secondMatrix00 * firstMatrix03 +
      secondMatrix01 * firstMatrix13 +
      secondMatrix02 * firstMatrix23 +
      secondMatrix03 * firstMatrix33
    destination[4] =
      secondMatrix10 * firstMatrix00 +
      secondMatrix11 * firstMatrix10 +
      secondMatrix12 * firstMatrix20 +
      secondMatrix13 * firstMatrix30
    destination[5] =
      secondMatrix10 * firstMatrix01 +
      secondMatrix11 * firstMatrix11 +
      secondMatrix12 * firstMatrix21 +
      secondMatrix13 * firstMatrix31
    destination[6] =
      secondMatrix10 * firstMatrix02 +
      secondMatrix11 * firstMatrix12 +
      secondMatrix12 * firstMatrix22 +
      secondMatrix13 * firstMatrix32
    destination[7] =
      secondMatrix10 * firstMatrix03 +
      secondMatrix11 * firstMatrix13 +
      secondMatrix12 * firstMatrix23 +
      secondMatrix13 * firstMatrix33
    destination[8] =
      secondMatrix20 * firstMatrix00 +
      secondMatrix21 * firstMatrix10 +
      secondMatrix22 * firstMatrix20 +
      secondMatrix23 * firstMatrix30
    destination[9] =
      secondMatrix20 * firstMatrix01 +
      secondMatrix21 * firstMatrix11 +
      secondMatrix22 * firstMatrix21 +
      secondMatrix23 * firstMatrix31
    destination[10] =
      secondMatrix20 * firstMatrix02 +
      secondMatrix21 * firstMatrix12 +
      secondMatrix22 * firstMatrix22 +
      secondMatrix23 * firstMatrix32
    destination[11] =
      secondMatrix20 * firstMatrix03 +
      secondMatrix21 * firstMatrix13 +
      secondMatrix22 * firstMatrix23 +
      secondMatrix23 * firstMatrix33
    destination[12] =
      secondMatrix30 * firstMatrix00 +
      secondMatrix31 * firstMatrix10 +
      secondMatrix32 * firstMatrix20 +
      secondMatrix33 * firstMatrix30
    destination[13] =
      secondMatrix30 * firstMatrix01 +
      secondMatrix31 * firstMatrix11 +
      secondMatrix32 * firstMatrix21 +
      secondMatrix33 * firstMatrix31
    destination[14] =
      secondMatrix30 * firstMatrix02 +
      secondMatrix31 * firstMatrix12 +
      secondMatrix32 * firstMatrix22 +
      secondMatrix33 * firstMatrix32
    destination[15] =
      secondMatrix30 * firstMatrix03 +
      secondMatrix31 * firstMatrix13 +
      secondMatrix32 * firstMatrix23 +
      secondMatrix33 * firstMatrix33

    return destination
  }

  transform(vector: Vector4, destination?: Vector4): Vector4 {
    if (!destination) {
      destination = new Vector4()
    }

    const { x, y, z, w } = vector

    destination.x = this[0] * x + this[4] * y + this[8] * z + this[12] * w
    destination.y = this[1] * x + this[5] * y + this[9] * z + this[13] * w
    destination.z = this[2] * x + this[6] * y + this[10] * z + this[14] * w
    destination.w = this[3] * x + this[7] * y + this[11] * z + this[15] * w

    return destination
  }

  transformVector3(vector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    const { x, y, z } = vector

    destination.x = this[0] * x + this[4] * y + this[8] * z + this[12]
    destination.y = this[1] * x + this[5] * y + this[9] * z + this[13]
    destination.z = this[2] * x + this[6] * y + this[10] * z + this[14]

    return destination
  }

  toMatrix3(destination?: Matrix3): Matrix3 {
    if (!destination) {
      destination = new Matrix3()
    }

    destination.set([this[0], this[1], this[2], this[4], this[5], this[6], this[8], this[9], this[10]])

    return destination
  }

  scale(vector: Vector3, destination?: Matrix4): Matrix4 {
    if (!destination) {
      destination = this
    }

    const { x, y, z } = vector

    destination[0] = this[0] * x
    destination[1] = this[1] * x
    destination[2] = this[2] * x
    destination[3] = this[3] * x
    destination[4] = this[4] * y
    destination[5] = this[5] * y
    destination[6] = this[6] * y
    destination[7] = this[7] * y
    destination[8] = this[8] * z
    destination[9] = this[9] * z
    destination[10] = this[10] * z
    destination[11] = this[11] * z

    if (destination !== this) {
      destination[12] = this[12]
      destination[13] = this[13]
      destination[14] = this[14]
      destination[15] = this[15]
    }

    return destination
  }

  // Angle in radians.
  rotate(angle: number, axis: Vector3, destination?: Matrix4): null | Matrix4 {
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
    const firstMatrix03 = this[3]
    const firstMatrix10 = this[4]
    const firstMatrix11 = this[5]
    const firstMatrix12 = this[6]
    const firstMatrix13 = this[7]
    const firstMatrix20 = this[8]
    const firstMatrix21 = this[9]
    const firstMatrix22 = this[10]
    const firstMatrix23 = this[11]

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
      firstMatrix03 * rotationMatrix00 + firstMatrix13 * rotationMatrix01 + firstMatrix23 * rotationMatrix02
    destination[4] =
      firstMatrix00 * rotationMatrix10 + firstMatrix10 * rotationMatrix11 + firstMatrix20 * rotationMatrix12
    destination[5] =
      firstMatrix01 * rotationMatrix10 + firstMatrix11 * rotationMatrix11 + firstMatrix21 * rotationMatrix12
    destination[6] =
      firstMatrix02 * rotationMatrix10 + firstMatrix12 * rotationMatrix11 + firstMatrix22 * rotationMatrix12
    destination[7] =
      firstMatrix03 * rotationMatrix10 + firstMatrix13 * rotationMatrix11 + firstMatrix23 * rotationMatrix12
    destination[8] =
      firstMatrix00 * rotationMatrix20 + firstMatrix10 * rotationMatrix21 + firstMatrix20 * rotationMatrix22
    destination[9] =
      firstMatrix01 * rotationMatrix20 + firstMatrix11 * rotationMatrix21 + firstMatrix21 * rotationMatrix22
    destination[10] =
      firstMatrix02 * rotationMatrix20 + firstMatrix12 * rotationMatrix21 + firstMatrix22 * rotationMatrix22
    destination[11] =
      firstMatrix03 * rotationMatrix20 + firstMatrix13 * rotationMatrix21 + firstMatrix23 * rotationMatrix22

    if (destination !== this) {
      destination[12] = this[12]
      destination[13] = this[13]
      destination[14] = this[14]
      destination[15] = this[15]
    }

    return destination
  }

  translate(vector: Vector3, destination?: Matrix4): Matrix4 {
    if (!destination) {
      destination = this
    }

    const x = vector.x
    const y = vector.y
    const z = vector.z

    if (destination !== this) {
      for (let index = 0; index < 12; index++) {
        destination[index] = this[index]
      }
    }

    destination[12] = this[12] + this[0] * x + this[4] * y + this[8] * z
    destination[13] = this[13] + this[1] * x + this[5] * y + this[9] * z
    destination[14] = this[14] + this[2] * x + this[6] * y + this[10] * z
    destination[15] = this[15] + this[3] * x + this[7] * y + this[11] * z

    return destination
  }

  decompose(translation: Vector3, rotation: Matrix3, scaling?: Vector3) {
    const element00 = this[0]
    const element01 = this[1]
    const element02 = this[2]
    const element10 = this[4]
    const element11 = this[5]
    const element12 = this[6]
    const element20 = this[8]
    const element21 = this[9]
    const element22 = this[10]
    const element30 = this[12]
    const element31 = this[13]
    const element32 = this[14]

    if (scaling) {
      scaling.x = Math.sqrt(element00 * element00 + element01 * element01 + element02 * element02)
      scaling.y = Math.sqrt(element10 * element10 + element11 * element11 + element12 * element12)
      scaling.z = Math.sqrt(element20 * element20 + element21 * element21 + element22 * element22)
    }

    rotation.set([element00, element01, element02, element10, element11, element12, element20, element21, element22])

    translation.xyz = [element30, element31, element32]
  }

  serialize(): number[] {
    return Array.from(this)
  }

  static async deserialize(value: unknown): Promise<Matrix4> {
    return new Matrix4(readValues(value, 16, 'Matrix4'))
  }

  static createTransform(
    translation: Vector3,
    rotation: Quaternion,
    scale = Vector3.createOne(),
    destination?: Matrix4
  ) {
    if (!destination) {
      destination = new Matrix4()
    }

    const rotationX = rotation.x
    const rotationY = rotation.y
    const rotationZ = rotation.z
    const rotationW = rotation.w

    const translationX = translation.x
    const translationY = translation.y
    const translationZ = translation.z

    const scaleX = scale.x
    const scaleY = scale.y
    const scaleZ = scale.z

    const doubledX = rotationX + rotationX
    const doubledY = rotationY + rotationY
    const doubledZ = rotationZ + rotationZ
    const productXX = rotationX * doubledX
    const productXY = rotationX * doubledY
    const productXZ = rotationX * doubledZ
    const productYY = rotationY * doubledY
    const productYZ = rotationY * doubledZ
    const productZZ = rotationZ * doubledZ
    const productWX = rotationW * doubledX
    const productWY = rotationW * doubledY
    const productWZ = rotationW * doubledZ

    destination.set([
      (1.0 - (productYY + productZZ)) * scaleX,
      (productXY + productWZ) * scaleX,
      (productXZ - productWY) * scaleX,
      0.0,

      (productXY - productWZ) * scaleY,
      (1.0 - (productXX + productZZ)) * scaleY,
      (productYZ + productWX) * scaleY,
      0.0,

      (productXZ + productWY) * scaleZ,
      (productYZ - productWX) * scaleZ,
      (1.0 - (productXX + productYY)) * scaleZ,
      0.0,

      translationX,
      translationY,
      translationZ,
      1.0
    ])

    return destination
  }

  static multiply(firstMatrix: Matrix4, secondMatrix: Matrix4, destination?: Matrix4): Matrix4 {
    if (!destination) {
      destination = new Matrix4()
    }

    const firstMatrix00 = firstMatrix[0]
    const firstMatrix01 = firstMatrix[1]
    const firstMatrix02 = firstMatrix[2]
    const firstMatrix03 = firstMatrix[3]
    const firstMatrix10 = firstMatrix[4]
    const firstMatrix11 = firstMatrix[5]
    const firstMatrix12 = firstMatrix[6]
    const firstMatrix13 = firstMatrix[7]
    const firstMatrix20 = firstMatrix[8]
    const firstMatrix21 = firstMatrix[9]
    const firstMatrix22 = firstMatrix[10]
    const firstMatrix23 = firstMatrix[11]
    const firstMatrix30 = firstMatrix[12]
    const firstMatrix31 = firstMatrix[13]
    const firstMatrix32 = firstMatrix[14]
    const firstMatrix33 = firstMatrix[15]

    const secondMatrix00 = secondMatrix[0]
    const secondMatrix01 = secondMatrix[1]
    const secondMatrix02 = secondMatrix[2]
    const secondMatrix03 = secondMatrix[3]
    const secondMatrix10 = secondMatrix[4]
    const secondMatrix11 = secondMatrix[5]
    const secondMatrix12 = secondMatrix[6]
    const secondMatrix13 = secondMatrix[7]
    const secondMatrix20 = secondMatrix[8]
    const secondMatrix21 = secondMatrix[9]
    const secondMatrix22 = secondMatrix[10]
    const secondMatrix23 = secondMatrix[11]
    const secondMatrix30 = secondMatrix[12]
    const secondMatrix31 = secondMatrix[13]
    const secondMatrix32 = secondMatrix[14]
    const secondMatrix33 = secondMatrix[15]

    destination.set([
      secondMatrix00 * firstMatrix00 +
        secondMatrix01 * firstMatrix10 +
        secondMatrix02 * firstMatrix20 +
        secondMatrix03 * firstMatrix30,
      secondMatrix00 * firstMatrix01 +
        secondMatrix01 * firstMatrix11 +
        secondMatrix02 * firstMatrix21 +
        secondMatrix03 * firstMatrix31,
      secondMatrix00 * firstMatrix02 +
        secondMatrix01 * firstMatrix12 +
        secondMatrix02 * firstMatrix22 +
        secondMatrix03 * firstMatrix32,
      secondMatrix00 * firstMatrix03 +
        secondMatrix01 * firstMatrix13 +
        secondMatrix02 * firstMatrix23 +
        secondMatrix03 * firstMatrix33,

      secondMatrix10 * firstMatrix00 +
        secondMatrix11 * firstMatrix10 +
        secondMatrix12 * firstMatrix20 +
        secondMatrix13 * firstMatrix30,
      secondMatrix10 * firstMatrix01 +
        secondMatrix11 * firstMatrix11 +
        secondMatrix12 * firstMatrix21 +
        secondMatrix13 * firstMatrix31,
      secondMatrix10 * firstMatrix02 +
        secondMatrix11 * firstMatrix12 +
        secondMatrix12 * firstMatrix22 +
        secondMatrix13 * firstMatrix32,
      secondMatrix10 * firstMatrix03 +
        secondMatrix11 * firstMatrix13 +
        secondMatrix12 * firstMatrix23 +
        secondMatrix13 * firstMatrix33,

      secondMatrix20 * firstMatrix00 +
        secondMatrix21 * firstMatrix10 +
        secondMatrix22 * firstMatrix20 +
        secondMatrix23 * firstMatrix30,
      secondMatrix20 * firstMatrix01 +
        secondMatrix21 * firstMatrix11 +
        secondMatrix22 * firstMatrix21 +
        secondMatrix23 * firstMatrix31,
      secondMatrix20 * firstMatrix02 +
        secondMatrix21 * firstMatrix12 +
        secondMatrix22 * firstMatrix22 +
        secondMatrix23 * firstMatrix32,
      secondMatrix20 * firstMatrix03 +
        secondMatrix21 * firstMatrix13 +
        secondMatrix22 * firstMatrix23 +
        secondMatrix23 * firstMatrix33,

      secondMatrix30 * firstMatrix00 +
        secondMatrix31 * firstMatrix10 +
        secondMatrix32 * firstMatrix20 +
        secondMatrix33 * firstMatrix30,
      secondMatrix30 * firstMatrix01 +
        secondMatrix31 * firstMatrix11 +
        secondMatrix32 * firstMatrix21 +
        secondMatrix33 * firstMatrix31,
      secondMatrix30 * firstMatrix02 +
        secondMatrix31 * firstMatrix12 +
        secondMatrix32 * firstMatrix22 +
        secondMatrix33 * firstMatrix32,
      secondMatrix30 * firstMatrix03 +
        secondMatrix31 * firstMatrix13 +
        secondMatrix32 * firstMatrix23 +
        secondMatrix33 * firstMatrix33
    ])

    return destination
  }

  static createFrustum(
    leftBound: number,
    rightBound: number,
    bottomBound: number,
    topBound: number,
    nearDistance: number,
    farDistance: number,
    destination?: Matrix4
  ): Matrix4 {
    if (!destination) {
      destination = new Matrix4()
    }

    const rightMinusLeft = rightBound - leftBound
    const topMinusBottom = topBound - bottomBound
    const farMinusNear = farDistance - nearDistance

    destination.set([
      (nearDistance * 2.0) / rightMinusLeft,
      0.0,
      0.0,
      0.0,

      0.0,
      (nearDistance * 2.0) / topMinusBottom,
      0.0,
      0.0,

      (rightBound + leftBound) / rightMinusLeft,
      (topBound + bottomBound) / topMinusBottom,
      -(farDistance + nearDistance) / farMinusNear,
      -1.0,

      0.0,
      0.0,
      -(farDistance * nearDistance * 2.0) / farMinusNear,
      0.0
    ])

    return destination
  }

  static createPerspective(
    // Vertical angle in degrees.
    fieldOfView: number,
    aspect: number,
    nearDistance: number,
    farDistance: number,
    destination?: Matrix4
  ): Matrix4 {
    if (!destination) {
      destination = new Matrix4()
    }

    const topExtent = nearDistance * Math.tan((fieldOfView * Math.PI) / 360.0)
    const rightExtent = topExtent * aspect

    return Matrix4.createFrustum(
      -rightExtent,
      rightExtent,
      -topExtent,
      topExtent,
      nearDistance,
      farDistance,
      destination
    )
  }

  static createOrthographic(
    leftBound: number,
    rightBound: number,
    bottomBound: number,
    topBound: number,
    nearDistance: number,
    farDistance: number,
    destination?: Matrix4
  ): Matrix4 {
    if (!destination) {
      destination = new Matrix4()
    }

    const rightMinusLeft = rightBound - leftBound
    const topMinusBottom = topBound - bottomBound
    const farMinusNear = farDistance - nearDistance

    destination.set([
      2.0 / rightMinusLeft,
      0.0,
      0.0,
      0.0,

      0.0,
      2 / topMinusBottom,
      0.0,
      0.0,

      0.0,
      0.0,
      -2.0 / farMinusNear,
      0.0,

      -(leftBound + rightBound) / rightMinusLeft,
      -(topBound + bottomBound) / topMinusBottom,
      -(farDistance + nearDistance) / farMinusNear,
      1.0
    ])

    return destination
  }

  static createReflection(plane: Vector4, destination?: Matrix4) {
    if (!destination) {
      destination = new Matrix4()
    }

    const productXX = plane.x * plane.x
    const productXY = plane.x * plane.y
    const productXZ = plane.x * plane.z
    const productXW = plane.x * plane.w
    const productYY = plane.y * plane.y
    const productYZ = plane.y * plane.z
    const productYW = plane.y * plane.w
    const productZZ = plane.z * plane.z
    const productZW = plane.z * plane.w

    destination.set([
      1.0 - 2.0 * productXX,
      -2.0 * productXY,
      -2.0 * productXZ,
      0.0,

      -2.0 * productXY,
      1.0 - 2.0 * productYY,
      -2.0 * productYZ,
      0.0,

      -2.0 * productXZ,
      -2.0 * productYZ,
      1.0 - 2.0 * productZZ,
      0.0,

      -2.0 * productXW,
      -2.0 * productYW,
      -2.0 * productZW,
      1.0
    ])

    return destination
  }

  static createLookAtTransform(
    eyePosition: Vector3,
    targetPosition: Vector3,
    upDirection: Vector3 = Vector3.createUp(),
    destination?: Matrix4
  ): Matrix4 {
    if (!destination) {
      destination = new Matrix4()
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
      0.0,
      upAxis.x,
      upAxis.y,
      upAxis.z,
      0.0,
      backwardAxis.x,
      backwardAxis.y,
      backwardAxis.z,
      0.0,
      eyePosition.x,
      eyePosition.y,
      eyePosition.z,
      1.0
    ])

    return destination
  }
}
