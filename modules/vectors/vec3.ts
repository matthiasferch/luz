import { Epsilon } from './constants'
import { mat3 } from './mat3'

const { min, max, abs, sqrt } = Math

export class vec3 extends Float32Array {
  static readonly zero: vec3 = new vec3([0.0, 0.0, 0.0])
  static readonly one: vec3 = new vec3([1.0, 1.0, 1.0])

  static readonly grey: vec3 = new vec3([0.8, 0.8, 0.8])

  static readonly right: vec3 = new vec3([1.0, 0.0, 0.0])
  static readonly left: vec3 = new vec3([-1.0, 0.0, 0.0])

  static readonly up: vec3 = new vec3([0.0, 1.0, 0.0])
  static readonly down: vec3 = new vec3([0.0, -1.0, 0.0])

  static readonly forward: vec3 = new vec3([0.0, 0.0, 1.0])
  static readonly backward: vec3 = new vec3([0.0, 0.0, -1.0])

  static readonly axes: vec3[] = [vec3.right, vec3.up, vec3.forward]

  static readonly infinity: vec3 = new vec3([Infinity, Infinity, Infinity])

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

  get rgb(): number[] {
    return Array.from(this)
  }

  set rgb(rgb: number[]) {
    this.set(rgb)
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

    return normal
      .copy(dest)
      .scale(-2.0 * vec3.dot(this, normal))
      .add(this)
  }

  transform(matrix: mat3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = this
    }

    return matrix.transform(this, dest)
  }

  interpolate(v2: vec3, time: number, dest: null | vec3 = null): vec3 {
    return vec3.interpolate(this, v2, time, dest)
  }

  serialize() {
    const { x, y, z } = this

    return [x, y, z]
  }

  static async deserialize(values: number[]) {
    return new vec3(values)
  }

  static interpolate(v1: vec3, v2: vec3, time: number, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    if (time <= 0.0) {
      return v1.copy(dest)
    }

    if (time >= 1.0) {
      return v2.copy(dest)
    }

    return v1
      .copy(dest)
      .scale(1.0 - time)
      .add(v2.copy().scale(time))
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

  static minimum(v1: vec3, v2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = min(v1.x, v2.x)
    dest.y = min(v1.y, v2.y)
    dest.z = min(v1.z, v2.z)

    return dest
  }

  static maximum(v1: vec3, v2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = max(v1.x, v2.x)
    dest.y = max(v1.y, v2.y)
    dest.z = max(v1.z, v2.z)

    return dest
  }

  static cross(v1: vec3, v2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    const x = v1.x
    const y = v1.y
    const z = v1.z

    const x2 = v2.x
    const y2 = v2.y
    const z2 = v2.z

    dest.x = y * z2 - z * y2
    dest.y = z * x2 - x * z2
    dest.z = x * y2 - y * x2

    return dest
  }

  static dot(v1: vec3, v2: vec3): number {
    const x = v1.x
    const y = v1.y
    const z = v1.z

    const x2 = v2.x
    const y2 = v2.y
    const z2 = v2.z

    return x * x2 + y * y2 + z * z2
  }

  static distance(v1: vec3, v2: vec3): number {
    return sqrt(this.squaredDistance(v1, v2))
  }

  static squaredDistance(v1: vec3, v2: vec3): number {
    const x = v2.x - v1.x
    const y = v2.y - v1.y
    const z = v2.z - v1.z

    return x * x + y * y + z * z
  }

  static direction(v1: vec3, v2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    const x = v1.x - v2.x
    const y = v1.y - v2.y
    const z = v1.z - v2.z

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

  static mix(v1: vec3, v2: vec3, time: number, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = v1.x + time * (v2.x - v1.x)
    dest.y = v1.y + time * (v2.y - v1.y)
    dest.z = v1.z + time * (v2.z - v1.z)

    return dest
  }

  static add(v1: vec3, v2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = v1.x + v2.x
    dest.y = v1.y + v2.y
    dest.z = v1.z + v2.z

    return dest
  }

  static subtract(v1: vec3, v2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = v1.x - v2.x
    dest.y = v1.y - v2.y
    dest.z = v1.z - v2.z

    return dest
  }

  static multiply(v1: vec3, v2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = v1.x * v2.x
    dest.y = v1.y * v2.y
    dest.z = v1.z * v2.z

    return dest
  }

  static divide(v1: vec3, v2: vec3, dest: null | vec3 = null): vec3 {
    if (!dest) {
      dest = new vec3()
    }

    dest.x = v1.x / v2.x
    dest.y = v1.y / v2.y
    dest.z = v1.z / v2.z

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
