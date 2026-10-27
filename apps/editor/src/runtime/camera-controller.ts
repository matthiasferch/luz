import type { Transform } from '@luz/core'
import { Vector3, Quaternion, Vector2, Matrix3 } from '@luz/math'
import type { InputManager } from './input-manager'

export class CameraController {
  // Match Projector's exported-camera basis correction. Limits apply after
  // this rotation, while the entity retains its Blender-compatible pose.
  private static readonly viewCorrection = Quaternion.setFromAxisAngle(Vector3.createRight(), -Math.PI / 2)
  private static readonly inverseViewCorrection = CameraController.viewCorrection.clone().invert()

  private transform?: Transform
  private rotationMatrix = new Matrix3()
  private isAnimationActive = false

  yaw: number = 0
  pitch: number = 0
  panSpeed: number = 0.01
  dollySpeed: number = -0.002
  rotationSpeed: number = 0.005

  constructor(private inputManager: Pick<InputManager, 'captureNavigation' | 'resetNavigation'>) {}

  setTransform(transform: Transform): void {
    this.transform = transform

    this.inputManager.resetNavigation()
    transform.refreshWorldTransform()

    const viewRotation = Quaternion.multiply(transform.worldRotation, CameraController.viewCorrection)

    this.yaw = viewRotation.yaw
    this.pitch = viewRotation.pitch
  }

  update(isAnimationActive = false): void {
    if (!this.transform) {
      return
    }

    if (this.isAnimationActive && !isAnimationActive) {
      this.setTransform(this.transform)
    }

    this.isAnimationActive = isAnimationActive

    const { rotationDelta, panDelta, dollyDelta } = this.inputManager.captureNavigation()

    if (isAnimationActive) {
      return
    }

    this.rotate(rotationDelta)
    this.pan(panDelta)

    if (dollyDelta !== 0) {
      this.dolly(dollyDelta)
    }
  }

  private rotate({ x, y }: Vector2): void {
    if (!this.transform) {
      return
    }

    if (x === 0 && y === 0) {
      return
    }

    // A moving parent may have changed the view since the previous input.
    if (this.transform.parent) {
      this.transform.refreshWorldTransform()

      const view = Quaternion.multiply(this.transform.worldRotation, CameraController.viewCorrection)

      this.yaw = view.yaw
      this.pitch = view.pitch
    }

    this.yaw -= x * this.rotationSpeed
    this.pitch -= y * this.rotationSpeed

    const limit = Math.PI / 2 - 0.01

    this.yaw = ((((this.yaw + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI
    this.pitch = Math.max(-limit, Math.min(limit, this.pitch))

    const rotation = Quaternion.setFromEulerAngles(this.yaw, this.pitch, 0)

    rotation.multiply(CameraController.inverseViewCorrection).normalize()
    this.transform.setWorldRotation(rotation)
  }

  private pan({ x, y }: Vector2): void {
    if (!this.transform || (x === 0 && y === 0)) {
      return
    }

    this.transform.refreshWorldTransform()
    this.transform.worldRotation.toMatrix3(this.rotationMatrix)

    const rightDirection = this.rotationMatrix.getColumn(0, new Vector3())
    const up = this.rotationMatrix.getColumn(2, new Vector3())

    const delta = new Vector2([-x * this.panSpeed, -y * this.panSpeed])

    this.transform.setWorldTranslation(
      this.transform.worldTranslation
        .clone()
        .add(Vector3.scale(rightDirection, delta.x))
        .add(Vector3.scale(up, delta.y))
    )
  }

  private dolly(delta: number): void {
    if (!this.transform) {
      return
    }

    this.transform.refreshWorldTransform()
    this.transform.worldRotation.toMatrix3(this.rotationMatrix)

    const forwardDirection = this.rotationMatrix.getColumn(1, new Vector3())
    const factor = -delta * this.dollySpeed

    this.transform.setWorldTranslation(
      this.transform.worldTranslation.clone().add(Vector3.scale(forwardDirection, factor))
    )
  }
}
