import { Epsilon } from './constants'

import { mat2 } from './mat2'

export class vec2 extends Float32Array {

  constructor(values: number[] = [0.0, 0.0]) {
    super(values.slice(0, 2))
  }

  static readonly zero = new vec2([0.0, 0.0])
  static readonly one = new vec2([1.0, 1.0])

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

  get u(): number {
    return this[0]
  }

  set u(u: number) {
    this[0] = u
  }

  get v(): number {
    return this[1]
  }

 set v(v: number) {
    this[1] = v
  }

  get uv(): number[] {
    return Array.from(this)
  }

  set uv(uv: number[]) {
    this.set(uv)
  }

  get length(): number {
    return Math.sqrt(this.squaredLength)
  }

  get squaredLength(): number {
    const x = this.x
    const y = this.y

    return x * x + y * y
  }

  reset(): vec2 {
    this.x = 0.0
    this.y = 0.0

    return this
  }

  copy(dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = new vec2()
    }

    dest.x = this.x
    dest.y = this.y

    return dest
  }

  negate(dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = this
    }

    dest.x = -this.x
    dest.y = -this.y

    return dest
  }

  equals(vector: vec2, threshold = Epsilon): boolean {
    if (Math.abs(this.x - vector.x) > threshold) {
      return false
    }

    if (Math.abs(this.y - vector.y) > threshold) {
      return false
    }

    return true
  }

  add(vector: vec2, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x + vector.x
    dest.y = this.y + vector.y

    return dest
  }

  subtract(vector: vec2, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x - vector.x
    dest.y = this.y - vector.y

    return dest
  }

  multiply(vector: vec2, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x * vector.x
    dest.y = this.y * vector.y

    return dest
  }

  divide(vector: vec2, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x / vector.x
    dest.y = this.y / vector.y

    return dest
  }

  scale(scalar: number, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x * scalar
    dest.y = this.y * scalar

    return dest
  }

  normalize(dest: null | vec2 = null): vec2 {
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

      return dest
    }

    length = 1.0 / length

    dest.x = this.x * length
    dest.y = this.y * length

    return dest
  }

  transform(matrix: mat2, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = this
    }

    return matrix.transform(this, dest)
  }

  static cross(vector: vec2, vector2: vec2, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = new vec2()
    }

    dest.x = vector.x * vector2.y
    dest.y = vector.y * vector2.x

    return dest
  }

  static dot(vector: vec2, vector2: vec2): number {
    return vector.x * vector2.x + vector.y * vector2.y
  }

  static distance(vector: vec2, vector2: vec2): number {
    return Math.sqrt(this.squaredDistance(vector, vector2))
  }

  static squaredDistance(vector: vec2, vector2: vec2): number {
    const x = vector2.x - vector.x
    const y = vector2.y - vector.y

    return x * x + y * y
  }

  static direction(vector: vec2, vector2: vec2, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = new vec2()
    }

    const x = vector.x - vector2.x
    const y = vector.y - vector2.y

    let length = Math.sqrt(x * x + y * y)

    if (length === 0) {
      dest.x = 0
      dest.y = 0

      return dest
    }

    length = 1 / length

    dest.x = x * length
    dest.y = y * length

    return dest
  }

  static mix(vector: vec2, vector2: vec2, time: number, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = new vec2()
    }

    const x = vector.x
    const y = vector.y

    const x2 = vector2.x
    const y2 = vector2.y

    dest.x = x + time * (x2 - x)
    dest.y = y + time * (y2 - y)

    return dest
  }

  static add(vector: vec2, vector2: vec2, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = new vec2()
    }

    dest.x = vector.x + vector2.x
    dest.y = vector.y + vector2.y

    return dest
  }

  static subtract(vector: vec2, vector2: vec2, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = new vec2()
    }

    dest.x = vector.x - vector2.x
    dest.y = vector.y - vector2.y

    return dest
  }

  static multiply(vector: vec2, vector2: vec2, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = new vec2()
    }

    dest.x = vector.x * vector2.x
    dest.y = vector.y * vector2.y

    return dest
  }

  static divide(vector: vec2, vector2: vec2, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = new vec2()
    }

    dest.x = vector.x / vector2.x
    dest.y = vector.y / vector2.y

    return dest
  }

  static scale(vector: vec2, scalar: number, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = new vec2()
    }

    return vector.scale(scalar, dest)
  }

  static normalize(vector: vec2, dest: null | vec2 = null): vec2 {
    if (!dest) {
      dest = new vec2()
    }

    return vector.normalize(dest)
  }

}
