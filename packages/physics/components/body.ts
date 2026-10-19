import { MotionType } from '@luz/formats'
import { Component } from '@luz/core'
import type { RigidPose, Transform } from '@luz/core'
import { Volume } from '../volume'
import { Pool, Serialize, Register } from '@luz/serialization'
import { Quaternion, Vector3 } from '@luz/math'

const wakeForceThreshold: number = 1e-4
const wakeTorqueThreshold: number = 1e-4
const wakeLinearVelocityThreshold: number = 0.05
const wakeAngularVelocityThreshold: number = 0.1
const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 16
})
const quaternions = new Pool({
  createObject: () => new Quaternion(),

  resetObject: (quaternion) => quaternion.reset(),
  initialCapacity: 8
})

@Register('body')
export class Body extends Component {
  readonly type: 'body' | 'biped' = 'body'
  readonly timestep: Component.Timestep = 'fixed'

  @Serialize()
  mass: number

  @Serialize()
  motionType: MotionType

  @Serialize()
  isContinuousCollisionEnabled: boolean = false

  get isDynamic(): boolean {
    return this.motionType === 'dynamic'
  }

  get inverseMass(): number {
    return this.isDynamic && this.mass > 0 ? 1 / this.mass : 0
  }

  validate(): void {
    if (
      !['dynamic', 'static', 'kinematic'].includes(this.motionType) ||
      !Number.isFinite(this.mass) ||
      this.mass < 0 ||
      (this.isDynamic && this.mass === 0) ||
      !Number.isFinite(this.friction) ||
      this.friction < 0 ||
      !Number.isFinite(this.restitution) ||
      this.restitution < 0 ||
      this.restitution > 1
    ) {
      throw new Error('Invalid body mode, mass or material')
    }
  }

  static async deserialize(data: unknown): Promise<Body> {
    if (!data || typeof data !== 'object' || !('motionType' in data) || data.motionType === undefined) {
      throw new Error('Body requires an explicit motionType')
    }

    const body = (await super.deserialize(data)) as Body

    body.validate()

    return body
  }

  @Serialize()
  restitution: number = 0.2

  @Serialize()
  friction: number = 0.2

  @Serialize()
  volume!: Volume

  readonly force: Vector3
  readonly torque: Vector3
  readonly linearVelocity: Vector3
  readonly angularVelocity: Vector3
  readonly angularCorrection: Vector3

  isSleeping: boolean = false
  sleepFrames: number = 0
  wakeRevision: number = 0

  private lastTransform: Transform | null = null
  private kinematicTarget?: RigidPose

  setKinematicTarget(translation: Vector3, rotation: Quaternion, deltaTime: number): void {
    if (this.motionType !== 'kinematic' || !this.lastTransform) {
      throw new Error('Kinematic targets require a bound kinematic body')
    }

    if (
      !Number.isFinite(deltaTime) ||
      deltaTime <= 0 ||
      [...translation, ...rotation].some((value) => !Number.isFinite(value)) ||
      Math.abs(Math.hypot(...rotation) - 1) > 1e-4
    ) {
      throw new Error('Invalid kinematic target pose or time step')
    }

    const transform = this.lastTransform

    vectors.runInScope(() =>
      quaternions.runInScope(() => {
        const deltaRotation = rotation
          .copyTo(quaternions.acquire())
          .multiply(transform.rotation.conjugate(quaternions.acquire()))
          .normalize()

        if (deltaRotation.w < 0) {
          for (let index = 0; index < 4; index++) {
            deltaRotation[index] *= -1
          }
        }

        const sine = Math.hypot(deltaRotation.x, deltaRotation.y, deltaRotation.z)
        const factor = sine > 1e-8 ? (2 * Math.atan2(sine, deltaRotation.w)) / (sine * deltaTime) : 0

        this.angularVelocity.set([deltaRotation.x * factor, deltaRotation.y * factor, deltaRotation.z * factor])

        const centerOffset = Vector3.subtract(this.volume.center, transform.translation, vectors.acquire())
        const targetCenter = deltaRotation.transformVector3(centerOffset, centerOffset).add(translation)

        this.linearVelocity.set(targetCenter.subtract(this.volume.center).scale(1 / deltaTime))

        this.kinematicTarget = { translation: translation.clone(), rotation: rotation.clone() }
      })
    )
  }

  constructor({ mass = 1.0, motionType = 'dynamic' }: { mass?: number; motionType?: MotionType } = {}) {
    super()

    this.mass = mass
    this.motionType = motionType

    this.validate()

    this.force = Vector3.createZero()
    this.torque = Vector3.createZero()
    this.linearVelocity = Vector3.createZero()
    this.angularVelocity = Vector3.createZero()
    this.angularCorrection = Vector3.createZero()
  }

  applyTransform(transform: Transform) {
    const { volume } = this

    volume.applyTransform(transform)

    if (this.inverseMass > 0) {
      volume.calculateInverseInertia(this.mass, transform)
    } else {
      volume.inverseInertia.fill(0)
    }

    this.lastTransform = transform
  }

  convertToLocalPoint(point: Vector3): Vector3 {
    const offset = Vector3.subtract(point, this.volume.center)
    const transform = this.lastTransform

    if (!transform) {
      return offset
    }

    return quaternions.runInScope(() =>
      transform.rotation.conjugate(quaternions.acquire()).transformVector3(offset, offset)
    )
  }

  applyImpulse(impulse: Vector3, point: Vector3 = this.volume.center): void {
    if (this.inverseMass === 0) {
      return
    }

    this.wake()
    vectors.runInScope(() => {
      const velocityChange = Vector3.scale(impulse, this.inverseMass, vectors.acquire())

      this.linearVelocity.add(velocityChange)
      Vector3.subtract(point, this.volume.center, velocityChange)
      Vector3.calculateCrossProduct(velocityChange, impulse, velocityChange)
      this.volume.inverseInertia.transform(velocityChange, velocityChange)
      this.angularVelocity.add(velocityChange)
    })
  }

