import { Epsilon } from './constants'

import { mat4 } from './mat4'

export class vec4 extends Float32Array {

  constructor(values: number[] = [0.0, 0.0, 0.0, 1.0]) {
    super(values.slice(0, 4))
  }

  static readonly zero = new vec4([0.0, 0.0, 0.0, 1.0])
  static readonly one = new vec4([1.0, 1.0, 1.0, 1.0])

  static readonly up = new vec4([0.0, 1.0, 0.0, 0.0])
  static readonly right = new vec4([1.0, 0.0, 0.0, 0.0])
  static readonly forward = new vec4([0.0, 0.0, 1.0, 0.0])

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

  get xyzw(): number[] {
    return Array.from(this)
  }

  set xyzw(xyzw: number[]) {
    this.set(xyzw)
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

  get rgba(): number[] {
    return Array.from(this)
  }

  set rgba(rgba: number[]) {
    this.set(rgba)
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

  reset(): vec4 {
    this.x = 0.0
    this.y = 0.0
    this.z = 0.0
    this.w = 1.0

    return this
  }

  copy(dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = new vec4()
    }

    dest.x = this.x
    dest.y = this.y
    dest.z = this.z
    dest.w = this.w

    return dest
  }

  negate(dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = this
    }

    dest.x = -this.x
    dest.y = -this.y
    dest.z = -this.z
    dest.w = -this.w

    return dest
  }

  equals(vector: vec4, threshold = Epsilon): boolean {
    if (Math.abs(this.x - vector.x) > threshold) {
      return false
    }

    if (Math.abs(this.y - vector.y) > threshold) {
      return false
    }

    if (Math.abs(this.z - vector.z) > threshold) {
      return false
    }

    if (Math.abs(this.w - vector.w) > threshold) {
      return false
    }

    return true
  }

  add(vector: vec4, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x + vector.x
    dest.y = this.y + vector.y
    dest.z = this.z + vector.z
    dest.w = this.w + vector.w

    return dest
  }

  subtract(vector: vec4, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x - vector.x
    dest.y = this.y - vector.y
    dest.z = this.z - vector.z
    dest.w = this.w - vector.w

    return dest
  }

  multiply(vector: vec4, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x * vector.x
    dest.y = this.y * vector.y
    dest.z = this.z * vector.z
    dest.w = this.w * vector.w

    return dest
  }

  divide(vector: vec4, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x / vector.x
    dest.y = this.y / vector.y
    dest.z = this.z / vector.z
    dest.w = this.w / vector.w

    return dest
  }

  scale(scalar: number, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x * scalar
    dest.y = this.y * scalar
    dest.z = this.z * scalar
    dest.w = this.w * scalar

    return dest
  }

  normalize(dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = this
    }

    let length = this.length

    if (length === 1) {
      return this
    }

    if (length === 0) {
      dest.x = 0
      dest.y = 0
      dest.z = 0
      dest.w = 0

      return dest
    }

    length = 1.0 / length

    dest.x = this.x * length
    dest.y = this.y * length
    dest.z = this.z * length
    dest.w = this.w * length

    return dest
  }

  transform(matrix: mat4, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = this
    }

    return matrix.transform(this, dest)
  }

  static mix(vector: vec4, vector2: vec4, time: number, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = new vec4()
    }

    dest.x = vector.x + time * (vector2.x - vector.x)
    dest.y = vector.y + time * (vector2.y - vector.y)
    dest.z = vector.z + time * (vector2.z - vector.z)
    dest.w = vector.w + time * (vector2.w - vector.w)

    return dest
  }

  static add(vector: vec4, vector2: vec4, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = new vec4()
    }

    dest.x = vector.x + vector2.x
    dest.y = vector.y + vector2.y
    dest.z = vector.z + vector2.z
    dest.w = vector.w + vector2.w

    return dest
  }

  static subtract(vector: vec4, vector2: vec4, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = new vec4()
    }

    dest.x = vector.x - vector2.x
    dest.y = vector.y - vector2.y
    dest.z = vector.z - vector2.z
    dest.w = vector.w - vector2.w

    return dest
  }

  static multiply(vector: vec4, vector2: vec4, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = new vec4()
    }

    dest.x = vector.x * vector2.x
    dest.y = vector.y * vector2.y
    dest.z = vector.z * vector2.z
    dest.w = vector.w * vector2.w

    return dest
  }

  static divide(vector: vec4, vector2: vec4, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = new vec4()
    }

    dest.x = vector.x / vector2.x
    dest.y = vector.y / vector2.y
    dest.z = vector.z / vector2.z
    dest.w = vector.w / vector2.w

    return dest
  }

  static scale(vector: vec4, scalar: number, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = new vec4()
    }

    return vector.scale(scalar, dest)
  }

  static normalize(vector: vec4, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = new vec4()
    }

    return vector.normalize(dest)
  }

}