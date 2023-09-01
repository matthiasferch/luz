import { Epsilon } from './constants'
import { vec2 } from './vec2'

export class mat2 extends Float32Array {

  constructor(values: number[] = [
    1.0, 0.0,
    0.0, 1.0
  ]) {
    super(values.slice(0, 4))
  }

  static readonly identity = new mat2()

  get determinant(): number {
    return this[0] * this[3] - this[2] * this[1]
  }

  copy(dest: null | mat2 = null): mat2 {
    if (!dest) {
      dest = new mat2()
    }

    dest.set(this)

    return dest
  }

  row(index: number, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = new vec2()
    }

    dest.x = this[index * 2]
    dest.y = this[index * 2 + 1]

    return dest
  }

  column(index: number, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = new vec2()
    }

    dest.x = this[index]
    dest.y = this[index + 2]

    return dest
  }

  equals(other: mat2, threshold = Epsilon): boolean {
    for (let i = 0; i < 4; i++) {
      if (Math.abs(this[i] - other[i]) > threshold) {
        return false
      }
    }

    return true
  }

  reset(): mat2 {
    this[0] = 1.0
    this[1] = 0.0
    this[2] = 0.0
    this[3] = 1.0

    return this
  }

  transpose(dest: null | mat2 = null): mat2 {
    if (!dest) {
      dest = this
    }

    const t = this[1]
    dest[1] = dest[2]
    dest[2] = t

    return dest
  }

  invert(dest: null | mat2 = null): mat2 {
    if (!dest) {
      dest = this
    }

    let det = this.determinant

    if (det === 0.0) {
      return null
    }

    det = 1.0 / det

    const t00 = this[0]
    const t01 = this[1]
    const t10 = this[2]
    const t11 = this[3]

    dest[0] = det * t11
    dest[1] = det * -t01
    dest[2] = det * -t10
    dest[3] = det * t00

    return dest
  }

  multiply(other: mat2, dest: null | mat2 = null): mat2 {
    if (!dest) {
      dest = this
    }

    const a00 = this[0]
    const a01 = this[1]
    const a10 = this[2]
    const a11 = this[3]

    const b00 = other[0]
    const b01 = other[1]
    const b10 = other[2]
    const b11 = other[3]

    dest[0] = a00 * b00 + a01 * b10
    dest[1] = a00 * b01 + a01 * b11
    dest[2] = a10 * b00 + a11 * b10
    dest[3] = a10 * b01 + a11 * b11

    return dest
  }

  transform(vector: vec2, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = new vec2()
    }

    const x = vector.x
    const y = vector.y

    dest.x = x * this[0] + y * this[1]
    dest.y = x * this[2] + y * this[3]

    return dest
  }

  scale(vector: vec2, dest: null | mat2 = null): mat2 {
    if (!dest) {
      dest = this
    }

    const v00 = this[0]
    const v01 = this[1]
    const v10 = this[2]
    const v11 = this[3]

    const x = vector.x
    const y = vector.y

    dest[0] = v00 * x
    dest[1] = v01 * y
    dest[2] = v10 * x
    dest[3] = v11 * y

    return dest
  }

  rotate(angle: number, dest: null | mat2 = null): mat2 {
    if (!dest) {
      dest = this
    }

    const v00 = this[0]
    const v01 = this[1]
    const v10 = this[2]
    const v11 = this[3]

    const sin = Math.sin(angle)
    const cos = Math.cos(angle)

    dest[0] = v00 * cos + v01 * sin
    dest[1] = v00 * -sin + v01 * cos
    dest[2] = v10 * cos + v11 * sin
    dest[3] = v10 * -sin + v11 * cos

    return dest
  }

  static multiply(m1: mat2, m2: mat2, dest: null | mat2 = null): mat2 {
    if (!dest) {
      dest = new mat2()
    }

    const a00 = m1[0]
    const a01 = m1[1]
    const a10 = m1[2]
    const a11 = m1[3]

    const b00 = m2[0]
    const b01 = m2[1]
    const b10 = m2[2]
    const b11 = m2[3]

    dest[0] = a00 * b00 + a01 * b10
    dest[1] = a00 * b01 + a01 * b11
    dest[2] = a10 * b00 + a11 * b10
    dest[3] = a10 * b01 + a11 * b11

    return dest
  }

}
