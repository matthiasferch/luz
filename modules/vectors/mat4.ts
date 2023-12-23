import { Epsilon } from './constants'
import { mat3 } from './mat3'
import { quat } from './quat'
import { vec3 } from './vec3'
import { vec4 } from './vec4'

export class mat4 extends Float32Array {

  constructor(values: number[] = [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  ]) {
    super(values.slice(0, 16))
  }

  static readonly identity = new mat4()

  get determinant(): number {
    const v00 = this[0]
    const v01 = this[1]
    const v02 = this[2]
    const v03 = this[3]
    const v10 = this[4]
    const v11 = this[5]
    const v12 = this[6]
    const v13 = this[7]
    const v20 = this[8]
    const v21 = this[9]
    const v22 = this[10]
    const v23 = this[11]
    const v30 = this[12]
    const v31 = this[13]
    const v32 = this[14]
    const v33 = this[15]

    const det00 = v00 * v11 - v01 * v10
    const det01 = v00 * v12 - v02 * v10
    const det02 = v00 * v13 - v03 * v10
    const det03 = v01 * v12 - v02 * v11
    const det04 = v01 * v13 - v03 * v11
    const det05 = v02 * v13 - v03 * v12
    const det06 = v20 * v31 - v21 * v30
    const det07 = v20 * v32 - v22 * v30
    const det08 = v20 * v33 - v23 * v30
    const det09 = v21 * v32 - v22 * v31
    const det10 = v21 * v33 - v23 * v31
    const det11 = v22 * v33 - v23 * v32

    return det00 * det11 - det01 * det10 + det02 * det09 + det03 * det08 - det04 * det07 + det05 * det06
  }

  copy(dest: null | mat4 = null): mat4 {
    if (!dest) {
      dest = new mat4()
    }

    for (let i = 0; i < 16; i++) {
      dest[i] = this[i]
    }

    return dest
  }

  column(index: number, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = new vec4()
    }

    dest.x = this[index]
    dest.y = this[index + 4]
    dest.z = this[index + 8]
    dest.w = this[index + 12]

