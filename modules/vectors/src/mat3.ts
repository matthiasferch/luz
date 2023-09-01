import { Epsilon } from './constants'
import { mat4 } from './mat4'
import { quat } from './quat'
import { vec3 } from './vec3'

export class mat3 extends Float32Array {

  constructor(values: number[] = [
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0
  ]) {
    super(values.slice(0, 9))
  }

  static readonly identity = new mat3()

  get determinant(): number {
    const v00 = this[0]
    const v01 = this[1]
    const v02 = this[2]
    const v10 = this[3]
    const v11 = this[4]
    const v12 = this[5]
    const v20 = this[6]
    const v21 = this[7]
    const v22 = this[8]

    const det01 = v22 * v11 - v12 * v21
    const det11 = -v22 * v10 + v12 * v20
    const det21 = v21 * v10 - v11 * v20

    return v00 * det01 + v01 * det11 + v02 * det21
  }

  copy(dest: null | mat3 = null): mat3 {
    if (!dest) {
      dest = new mat3()
    }

    for (let i = 0; i < 9; i++) {
      dest[i] = this[i]
    }

    return dest
  }

  row(index: number, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = this[index * 3]
    dest.y = this[index * 3 + 1]
    dest.z = this[index * 3 + 2]

    return dest
  }

  column(index: number, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = this[index]
    dest.y = this[index + 3]
    dest.z = this[index + 6]

    return dest
  }

  equals(other: mat3, threshold = Epsilon): boolean {
    for (let i = 0; i < 9; i++) {
      if (Math.abs(this[i] - other[i]) > threshold) {
        return false
      }
    }

    return true
  }

