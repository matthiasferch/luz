import { Epsilon } from './constants'

import { mat3 } from './mat3'
import { mat4 } from './mat4'
import { vec3 } from './vec3'

export class quat extends Float32Array {

  constructor(values: number[] = [0.0, 0.0, 0.0, 1.0]) {
    super(values.slice(0, 4))
  }

  static readonly identity = new quat()

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

  get yaw(): number {
    return Math.asin(2.0 * (this.x * this.z - this.w * this.y))
  }

  set yaw(yaw: number) {
    quat.fromEulerAngles(yaw, this.pitch, this.roll, this)
  }

  get pitch(): number {
    const x = this.x
    const y = this.y
    const z = this.z
    const w = this.w

    return Math.atan2(2.0 * (y * z + w * x), w * w - x * x - y * y + z * z)
  }

  set pitch(pitch: number) {
    quat.fromEulerAngles(this.yaw, pitch, this.roll, this)
  }

  get roll(): number {
    const x = this.x
    const y = this.y
    const z = this.z
    const w = this.w

    return Math.atan2(2.0 * (x * y + w * z), w * w + x * x - y * y - z * z)
  }

  set roll(roll: number) {
    quat.fromEulerAngles(this.yaw, this.pitch, roll, this)
  }

  get length(): number {
    return Math.sqrt(this.squaredLength)
  }

  get squaredLength(): number {
    const x = this.x
    const y = this.y
    const z = this.z
    const w = this.w

    return x * x + y * y + z * z + w * w
  }

  copy(dest: null | quat = null): quat {
    if (!dest) {
      dest = new quat()
    }

    for (let i = 0; i < 4; i++) {
      dest[i] = this[i]
    }

    return dest
  }

  reset(): quat {
    this.x = 0.0
    this.y = 0.0
    this.z = 0.0
    this.w = 1.0

    return this
  }