    return dest
  }

  equals(other: mat4, threshold = Epsilon): boolean {
    for (let i = 0; i < 16; i++) {
      if (Math.abs(this[i] - other[i]) > threshold) {
        return false
      }
    }

    return true
  }

  reset(): mat4 {
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

  transpose(dest: null | mat4 = null): mat4 {
    if (!dest) {
      dest = this
    }

    const t01 = this[1]
    const t02 = this[2]
    const t03 = this[3]
    const t12 = this[6]
    const t13 = this[7]
    const t23 = this[11]

    dest[1] = this[4]
    dest[2] = this[8]
    dest[3] = this[12]

    dest[4] = t01
    dest[6] = this[9]
    dest[7] = this[13]

    dest[8] = t02
    dest[9] = t12
    dest[11] = this[14]

    dest[12] = t03
    dest[13] = t13
    dest[14] = t23

    if (dest !== this) {
      dest[0] = this[0]
      dest[5] = this[5]
      dest[10] = this[10]
      dest[15] = this[15]
    }

    return dest
  }

  invert(dest: null | mat4 = null): null | mat4 {
    if (!dest) {
      dest = this
    }

    const v00 = this[0]
    const v01 = this[1]
    const v02 = this[2]
    const v03 = this[3]
    const v10 = this[4]
    const v11 = this[5]
    const v12 = this[6]
    const v13 = this[7]
    const v20 = this[8]
    const v21 = this[9]
    const v22 = this[10]
    const v23 = this[11]
    const v30 = this[12]
    const v31 = this[13]
    const v32 = this[14]
    const v33 = this[15]

    const d00 = v00 * v11 - v01 * v10
    const d01 = v00 * v12 - v02 * v10
    const d02 = v00 * v13 - v03 * v10
    const d03 = v01 * v12 - v02 * v11
    const d04 = v01 * v13 - v03 * v11
    const d05 = v02 * v13 - v03 * v12
    const d06 = v20 * v31 - v21 * v30
    const d07 = v20 * v32 - v22 * v30
    const d08 = v20 * v33 - v23 * v30
    const d09 = v21 * v32 - v22 * v31
    const d10 = v21 * v33 - v23 * v31
    const d11 = v22 * v33 - v23 * v32

    let d = d00 * d11 - d01 * d10 + d02 * d09 + d03 * d08 - d04 * d07 + d05 * d06

    if (d === 0.0) {
      return null
    }

    d = 1.0 / d

    dest[0] = (v11 * d11 - v12 * d10 + v13 * d09) * d
    dest[1] = (-v01 * d11 + v02 * d10 - v03 * d09) * d
    dest[2] = (v31 * d05 - v32 * d04 + v33 * d03) * d
    dest[3] = (-v21 * d05 + v22 * d04 - v23 * d03) * d

    dest[4] = (-v10 * d11 + v12 * d08 - v13 * d07) * d
    dest[5] = (v00 * d11 - v02 * d08 + v03 * d07) * d
    dest[6] = (-v30 * d05 + v32 * d02 - v33 * d01) * d
    dest[7] = (v20 * d05 - v22 * d02 + v23 * d01) * d

    dest[8] = (v10 * d10 - v11 * d08 + v13 * d06) * d
    dest[9] = (-v00 * d10 + v01 * d08 - v03 * d06) * d
    dest[10] = (v30 * d04 - v31 * d02 + v33 * d00) * d
    dest[11] = (-v20 * d04 + v21 * d02 - v23 * d00) * d

    dest[12] = (-v10 * d09 + v11 * d07 - v12 * d06) * d
    dest[13] = (v00 * d09 - v01 * d07 + v02 * d06) * d
    dest[14] = (-v30 * d03 + v31 * d01 - v32 * d00) * d
    dest[15] = (v20 * d03 - v21 * d01 + v22 * d00) * d

    return dest
  }

  multiply(other: mat4, dest: null | mat4 = null): mat4 {
    if (!dest) {
      dest = this
    }

    const a00 = this[0]
    const a01 = this[1]
    const a02 = this[2]
    const a03 = this[3]
    const a10 = this[4]
    const a11 = this[5]
    const a12 = this[6]
    const a13 = this[7]
    const a20 = this[8]
    const a21 = this[9]
    const a22 = this[10]
    const a23 = this[11]
    const a30 = this[12]
    const a31 = this[13]
    const a32 = this[14]
    const a33 = this[15]

    const b00 = other[0]
    const b01 = other[1]
    const b02 = other[2]
    const b03 = other[3]
    const b10 = other[4]
    const b11 = other[5]
    const b12 = other[6]
    const b13 = other[7]
    const b20 = other[8]
    const b21 = other[9]
    const b22 = other[10]
    const b23 = other[11]
    const b30 = other[12]
    const b31 = other[13]
    const b32 = other[14]
    const b33 = other[15]

    dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30
    dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31
    dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32
    dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33

    dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30
    dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31
    dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32
    dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33

    dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30
    dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31
    dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32
    dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33

    dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30
    dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31
    dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32
    dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33

    return dest
  }

  transform(vector: vec4, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = new vec4()
    }

    const { x, y, z, w } = vector

    dest.x = this[0] * x + this[4] * y + this[8] * z + this[12] * w
    dest.y = this[1] * x + this[5] * y + this[9] * z + this[13] * w
    dest.z = this[2] * x + this[6] * y + this[10] * z + this[14] * w
    dest.w = this[3] * x + this[7] * y + this[11] * z + this[15] * w

    return dest
  }

  transformVec3(vector: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    const { x, y, z } = vector

    dest.x = this[0] * x + this[4] * y + this[8] * z + this[12]
    dest.y = this[1] * x + this[5] * y + this[9] * z + this[13]
    dest.z = this[2] * x + this[6] * y + this[10] * z + this[14]

    return dest
  }

  toMat3(dest: null | mat3 = null): mat3 {
    if (!dest) {
      dest = new mat3()
    }

    dest.set([
      this[0],
      this[1],
      this[2],

      this[4],
      this[5],
      this[6],

      this[8],
      this[9],
      this[10]
    ])

    return dest
  }

  scale(vector: vec3, dest: null | mat4 = null): mat4 {
    if (!dest) {
      dest = this
    }

    const { x, y, z } = vector

    dest[0] = this[0] * x
    dest[1] = this[1] * x
    dest[2] = this[2] * x
    dest[3] = this[3] * x

    dest[4] = this[4] * y
    dest[5] = this[5] * y
    dest[6] = this[6] * y
    dest[7] = this[7] * y

    dest[8] = this[8] * z
    dest[9] = this[9] * z
    dest[10] = this[10] * z
    dest[11] = this[11] * z

    if (dest !== this) {
      dest[12] = this[12]
      dest[13] = this[13]
      dest[14] = this[14]
      dest[15] = this[15]
    }

    return dest
  }

  rotate(angle: number, axis: vec3, dest: null | mat4 = null): null | mat4 {
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
    const a03 = this[3]
    const a10 = this[4]
    const a11 = this[5]
    const a12 = this[6]
    const a13 = this[7]
    const a20 = this[8]
    const a21 = this[9]
    const a22 = this[10]
    const a23 = this[11]

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
    dest[3] = a03 * b00 + a13 * b01 + a23 * b02

    dest[4] = a00 * b10 + a10 * b11 + a20 * b12
    dest[5] = a01 * b10 + a11 * b11 + a21 * b12
    dest[6] = a02 * b10 + a12 * b11 + a22 * b12
    dest[7] = a03 * b10 + a13 * b11 + a23 * b12

    dest[8] = a00 * b20 + a10 * b21 + a20 * b22
    dest[9] = a01 * b20 + a11 * b21 + a21 * b22
    dest[10] = a02 * b20 + a12 * b21 + a22 * b22
    dest[11] = a03 * b20 + a13 * b21 + a23 * b22

    if (dest !== this) {
      dest[12] = this[12]
      dest[13] = this[13]
      dest[14] = this[14]
      dest[15] = this[15]
    }

    return dest
  }

  translate(vector: vec3, dest: null | mat4 = null): mat4 {
    if (!dest) {
      dest = this
    }

    const x = vector.x
    const y = vector.y
    const z = vector.z

    if (dest !== this) {
      for (let it = 0; it < 12; it++) {
        dest[it] = this[it]
      }
    }

    dest[12] = this[12] + this[0] * x + this[4] * y + this[8] * z
    dest[13] = this[13] + this[1] * x + this[5] * y + this[9] * z
    dest[14] = this[14] + this[2] * x + this[6] * y + this[10] * z
    dest[15] = this[15] + this[3] * x + this[7] * y + this[11] * z

    return dest
  }

  decompose(translation: vec3, rotation: mat3, scaling: null | vec3 = null) {
    const v00 = this[0]
    const v01 = this[1]
    const v02 = this[2]
    const v10 = this[4]
    const v11 = this[5]
    const v12 = this[6]
    const v20 = this[8]
    const v21 = this[9]
    const v22 = this[10]
    const v30 = this[12]
    const v31 = this[13]
    const v32 = this[14]

    if (scaling !== null) {
      scaling.x = Math.sqrt(v00 * v00 + v01 * v01 + v02 * v02)
      scaling.y = Math.sqrt(v10 * v10 + v11 * v11 + v12 * v12)
      scaling.z = Math.sqrt(v20 * v20 + v21 * v21 + v22 * v22)
    }

    rotation.set([v00, v01, v02, v10, v11, v12, v20, v21, v22])

    translation.xyz = [v30, v31, v32]
  }

  static construct(rotation: quat, translation: vec3, dest: null | mat4 = null) {
    if (!dest) {
      dest = new mat4()
    }

    const qx = rotation.x
    const qy = rotation.y
    const qz = rotation.z
    const qw = rotation.w

    const vx = translation.x
    const vy = translation.y
    const vz = translation.z

    const x2 = qx + qx
    const y2 = qy + qy
    const z2 = qz + qz
    const xx = qx * x2
    const xy = qx * y2
    const xz = qx * z2
    const yy = qy * y2
    const yz = qy * z2
    const zz = qz * z2
    const wx = qw * x2
    const wy = qw * y2
    const wz = qw * z2

    dest.set([
      1.0 - (yy + zz),
      xy + wz,
      xz - wy,
      0.0,

      xy - wz,
      1.0 - (xx + zz),
      yz + wx,
      0.0,

      xz + wy,
      yz - wx,
      1.0 - (xx + yy),
      0.0,

      vx,
      vy,
      vz,
      1.0
    ])

    return dest
  }

  static multiply(m1: mat4, m2: mat4, dest: null | mat4 = null): mat4 {
    if (!dest) {
      dest = new mat4()
    }

    const a00 = m1[0]
    const a01 = m1[1]
    const a02 = m1[2]
    const a03 = m1[3]
    const a10 = m1[4]
    const a11 = m1[5]
    const a12 = m1[6]
    const a13 = m1[7]
    const a20 = m1[8]
    const a21 = m1[9]
    const a22 = m1[10]
    const a23 = m1[11]
    const a30 = m1[12]
    const a31 = m1[13]
    const a32 = m1[14]
    const a33 = m1[15]

    const b00 = m2[0]
    const b01 = m2[1]
    const b02 = m2[2]
    const b03 = m2[3]
    const b10 = m2[4]
    const b11 = m2[5]
    const b12 = m2[6]
    const b13 = m2[7]
    const b20 = m2[8]
    const b21 = m2[9]
    const b22 = m2[10]
    const b23 = m2[11]
    const b30 = m2[12]
    const b31 = m2[13]
    const b32 = m2[14]
    const b33 = m2[15]

    dest.set([
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,

      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,

      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,

      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
    ])

    return dest
  }

  static frustum(left: number, right: number, bottom: number, top: number, near: number, far: number, dest: null | mat4 = null): mat4 {
    if (!dest) {
      dest = new mat4()
    }

    const rl = right - left
    const tb = top - bottom
    const fn = far - near

    dest.set([
      (near * 2.0) / rl,
      0.0,
      0.0,
      0.0,

      0.0,
      (near * 2.0) / tb,
      0.0,
      0.0,

      (right + left) / rl,
      (top + bottom) / tb,
      -(far + near) / fn,
      -1.0,

      0.0,
      0.0,
      -(far * near * 2.0) / fn,
      0.0
    ])

    return dest
  }

  static perspective(fov: number, aspect: number, near: number, far: number, dest: null | mat4 = null): mat4 {
    if (!dest) {
      dest = new mat4()
    }

    const top = near * Math.tan((fov * Math.PI) / 360.0)
    const right = top * aspect

    return mat4.frustum(-right, right, -top, top, near, far, dest)
  }

  static orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number, dest: null | mat4 = null): mat4 {
    if (!dest) {
      dest = new mat4()
    }

    const rl = right - left
    const tb = top - bottom
    const fn = far - near

    dest.set([
      2.0 / rl,
      0.0,
      0.0,
      0.0,

      0.0,
      2 / tb,
      0.0,
      0.0,

      0.0,
      0.0,
      -2.0 / fn,
      0.0,

      -(left + right) / rl,
      -(top + bottom) / tb,
      -(far + near) / fn,
      1.0
    ])

    return dest
  }

  static reflection(plane: vec4, dest?: mat4) {
    if (!dest) {
      dest = new mat4()
    }

    const xx = plane.x * plane.x
    const xy = plane.x * plane.y
    const xz = plane.x * plane.z
    const xw = plane.x * plane.w
    const yy = plane.y * plane.y
    const yz = plane.y * plane.z
    const yw = plane.y * plane.w
    const zz = plane.z * plane.z
    const zw = plane.z * plane.w

    dest.set([
      1.0 - 2.0 * xx,
      -2.0 * xy,
      -2.0 * xz,
      -2.0 * xw,

      -2.0 * xy,
      1.0 - 2.0 * yy,
      -2.0 * yz,
      -2.0 * yw,

      -2.0 * xz,
      -2.0 * yz,
      1.0 - 2.0 * zz,
      -2.0 * zw,

      0.0,
      0.0,
      0.0,
      1.0
    ])

    return dest
  }

  static lookAt(eye: vec3, target: vec3, up: vec3 = vec3.up, dest: null | mat4 = null): mat4 {
    if (!dest) {
      dest = new mat4()
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
      0.0,

      y.x,
      y.y,
      y.z,
      0.0,

      z.x,
      z.y,
      z.z,
      0.0,

      eye.x,
      eye.y,
      eye.z,
      1.0
    ])

    return dest
  }

}