  applyPositionCorrection(delta: Vector3) {
    if (!this.lastTransform) {
      return
    }

    this.lastTransform.translation.add(delta)
    this.lastTransform.updateTransform()
    this.volume.applyTransform(this.lastTransform)
  }

  applyRotationCorrection(deltaRotation: Quaternion) {
    if (!this.lastTransform) {
      return
    }

    const transform = this.lastTransform

    vectors.runInScope(() =>
      quaternions.runInScope(() => {
        const center = this.volume.center.copyTo(vectors.acquire())

        deltaRotation.multiply(transform.rotation, quaternions.acquire()).normalize(transform.rotation)
        transform.updateTransform()
        this.volume.applyTransform(transform)
        transform.translation.add(Vector3.subtract(center, this.volume.center, center))
        transform.updateTransform()
        this.volume.applyTransform(transform)
        this.volume.calculateInverseInertia(this.mass, transform)
      })
    )
  }

  wake() {
    if (this.isSleeping) {
      this.wakeRevision++
    }

    this.isSleeping = false
    this.sleepFrames = 0
  }

  sleep() {
    this.isSleeping = true
    this.sleepFrames = 0

    this.force.reset()
    this.torque.reset()
    this.linearVelocity.reset()
    this.angularVelocity.reset()
    this.angularCorrection.reset()
  }

  resetMotion() {
    this.kinematicTarget = undefined

    this.force.reset()
    this.torque.reset()
    this.linearVelocity.reset()
    this.angularVelocity.reset()
    this.angularCorrection.reset()

    this.isSleeping = false
    this.sleepFrames = 0
  }

  resetSleepFrames() {
    this.sleepFrames = 0
  }

  advanceSleepFrame() {
    this.sleepFrames++
  }

  shouldWake() {
    return (
      this.force.magnitude > wakeForceThreshold ||
      this.torque.magnitude > wakeTorqueThreshold ||
      this.linearVelocity.magnitude > wakeLinearVelocityThreshold ||
      this.angularVelocity.magnitude > wakeAngularVelocityThreshold
    )
  }

  shouldResetSleepFrames() {
    return (
      this.torque.magnitude > wakeTorqueThreshold ||
      this.linearVelocity.magnitude > wakeLinearVelocityThreshold ||
      this.angularVelocity.magnitude > wakeAngularVelocityThreshold
    )
  }

  update(transform: Transform, deltaTime: number) {
    const { mass, volume } = this

    transform.updateTransform()
    this.validate()

    if (!this.isDynamic) {
      this.isSleeping = false
      this.sleepFrames = 0

      this.force.reset()
      this.torque.reset()

      if (this.motionType === 'kinematic') {
        if (this.kinematicTarget) {
          transform.translation.set(this.kinematicTarget.translation)
          transform.rotation.set(this.kinematicTarget.rotation)

          this.kinematicTarget = undefined

          transform.updateTransform()
          this.volume.applyTransform(transform)
        } else {
          vectors.runInScope(() => {
            transform.translation.add(Vector3.scale(this.linearVelocity, deltaTime, vectors.acquire()))
            this.volume.applyTransform(transform)
            this.integrateAngularVelocity(transform, deltaTime)
          })
        }
      } else {
        this.linearVelocity.reset()
        this.angularVelocity.reset()
      }

      volume.inverseInertia.fill(0)
      this.angularCorrection.reset()

      return
    }

    if (this.isSleeping) {
      if (!this.shouldWake()) {
        this.force.reset()
        this.torque.reset()
        this.angularCorrection.reset()

        return
      }

      this.wake()
    } else if (this.shouldResetSleepFrames()) {
      this.resetSleepFrames()
    }

    volume.calculateInverseInertia(mass, transform)
    this.integrateLinearVelocity(transform, deltaTime)
    this.integrateAngularVelocity(transform, deltaTime)
  }

  private integrateLinearVelocity(transform: Transform, deltaTime: number) {
    vectors.runInScope(() => {
      const velocityChange = Vector3.scale(this.force, 1 / this.mass, vectors.acquire()).scale(deltaTime)

      this.linearVelocity.add(velocityChange)
      transform.translation.add(Vector3.scale(this.linearVelocity, deltaTime, velocityChange))
      this.volume.applyTransform(transform)
      this.force.reset()
    })
  }

  private integrateAngularVelocity(transform: Transform, deltaTime: number) {
    const { inverseInertia } = this.volume

    vectors.runInScope(() => {
      const velocityChange = inverseInertia.transform(this.torque, vectors.acquire()).scale(deltaTime)

      this.angularVelocity.add(velocityChange)

      const axis = Vector3.normalize(this.angularVelocity, velocityChange)
      const angle = this.angularVelocity.magnitude * deltaTime

      if (angle !== 0) {
        quaternions.runInScope(() => {
          const center = this.volume.center.copyTo(vectors.acquire())

          Quaternion.setFromAxisAngle(axis, angle, quaternions.acquire())
            .multiply(transform.rotation, transform.rotation)
            .normalize()
          transform.updateTransform()
          this.volume.applyTransform(transform)
          transform.translation.add(Vector3.subtract(center, this.volume.center, center))
          transform.updateTransform()
          this.volume.applyTransform(transform)
          this.volume.calculateInverseInertia(this.mass, transform)
        })
      }

      this.torque.reset()
      this.angularCorrection.reset()
    })
  }
}

export const isBody = (component: Component): component is Body => {
  return component.type === 'body' || component.type === 'biped'
}
