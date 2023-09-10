import { Epsilon } from './constants'
import { mat4 } from './mat4'

const { min, max, abs, sqrt } = Math

export class vec4 extends Float32Array {

  static readonly zero: Readonly<vec4> = new vec4([0.0, 0.0, 0.0, 1.0])
  static readonly one: Readonly<vec4> = new vec4([1.0, 1.0, 1.0, 1.0])

  constructor(values: number[] = [0.0, 0.0, 0.0, 1.0]) {
    super(values.slice(0, 4))
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

  get xyzw(): number[] {
    return Array.from(this)
  }

  set xyzw(xyzw: number[]) {
    this.set(xyzw)
  }

  get length(): number {
    return sqrt(this.squaredLength)
  }

  get squaredLength(): number {
    const { x, y, z, w } = this

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
    if (abs(this.x - vector.x) > threshold) {
      return false
    }

    if (abs(this.y - vector.y) > threshold) {
      return false
    }

    if (abs(this.z - vector.z) > threshold) {
      return false
    }

    if (abs(this.w - vector.w) > threshold) {
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

  toJSON() {
    const { x, y, z, w } = this

    return [x, y, z, w]
  }

  static absolute(vector: vec4, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = new vec4()
    }

    dest.x = abs(vector.x)
    dest.y = abs(vector.y)
    dest.z = abs(vector.z)
    dest.w = abs(vector.w)

    return dest
  }

  static minimum(vector: vec4, vector2: vec4, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = new vec4()
    }

    dest.x = min(vector.x, vector2.x)
    dest.y = min(vector.y, vector2.y)
    dest.z = min(vector.z, vector2.z)
    dest.z = min(vector.w, vector2.w)

    return dest
  }

  static maximum(vector: vec4, vector2: vec4, dest: null | vec4 = null): vec4 {
    if (!dest) {
      dest = new vec4()
    }

    dest.x = max(vector.x, vector2.x)
    dest.y = max(vector.y, vector2.y)
    dest.z = max(vector.z, vector2.z)
    dest.z = max(vector.w, vector2.w)

    return dest
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

  static sum(...vectors: vec4[]): vec4 {
    const dest = new vec4()
  
    for (const vector of vectors) {
      dest.x += vector.x
      dest.y += vector.y
      dest.z += vector.z
      dest.w += vector.w
    }
  
    return dest
  }

  static difference(...vectors: vec4[]): vec4 {
    const dest = new vec4()
  
    for (const vector of vectors) {
      dest.x -= vector.x
      dest.y -= vector.y
      dest.z -= vector.z
      dest.w -= vector.w
    }
  
    return dest
  }

  static product(...vectors: vec4[]): vec4 {
    const dest = new vec4()
  
    for (const vector of vectors) {
      dest.x *= vector.x
      dest.y *= vector.y
      dest.z *= vector.z
      dest.w *= vector.w
    }
  
    return dest
  }

  static division(...vectors: vec4[]): vec4 {
    const dest = new vec4()
  
    for (const vector of vectors) {
      dest.x /= vector.x
      dest.y /= vector.y
      dest.z /= vector.z
      dest.w /= vector.w
    }
  
    return dest
  }

}