import type { Tuple4 } from '@luz/formats'
import { readValues } from './definition'
import { Epsilon } from './epsilon'
import { Matrix3 } from './matrix3'
import { Matrix4 } from './matrix4'
import { Vector3 } from './vector3'

export class Quaternion extends Float32Array {
  constructor(values: ArrayLike<number> = [0.0, 0.0, 0.0, 1.0]) {
    if (values.length !== 4) {
      throw new RangeError('Quaternion requires exactly 4 components')
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
  ): Quaternion
  static from<T>(
    values: ArrayLike<T> | Iterable<T>,
    mapValue: (value: T, index: number) => number,
    thisArgument?: unknown
  ): Quaternion
  static from<T>(
    values: ArrayLike<T> | Iterable<T>,
    mapValue?: (value: T, index: number) => number,
    thisArgument?: unknown
  ): Quaternion {
    const components = mapValue
      ? Array.from(values, (value, index) => mapValue.call(thisArgument, value, index))
      : Array.from(values as ArrayLike<number> | Iterable<number>)

    return new Quaternion(components)
  }

  static of(...values: number[]): Quaternion {
    return new Quaternion(values)
  }

  static createIdentity(destination = new Quaternion()): Quaternion {
    return destination.reset()
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

  // Radians.
  get yaw(): number {
    const { x, y, z, w } = this

    return Math.atan2(2.0 * (w * y - x * z), w * w + x * x - y * y - z * z)
  }

  set yaw(yaw: number) {
    Quaternion.setFromEulerAngles(yaw, this.pitch, this.roll, this)
  }

  // Radians.
  get pitch(): number {
    const { x, y, z, w } = this

    return Math.atan2(2.0 * (w * x - y * z), w * w - x * x + y * y - z * z)
  }

  set pitch(pitch: number) {
    Quaternion.setFromEulerAngles(this.yaw, pitch, this.roll, this)
  }

  // Radians.
  get roll(): number {
    const { x, y, z, w } = this
    const squaredMagnitude = x * x + y * y + z * z + w * w

    if (squaredMagnitude === 0) {
      return 0
    }

    const sine = Math.max(-1.0, Math.min(1.0, (2.0 * (x * y + w * z)) / squaredMagnitude))

    return Math.asin(sine)
  }

  set roll(roll: number) {
    Quaternion.setFromEulerAngles(this.yaw, this.pitch, roll, this)
  }

  get magnitude(): number {
    return Math.sqrt(this.squaredMagnitude)
  }

  get squaredMagnitude(): number {
    const { x, y, z, w } = this

    return x * x + y * y + z * z + w * w
  }

  clone(): Quaternion {
    return new Quaternion(this)
  }

  copyTo(destination: Quaternion): Quaternion {
    destination.set(this)

    return destination
  }

  copyFrom(source: Quaternion): this {
    this.set(source)

    return this
  }

  reset(): Quaternion {
    this.x = 0.0
    this.y = 0.0
    this.z = 0.0
    this.w = 1.0

    return this
  }

  calculateW(): Quaternion {
    const { x, y, z } = this

    this.w = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z))

    return this
  }

  invert(destination: Quaternion = this): Quaternion {
    if (!this.tryInvert(destination)) {
      throw new RangeError('Quaternion has no finite inverse')
    }

    return destination
  }