  calculateW(): quat {
    const x = this.x
    const y = this.y
    const z = this.z

    this.w = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z))

    return this
  }

  invert(dest: null | quat = null): quat {
    if (!dest) {
      dest = this
    }

    const dot = quat.dot(this, this)

    if (!dot) {
      dest.set([0.0, 0.0, 0.0, 0.0])

      return dest
    }

    const invDot = dot ? 1.0 / dot : 0.0

    dest.x = this.x * -invDot
    dest.y = this.y * -invDot
    dest.z = this.z * -invDot
    dest.w = this.w * invDot

    return dest
  }

  conjugate(dest: null | quat = null): quat {
    if (!dest) {
      dest = this
    }

    dest.x = this.x * -1
    dest.y = this.y * -1
    dest.z = this.z * -1
    dest.w = this.w

    return dest
  }

  normalize(dest: null | quat = null): quat {
    if (!dest) {
      dest = this
    }

    const x = this.x
    const y = this.y
    const z = this.z
    const w = this.w

    let length = Math.sqrt(x * x + y * y + z * z + w * w)

    if (!length) {
      dest.x = 0
      dest.y = 0
      dest.z = 0
      dest.w = 0

      return dest
    }

    length = 1 / length

    dest.x = x * length
    dest.y = y * length
    dest.z = z * length
    dest.w = w * length

    return dest
  }

  equals(q: quat, threshold = Epsilon): boolean {
    if (Math.abs(this.x - q.x) > threshold) {
      return false
    }

    if (Math.abs(this.y - q.y) > threshold) {
      return false
    }

    if (Math.abs(this.z - q.z) > threshold) {
      return false
    }

    if (Math.abs(this.w - q.w) > threshold) {
      return false
    }

    return true
  }

  add(other: quat, dest: null | quat = null): quat {
    if (!dest) {
      dest = this
    }

    dest.x = this.x + other.x
    dest.y = this.y + other.y
    dest.z = this.z + other.z
    dest.w = this.w + other.w

    return dest
  }

  multiply(other: quat, dest: null | quat = null): quat {
    if (!dest) {
      dest = this
    }

    const q1x = this.x
    const q1y = this.y
    const q1z = this.z
    const q1w = this.w

    const q2x = other.x
    const q2y = other.y
    const q2z = other.z
    const q2w = other.w

    dest.x = q1x * q2w + q1w * q2x + q1y * q2z - q1z * q2y
    dest.y = q1y * q2w + q1w * q2y + q1z * q2x - q1x * q2z
    dest.z = q1z * q2w + q1w * q2z + q1x * q2y - q1y * q2x
    dest.w = q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z

    return dest
  }

  toMat3(dest: null | mat3 = null): mat3 {
    if (!dest) {
      dest = new mat3()
    }

    const x = this.x
    const y = this.y
    const z = this.z
    const w = this.w

    const x2 = x + x
    const y2 = y + y
    const z2 = z + z

    const xx = x * x2
    const xy = x * y2
    const xz = x * z2
    const yy = y * y2
    const yz = y * z2
    const zz = z * z2
    const wx = w * x2
    const wy = w * y2
    const wz = w * z2

    dest.set([
      1.0 - (yy + zz),
      xy + wz,
      xz - wy,

      xy - wz,
      1.0 - (xx + zz),
      yz + wx,

      xz + wy,
      yz - wx,
      1.0 - (xx + yy)
    ])

    return dest
  }

  toMat4(dest: null | mat4 = null): mat4 {
    if (!dest) {
      dest = new mat4()
    }

    const x = this.x
    const y = this.y
    const z = this.z
    const w = this.w

    const x2 = x + x
    const y2 = y + y
    const z2 = z + z

    const xx = x * x2
    const xy = x * y2
    const xz = x * z2
    const yy = y * y2
    const yz = y * z2
    const zz = z * z2
    const wx = w * x2
    const wy = w * y2
    const wz = w * z2

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

      0.0,
      0.0,
      0.0,
      1.0
    ])

    return dest
  }

  static dot(q1: quat, q2: quat): number {
    return q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w
  }

  static add(q1: quat, q2: quat, dest: null | quat = null): quat {
    if (!dest) {
      dest = new quat()
    }

    dest.x = q1.x + q2.x
    dest.y = q1.y + q2.y
    dest.z = q1.z + q2.z
    dest.w = q1.w + q2.w

    return dest
  }

  static multiply(q1: quat, q2: quat, dest: null | quat = null): quat {
    if (!dest) {
      dest = new quat()
    }

    const q1x = q1.x
    const q1y = q1.y
    const q1z = q1.z
    const q1w = q1.w

    const q2x = q2.x
    const q2y = q2.y
    const q2z = q2.z
    const q2w = q2.w

    dest.x = q1x * q2w + q1w * q2x + q1y * q2z - q1z * q2y
    dest.y = q1y * q2w + q1w * q2y + q1z * q2x - q1x * q2z
    dest.z = q1z * q2w + q1w * q2z + q1x * q2y - q1y * q2x
    dest.w = q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z

    return dest
  }

  static cross(q1: quat, q2: quat, dest: null | quat = null): quat {
    if (!dest) {
      dest = new quat()
    }

    const q1x = q1.x
    const q1y = q1.y
    const q1z = q1.z
    const q1w = q1.w

    const q2x = q2.x
    const q2y = q2.y
    const q2z = q2.z
    const q2w = q2.w

    dest.x = q1w * q2z + q1z * q2w + q1x * q2y - q1y * q2x
    dest.y = q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z
    dest.z = q1w * q2x + q1x * q2w + q1y * q2z - q1z * q2y
    dest.w = q1w * q2y + q1y * q2w + q1z * q2x - q1x * q2z

    return dest
  }

  static mix(q1: quat, q2: quat, time: number, dest: null | quat = null): quat {
    if (!dest) {
      dest = new quat()
    }

    if (time <= 0.0) {
      q1.copy(dest)

      return dest
    } else if (time >= 1.0) {
      q2.copy(dest)

      return dest
    }

    let cos = quat.dot(q1, q2)
    const q2a = q2.copy(dest)

    if (cos < 0.0) {
      q2a.invert()
      cos = -cos
    }

    let k0: number
    let k1: number

    if (cos > 1 - Epsilon) {
      k0 = 1 - time
      k1 = 0 + time
    } else {
      const sin: number = Math.sqrt(1 - cos * cos)
      const angle: number = Math.atan2(sin, cos)

      const oneOverSin: number = 1 / sin

      k0 = Math.sin((1 - time) * angle) * oneOverSin
      k1 = Math.sin((0 + time) * angle) * oneOverSin
    }

    dest.x = k0 * q1.x + k1 * q2a.x
    dest.y = k0 * q1.y + k1 * q2a.y
    dest.z = k0 * q1.z + k1 * q2a.z
    dest.w = k0 * q1.w + k1 * q2a.w

    return dest
  }

  static fromAxisAngle(axis: vec3, angle: number, dest: null | quat = null): quat {
    if (!dest) {
      dest = new quat()
    }

    const a = angle * 0.5
    const sin = Math.sin(a)

    dest.x = axis.x * sin
    dest.y = axis.y * sin
    dest.z = axis.z * sin
    dest.w = Math.cos(a)

    return dest
  }

  static fromEulerAngles(yaw: number, pitch: number, roll: number, dest: null | quat = null): quat {
    if (!dest) {
      dest = new quat()
    }

    const y = yaw * 0.5
    const r = roll * 0.5
    const p = pitch * 0.5

    const c1 = Math.cos(y)
    const s1 = Math.sin(y)
    const c2 = Math.cos(r)
    const s2 = Math.sin(r)
    const c3 = Math.cos(p)
    const s3 = Math.sin(p)

    const c1c2 = c1 * c2
    const s1s2 = s1 * s2

    dest.x = c1c2 * s3 + s1s2 * c3
    dest.y = s1 * c2 * c3 + c1 * s2 * s3
    dest.z = c1 * s2 * c3 - s1 * c2 * s3
    dest.w = c1c2 * c3 - s1s2 * s3

    return dest
  }

}