  reset(): mat3 {
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

  transpose(dest: null | mat3 = null): mat3 {
    if (!dest) {
      dest = this
    }

    const t00 = this[0]
    const t01 = this[1]
    const t02 = this[2]

    const t10 = this[3]
    const t11 = this[4]
    const t12 = this[5]

    const t20 = this[6]
    const t21 = this[7]
    const t22 = this[8]

    dest[0] = t00
    dest[1] = t10
    dest[2] = t20

    dest[3] = t01
    dest[4] = t11
    dest[5] = t21

    dest[6] = t02
    dest[7] = t12
    dest[8] = t22

    return dest
  }

  invert(dest: null | mat3 = null): mat3 {
    if (!dest) {
      dest = this
    }

    const v00 = this[0]
    const v01 = this[1]
    const v02 = this[2]
    const v10 = this[3]
    const v11 = this[4]
    const v12 = this[5]
    const v20 = this[6]
    const v21 = this[7]
    const v22 = this[8]

    const det01 = v22 * v11 - v12 * v21
    const det11 = -v22 * v10 + v12 * v20
    const det21 = v21 * v10 - v11 * v20

    let det = v00 * det01 + v01 * det11 + v02 * det21

    if (det === 0.0) {
      return null
    }

    det = 1.0 / det

    dest[0] = det01 * det
    dest[1] = (-v22 * v01 + v02 * v21) * det
    dest[2] = (v12 * v01 - v02 * v11) * det

    dest[3] = det11 * det
    dest[4] = (v22 * v00 - v02 * v20) * det
    dest[5] = (-v12 * v00 + v02 * v10) * det

    dest[6] = det21 * det
    dest[7] = (-v21 * v00 + v01 * v20) * det
    dest[8] = (v11 * v00 - v01 * v10) * det

    return dest
  }

  multiply(other: mat3, dest: null | mat3 = null): mat3 {
    if (!dest) {
      dest = this
    }

    const a00 = this[0]
    const a01 = this[1]
    const a02 = this[2]
    const a10 = this[3]
    const a11 = this[4]
    const a12 = this[5]
    const a20 = this[6]
    const a21 = this[7]
    const a22 = this[8]

    const b00 = other[0]
    const b01 = other[1]
    const b02 = other[2]
    const b10 = other[3]
    const b11 = other[4]
    const b12 = other[5]
    const b20 = other[6]
    const b21 = other[7]
    const b22 = other[8]

    dest[0] = b00 * a00 + b01 * a10 + b02 * a20
    dest[1] = b00 * a01 + b01 * a11 + b02 * a21
    dest[2] = b00 * a02 + b01 * a12 + b02 * a22

    dest[3] = b10 * a00 + b11 * a10 + b12 * a20
    dest[4] = b10 * a01 + b11 * a11 + b12 * a21
    dest[5] = b10 * a02 + b11 * a12 + b12 * a22

    dest[6] = b20 * a00 + b21 * a10 + b22 * a20
    dest[7] = b20 * a01 + b21 * a11 + b22 * a21
    dest[8] = b20 * a02 + b21 * a12 + b22 * a22

    return dest
  }

  transform(vector: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    const { x, y, z } = vector

    dest.x = x * this[0] + y * this[3] + z * this[6]
    dest.y = x * this[1] + y * this[4] + z * this[7]
    dest.z = x * this[2] + y * this[5] + z * this[8]

    return dest
  }

  rotate(angle: number, axis: vec3, dest: null | mat3 = null): null | mat3 {
    if (!dest) {
      dest = this
    }

    let { x, y, z } = axis

    let length = Math.sqrt(x * x + y * y + z * z)

    if (!length) {
      return null
    }

    if (length !== 1) {
      length = 1 / length
      x *= length
      y *= length
      z *= length
    }

    const s = Math.sin(angle)
    const c = Math.cos(angle)

    const t = 1.0 - c

    const a00 = this[0]
    const a01 = this[1]
    const a02 = this[2]
    const a10 = this[3]
    const a11 = this[4]
    const a12 = this[5]
    const a20 = this[6]
    const a21 = this[7]
    const a22 = this[8]

    const b00 = x * x * t + c
    const b01 = y * x * t + z * s
    const b02 = z * x * t - y * s
    const b10 = x * y * t - z * s
    const b11 = y * y * t + c
    const b12 = z * y * t + x * s
    const b20 = x * z * t + y * s
    const b21 = y * z * t - x * s
    const b22 = z * z * t + c

    dest[0] = a00 * b00 + a10 * b01 + a20 * b02
    dest[1] = a01 * b00 + a11 * b01 + a21 * b02
    dest[2] = a02 * b00 + a12 * b01 + a22 * b02

    dest[3] = a00 * b10 + a10 * b11 + a20 * b12
    dest[4] = a01 * b10 + a11 * b11 + a21 * b12
    dest[5] = a02 * b10 + a12 * b11 + a22 * b12

    dest[6] = a00 * b20 + a10 * b21 + a20 * b22
    dest[7] = a01 * b20 + a11 * b21 + a21 * b22
    dest[8] = a02 * b20 + a12 * b21 + a22 * b22

    return dest
  }

  toMat4(dest: null | mat4 = null): mat4 {
    if (!dest) {
      dest = new mat4()
    }

    dest.set([
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

    return dest
  }

  toQuat(dest: null | quat = null): quat {
    if (!dest) {
      dest = new quat()
    }

    const v00 = this[0]
    const v01 = this[1]
    const v02 = this[2]
    const v10 = this[3]
    const v11 = this[4]
    const v12 = this[5]
    const v20 = this[6]
    const v21 = this[7]
    const v22 = this[8]

    const x = v00 - v11 - v22
    const y = v11 - v00 - v22
    const z = v22 - v00 - v11
    const w = v00 + v11 + v22

    let i = 0
    let f = w

    if (x > f) {
      f = x
      i = 1
    }

    if (y > f) {
      f = y
      i = 2
    }

    if (z > f) {
      f = z
      i = 3
    }

    const b = Math.sqrt(f + 1) * 0.5
    const m = 0.25 / b

    switch (i) {
      case 0:
        dest.w = b
        dest.x = (v12 - v21) * m
        dest.y = (v20 - v02) * m
        dest.z = (v01 - v10) * m

        break

      case 1:
        dest.w = (v12 - v21) * m
        dest.x = b
        dest.y = (v01 + v10) * m
        dest.z = (v20 + v02) * m

        break

      case 2:
        dest.w = (v20 - v02) * m
        dest.x = (v01 + v10) * m
        dest.y = b
        dest.z = (v12 + v21) * m

        break

      case 3:
        dest.w = (v01 - v10) * m
        dest.x = (v20 + v02) * m
        dest.y = (v12 + v21) * m
        dest.z = b

        break
    }

    return dest
  }

  static multiply(m1: mat3, m2: mat3, dest: null | mat3 = null): mat3 {
    if (!dest) {
      dest = new mat3()
    }

    const a00 = m1[0]
    const a01 = m1[1]
    const a02 = m1[2]
    const a10 = m1[3]
    const a11 = m1[4]
    const a12 = m1[5]
    const a20 = m1[6]
    const a21 = m1[7]
    const a22 = m1[8]

    const b00 = m2[0]
    const b01 = m2[1]
    const b02 = m2[2]
    const b10 = m2[3]
    const b11 = m2[4]
    const b12 = m2[5]
    const b20 = m2[6]
    const b21 = m2[7]
    const b22 = m2[8]

    dest.set([
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,

      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,

      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22
    ])

    return dest
  }

  static lookAt(eye: vec3, target: vec3, up: vec3 = vec3.up, dest: null | mat3 = null): mat3 {
    if (!dest) {
      dest = new mat3()
    }

    if (eye.equals(target)) {
      return this.identity.copy(dest)
    }

    const z = vec3.subtract(eye, target).normalize()

    const x = vec3.cross(up, z).normalize()
    const y = vec3.cross(z, x).normalize()

    dest.set([
      x.x,
      x.y,
      x.z,

      y.x,
      y.y,
      y.z,

      z.x,
      z.y,
      z.z
    ])

    return dest
  }

}