  tryInvert(destination: Quaternion = this): boolean {
    const squaredMagnitude = this.squaredMagnitude

    if (!Number.isFinite(squaredMagnitude) || squaredMagnitude === 0) {
      return false
    }

    const inverseMagnitude = 1 / squaredMagnitude
    const x = Math.fround(-this.x * inverseMagnitude)
    const y = Math.fround(-this.y * inverseMagnitude)
    const z = Math.fround(-this.z * inverseMagnitude)
    const w = Math.fround(this.w * inverseMagnitude)

    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z) || !Number.isFinite(w)) {
      return false
    }

    destination.x = x
    destination.y = y
    destination.z = z
    destination.w = w

    return true
  }

  conjugate(destination?: Quaternion): Quaternion {
    if (!destination) {
      destination = this
    }

    destination.x = this.x * -1
    destination.y = this.y * -1
    destination.z = this.z * -1
    destination.w = this.w

    return destination
  }

  normalize(destination?: Quaternion): Quaternion {
    if (!destination) {
      destination = this
    }

    const { x, y, z, w } = this

    let magnitude = Math.sqrt(x * x + y * y + z * z + w * w)

    if (!magnitude) {
      destination.x = 0
      destination.y = 0
      destination.z = 0
      destination.w = 0

      return destination
    }

    magnitude = 1 / magnitude
    destination.x = x * magnitude
    destination.y = y * magnitude
    destination.z = z * magnitude
    destination.w = w * magnitude

    return destination
  }

  equals(quaternion: Quaternion, threshold = Epsilon): boolean {
    if (Math.abs(this.x - quaternion.x) > threshold) {
      return false
    }

    if (Math.abs(this.y - quaternion.y) > threshold) {
      return false
    }

    if (Math.abs(this.z - quaternion.z) > threshold) {
      return false
    }

    if (Math.abs(this.w - quaternion.w) > threshold) {
      return false
    }

    return true
  }

  add(otherQuaternion: Quaternion, destination?: Quaternion): Quaternion {
    if (!destination) {
      destination = this
    }

    destination.x = this.x + otherQuaternion.x
    destination.y = this.y + otherQuaternion.y
    destination.z = this.z + otherQuaternion.z
    destination.w = this.w + otherQuaternion.w

    return destination
  }

  multiply(otherQuaternion: Quaternion, destination?: Quaternion): Quaternion {
    if (!destination) {
      destination = this
    }

    const firstQuaternionX = this.x
    const firstQuaternionY = this.y
    const firstQuaternionZ = this.z
    const firstQuaternionW = this.w

    const secondQuaternionX = otherQuaternion.x
    const secondQuaternionY = otherQuaternion.y
    const secondQuaternionZ = otherQuaternion.z
    const secondQuaternionW = otherQuaternion.w

    destination.x =
      firstQuaternionX * secondQuaternionW +
      firstQuaternionW * secondQuaternionX +
      firstQuaternionY * secondQuaternionZ -
      firstQuaternionZ * secondQuaternionY
    destination.y =
      firstQuaternionY * secondQuaternionW +
      firstQuaternionW * secondQuaternionY +
      firstQuaternionZ * secondQuaternionX -
      firstQuaternionX * secondQuaternionZ
    destination.z =
      firstQuaternionZ * secondQuaternionW +
      firstQuaternionW * secondQuaternionZ +
      firstQuaternionX * secondQuaternionY -
      firstQuaternionY * secondQuaternionX
    destination.w =
      firstQuaternionW * secondQuaternionW -
      firstQuaternionX * secondQuaternionX -
      firstQuaternionY * secondQuaternionY -
      firstQuaternionZ * secondQuaternionZ

    return destination
  }

  transformVector3(vector: Vector3, destination?: Vector3): Vector3 {
    if (!destination) {
      destination = new Vector3()
    }

    const { x, y, z } = vector
    const { x: rotationX, y: rotationY, z: rotationZ, w: rotationW } = this
    const squaredMagnitude =
      rotationX * rotationX + rotationY * rotationY + rotationZ * rotationZ + rotationW * rotationW
    const inverseSquaredMagnitude = squaredMagnitude ? 1 / squaredMagnitude : 0

    // Preserve the Float32 intermediates and zero terms of q * [x, y, z, 0] * inverse(q).
    const inverseX = squaredMagnitude ? Math.fround(rotationX * -inverseSquaredMagnitude) : 0
    const inverseY = squaredMagnitude ? Math.fround(rotationY * -inverseSquaredMagnitude) : 0
    const inverseZ = squaredMagnitude ? Math.fround(rotationZ * -inverseSquaredMagnitude) : 0
    const inverseW = squaredMagnitude ? Math.fround(rotationW * inverseSquaredMagnitude) : 0
    const productX = Math.fround(rotationX * 0 + rotationW * x + rotationY * z - rotationZ * y)
    const productY = Math.fround(rotationY * 0 + rotationW * y + rotationZ * x - rotationX * z)
    const productZ = Math.fround(rotationZ * 0 + rotationW * z + rotationX * y - rotationY * x)
    const productW = Math.fround(rotationW * 0 - rotationX * x - rotationY * y - rotationZ * z)

    destination.x = productX * inverseW + productW * inverseX + productY * inverseZ - productZ * inverseY
    destination.y = productY * inverseW + productW * inverseY + productZ * inverseX - productX * inverseZ
    destination.z = productZ * inverseW + productW * inverseZ + productX * inverseY - productY * inverseX

    return destination
  }

  toMatrix3(destination?: Matrix3): Matrix3 {
    if (!destination) {
      destination = new Matrix3()
    }

    const { x, y, z, w } = this

    const doubledX = x + x
    const doubledY = y + y
    const doubledZ = z + z

    const productXX = x * doubledX
    const productXY = x * doubledY
    const productXZ = x * doubledZ
    const productYY = y * doubledY
    const productYZ = y * doubledZ
    const productZZ = z * doubledZ
    const productWX = w * doubledX
    const productWY = w * doubledY
    const productWZ = w * doubledZ

    destination.set([
      1.0 - (productYY + productZZ),
      productXY + productWZ,
      productXZ - productWY,
      productXY - productWZ,
      1.0 - (productXX + productZZ),
      productYZ + productWX,
      productXZ + productWY,
      productYZ - productWX,
      1.0 - (productXX + productYY)
    ])

    return destination
  }

  toMatrix4(destination?: Matrix4): Matrix4 {
    if (!destination) {
      destination = new Matrix4()
    }

    const { x, y, z, w } = this

    const doubledX = x + x
    const doubledY = y + y
    const doubledZ = z + z

    const productXX = x * doubledX
    const productXY = x * doubledY
    const productXZ = x * doubledZ
    const productYY = y * doubledY
    const productYZ = y * doubledZ
    const productZZ = z * doubledZ
    const productWX = w * doubledX
    const productWY = w * doubledY
    const productWZ = w * doubledZ

    destination.set([
      1.0 - (productYY + productZZ),
      productXY + productWZ,
      productXZ - productWY,
      0.0,

      productXY - productWZ,
      1.0 - (productXX + productZZ),
      productYZ + productWX,
      0.0,

      productXZ + productWY,
      productYZ - productWX,
      1.0 - (productXX + productYY),
      0.0,

      0.0,
      0.0,
      0.0,
      1.0
    ])

    return destination
  }

  interpolateSpherical(quaternion: Quaternion, fraction: number, destination: Quaternion = this): Quaternion {
    return Quaternion.interpolateSpherical(this, quaternion, fraction, destination)
  }

  serialize(): Tuple4 {
    const { x, y, z, w } = this

    return [x, y, z, w]
  }

  static async deserialize(value: unknown): Promise<Quaternion> {
    return new Quaternion(readValues(value, 4, 'Quaternion'))
  }

  static interpolateSpherical(
    firstQuaternion: ArrayLike<number>,
    secondQuaternion: ArrayLike<number>,
    fraction: number,
    destination: Quaternion = new Quaternion()
  ): Quaternion {
    const firstMagnitude = Math.hypot(firstQuaternion[0], firstQuaternion[1], firstQuaternion[2], firstQuaternion[3])
    const secondMagnitude = Math.hypot(
      secondQuaternion[0],
      secondQuaternion[1],
      secondQuaternion[2],
      secondQuaternion[3]
    )

    if (
      !Number.isFinite(fraction) ||
      !Number.isFinite(firstMagnitude) ||
      !Number.isFinite(secondMagnitude) ||
      firstMagnitude === 0 ||
      secondMagnitude === 0
    ) {
      throw new RangeError('Spherical interpolation requires finite, nonzero quaternions and a finite fraction')
    }

    const firstX = firstQuaternion[0] / firstMagnitude
    const firstY = firstQuaternion[1] / firstMagnitude
    const firstZ = firstQuaternion[2] / firstMagnitude
    const firstW = firstQuaternion[3] / firstMagnitude
    const secondX = secondQuaternion[0] / secondMagnitude
    const secondY = secondQuaternion[1] / secondMagnitude
    const secondZ = secondQuaternion[2] / secondMagnitude
    const secondW = secondQuaternion[3] / secondMagnitude
    const dotProduct = firstX * secondX + firstY * secondY + firstZ * secondZ + firstW * secondW
    const direction = dotProduct < 0 ? -1 : 1
    const cosine = Math.min(1, Math.abs(dotProduct))
    const clampedFraction = Math.max(0, Math.min(1, fraction))
    const angle = Math.acos(cosine)
    const sine = Math.sin(angle)
    const firstWeight = sine > Epsilon ? Math.sin((1 - clampedFraction) * angle) / sine : 1 - clampedFraction
    const secondWeight = direction * (sine > Epsilon ? Math.sin(clampedFraction * angle) / sine : clampedFraction)

    destination.x = firstWeight * firstX + secondWeight * secondX
    destination.y = firstWeight * firstY + secondWeight * secondY
    destination.z = firstWeight * firstZ + secondWeight * secondZ
    destination.w = firstWeight * firstW + secondWeight * secondW

    return destination.normalize()
  }

  static calculateDotProduct(firstQuaternion: Quaternion, secondQuaternion: Quaternion): number {
    return (
      firstQuaternion.x * secondQuaternion.x +
      firstQuaternion.y * secondQuaternion.y +
      firstQuaternion.z * secondQuaternion.z +
      firstQuaternion.w * secondQuaternion.w
    )
  }

  static add(firstQuaternion: Quaternion, secondQuaternion: Quaternion, destination?: Quaternion): Quaternion {
    if (!destination) {
      destination = new Quaternion()
    }

    destination.x = firstQuaternion.x + secondQuaternion.x
    destination.y = firstQuaternion.y + secondQuaternion.y
    destination.z = firstQuaternion.z + secondQuaternion.z
    destination.w = firstQuaternion.w + secondQuaternion.w

    return destination
  }

  static multiply(firstQuaternion: Quaternion, secondQuaternion: Quaternion, destination?: Quaternion): Quaternion {
    if (!destination) {
      destination = new Quaternion()
    }

    const firstQuaternionX = firstQuaternion.x
    const firstQuaternionY = firstQuaternion.y
    const firstQuaternionZ = firstQuaternion.z
    const firstQuaternionW = firstQuaternion.w

    const secondQuaternionX = secondQuaternion.x
    const secondQuaternionY = secondQuaternion.y
    const secondQuaternionZ = secondQuaternion.z
    const secondQuaternionW = secondQuaternion.w

    destination.x =
      firstQuaternionX * secondQuaternionW +
      firstQuaternionW * secondQuaternionX +
      firstQuaternionY * secondQuaternionZ -
      firstQuaternionZ * secondQuaternionY
    destination.y =
      firstQuaternionY * secondQuaternionW +
      firstQuaternionW * secondQuaternionY +
      firstQuaternionZ * secondQuaternionX -
      firstQuaternionX * secondQuaternionZ
    destination.z =
      firstQuaternionZ * secondQuaternionW +
      firstQuaternionW * secondQuaternionZ +
      firstQuaternionX * secondQuaternionY -
      firstQuaternionY * secondQuaternionX
    destination.w =
      firstQuaternionW * secondQuaternionW -
      firstQuaternionX * secondQuaternionX -
      firstQuaternionY * secondQuaternionY -
      firstQuaternionZ * secondQuaternionZ

    return destination
  }

  // Angle in radians.
  static setFromAxisAngle(axis: Vector3, angle: number, destination?: Quaternion): Quaternion {
    if (!destination) {
      destination = new Quaternion()
    }

    const halfAngle = angle * 0.5
    const sine = Math.sin(halfAngle)

    destination.x = axis.x * sine
    destination.y = axis.y * sine
    destination.z = axis.z * sine
    destination.w = Math.cos(halfAngle)

    return destination
  }

  // Angles in radians.
  static setFromEulerAngles(yaw: number, pitch: number, roll: number, destination?: Quaternion): Quaternion {
    if (!destination) {
      destination = new Quaternion()
    }

    const halfYaw = yaw * 0.5
    const halfRoll = roll * 0.5
    const halfPitch = pitch * 0.5

    const yawCosine = Math.cos(halfYaw)
    const yawSine = Math.sin(halfYaw)
    const rollCosine = Math.cos(halfRoll)
    const rollSine = Math.sin(halfRoll)
    const pitchCosine = Math.cos(halfPitch)
    const pitchSine = Math.sin(halfPitch)

    const yawRollCosine = yawCosine * rollCosine
    const yawRollSine = yawSine * rollSine

    destination.x = yawRollCosine * pitchSine + yawRollSine * pitchCosine
    destination.y = yawSine * rollCosine * pitchCosine + yawCosine * rollSine * pitchSine
    destination.z = yawCosine * rollSine * pitchCosine - yawSine * rollCosine * pitchSine
    destination.w = yawRollCosine * pitchCosine - yawRollSine * pitchSine

    return destination
  }
}
