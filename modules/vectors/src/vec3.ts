import { Epsilon } from './constants'
import { mat3 } from './mat3'

const { min, max, abs, sqrt } = Math

export class vec3 extends Float32Array {

  static readonly zero = new vec3([0.0, 0.0, 0.0])
  static readonly one = new vec3([1.0, 1.0, 1.0])

  static readonly up = new vec3([0.0, 1.0, 0.0])
  static readonly right = new vec3([1.0, 0.0, 0.0])
  static readonly forward = new vec3([0.0, 0.0, 1.0])

  static readonly infinity = new vec3([Infinity, Infinity, Infinity])

  constructor(values: number[] = [0.0, 0.0, 0.0]) {
    super(values.slice(0, 3))
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

  get xyz(): number[] {
    return Array.from(this)
  }

  set xyz(xyz: number[]) {
    this.set(xyz)
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

  get rgb(): number[] {
    return Array.from(this)
  }

  set rgb(xyz: number[]) {
    this.set(xyz)
  }

  get length(): number {
    return sqrt(this.squaredLength)
  }

  get squaredLength(): number {
    const { x, y, z } = this

    return x * x + y * y + z * z
  }

  reset(): vec3 {
    this.x = 0.0
    this.y = 0.0
    this.z = 0.0

    return this
  }

  copy(dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = this.x
    dest.y = this.y
    dest.z = this.z

    return dest
  }

  negate(dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = this
    }

    dest.x = -this.x
    dest.y = -this.y
    dest.z = -this.z

    return dest
  }

  equals(vector: vec3, threshold = Epsilon): boolean {
    if (abs(this.x - vector.x) > threshold) {
      return false
    }

    if (abs(this.y - vector.y) > threshold) {
      return false
    }

    if (abs(this.z - vector.z) > threshold) {
      return false
    }

    return true
  }

  add(vector: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x + vector.x
    dest.y = this.y + vector.y
    dest.z = this.z + vector.z

    return dest
  }

  subtract(vector: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x - vector.x
    dest.y = this.y - vector.y
    dest.z = this.z - vector.z

    return dest
  }

  multiply(vector: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x * vector.x
    dest.y = this.y * vector.y
    dest.z = this.z * vector.z

    return dest
  }

  divide(vector: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x / vector.x
    dest.y = this.y / vector.y
    dest.z = this.z / vector.z

    return dest
  }

  scale(scalar: number, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = this
    }

    dest.x = this.x * scalar
    dest.y = this.y * scalar
    dest.z = this.z * scalar

    return dest
  }

  normalize(dest: null | vec3 = null): vec3 {
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

      return dest
    }

    length = 1.0 / length

    dest.x = this.x * length
    dest.y = this.y * length
    dest.z = this.z * length

    return dest
  }

  reflect(normal: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = this
    }

    return normal.copy(dest).scale(-2.0 * vec3.dot(this, normal)).add(this)
  }

  transform(matrix: mat3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = this
    }

    return matrix.transform(this, dest)
  }

  toJSON() {
    const { x, y, z } = this

    return [x, y, z]
  }

  static axis(index: number) {
    if (index === 0) {
      return vec3.right
    }

    if (index === 1) {
      return vec3.up
    }

    if (index === 2) {
      return vec3.forward
    }
  }

  static absolute(vector: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = abs(vector.x)
    dest.y = abs(vector.y)
    dest.z = abs(vector.z)

    return dest
  }

  static minimum(vector: vec3, vector2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = min(vector.x, vector2.x)
    dest.y = min(vector.y, vector2.y)
    dest.z = min(vector.z, vector2.z)

    return dest
  }

  static maximum(vector: vec3, vector2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = max(vector.x, vector2.x)
    dest.y = max(vector.y, vector2.y)
    dest.z = max(vector.z, vector2.z)

    return dest
  }

  static cross(vector: vec3, vector2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    const x = vector.x
    const y = vector.y
    const z = vector.z

    const x2 = vector2.x
    const y2 = vector2.y
    const z2 = vector2.z

    dest.x = y * z2 - z * y2
    dest.y = z * x2 - x * z2
    dest.z = x * y2 - y * x2

    return dest
  }

  static dot(vector: vec3, vector2: vec3): number {
    const x = vector.x
    const y = vector.y
    const z = vector.z

    const x2 = vector2.x
    const y2 = vector2.y
    const z2 = vector2.z

    return x * x2 + y * y2 + z * z2
  }

  static distance(vector: vec3, vector2: vec3): number {
    return sqrt(this.squaredDistance(vector, vector2))
  }

  static squaredDistance(vector: vec3, vector2: vec3): number {
    const x = vector2.x - vector.x
    const y = vector2.y - vector.y
    const z = vector2.z - vector.z

    return x * x + y * y + z * z
  }

  static direction(vector: vec3, vector2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    const x = vector.x - vector2.x
    const y = vector.y - vector2.y
    const z = vector.z - vector2.z

    let length = sqrt(x * x + y * y + z * z)

    if (length === 0) {
      dest.x = 0
      dest.y = 0
      dest.z = 0

      return dest
    }

    length = 1 / length

    dest.x = x * length
    dest.y = y * length
    dest.z = z * length

    return dest
  }

  static mix(vector: vec3, vector2: vec3, time: number, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = vector.x + time * (vector2.x - vector.x)
    dest.y = vector.y + time * (vector2.y - vector.y)
    dest.z = vector.z + time * (vector2.z - vector.z)

    return dest
  }

  static add(vector: vec3, vector2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = vector.x + vector2.x
    dest.y = vector.y + vector2.y
    dest.z = vector.z + vector2.z

    return dest
  }

  static subtract(vector: vec3, vector2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = vector.x - vector2.x
    dest.y = vector.y - vector2.y
    dest.z = vector.z - vector2.z

    return dest
  }

  static multiply(vector: vec3, vector2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = vector.x * vector2.x
    dest.y = vector.y * vector2.y
    dest.z = vector.z * vector2.z

    return dest
  }

  static divide(vector: vec3, vector2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = vector.x / vector2.x
    dest.y = vector.y / vector2.y
    dest.z = vector.z / vector2.z

    return dest
  }

  static scale(vector: vec3, scalar: number, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    return vector.scale(scalar, dest)
  }

  static normalize(vector: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    return vector.normalize(dest)
  }

  static sum(...vectors: vec3[]): vec3 {
    const dest = new vec3()
  
    for (const vector of vectors) {
      dest.x += vector.x
      dest.y += vector.y
      dest.z += vector.z
    }
  
    return dest
  }

  static difference(...vectors: vec3[]): vec3 {
    const dest = new vec3()
  
    for (const vector of vectors) {
      dest.x -= vector.x
      dest.y -= vector.y
      dest.z -= vector.z
    }
  
    return dest
  }

  static product(...vectors: vec3[]): vec3 {
    const dest = new vec3()
  
    for (const vector of vectors) {
      dest.x *= vector.x
      dest.y *= vector.y
      dest.z *= vector.z
    }
  
    return dest
  }

  static division(...vectors: vec3[]): vec3 {
    const dest = new vec3()
  
    for (const vector of vectors) {
      dest.x /= vector.x
      dest.y /= vector.y
      dest.z /= vector.z
    }
  
    return dest
  }

}