import { Serialize, Uniform } from '@luz/serialization'
import { Matrix4, Vector2, Quaternion, Vector3 } from '@luz/math'
import { Component } from './component'
import type { Transform } from './transform'
import { Frustum } from './frustum'

export abstract class Projector extends Component {
  private static readonly blenderAxisCorrectionQuaternion = Quaternion.setFromAxisAngle(
    Vector3.createRight(),
    -Math.PI / 2,
    new Quaternion()
  )
  private static readonly blenderAxisCorrectionMatrix = Matrix4.createTransform(
    Vector3.createZero(),
    Projector.blenderAxisCorrectionQuaternion
  )

  @Serialize()
  aspect: number = 1.0

  // Degrees, vertical field of view.
  @Uniform()
  @Serialize()
  fieldOfView: number = 90.0

  @Uniform()
  @Serialize()
  readonly clipPlanes: Vector2 = new Vector2([1.0, 100.0])

  @Uniform()
  readonly viewMatrix = new Matrix4()

  @Uniform()
  readonly modelViewMatrix = new Matrix4()

  @Uniform()
  readonly projectionMatrix = new Matrix4()

  @Uniform()
  readonly reconstructionMatrix = new Matrix4()

  protected readonly correctedModelMatrix = new Matrix4()
  protected readonly correctedRotation = new Quaternion()

  orthographicHeight = 0

  readonly frustum = new Frustum()

  constructor() {
    super()
    this.recalculateFrustum()
  }

  update(transform: Transform, _deltaTime: number) {
    Quaternion.multiply(transform.worldRotation, Projector.blenderAxisCorrectionQuaternion, this.correctedRotation)
    Matrix4.multiply(transform.modelMatrix, Projector.blenderAxisCorrectionMatrix, this.correctedModelMatrix)
    this.updateFromMatrix(this.correctedModelMatrix)
  }

  updateFromMatrix(matrix: Matrix4): void {
    matrix.invert(this.viewMatrix)
    Matrix4.multiply(this.viewMatrix, matrix, this.modelViewMatrix)

    if (this.orthographicHeight > 0) {
      const halfHeight = this.orthographicHeight * 0.5
      const halfWidth = halfHeight * this.aspect

      Matrix4.createOrthographic(
        -halfWidth,
        halfWidth,
        -halfHeight,
        halfHeight,
        this.clipPlanes.x,
        this.clipPlanes.y,
        this.projectionMatrix
      )
    } else {
      Matrix4.createPerspective(
        this.fieldOfView,
        this.aspect,
        this.clipPlanes.x,
        this.clipPlanes.y,
        this.projectionMatrix
      )
    }

    Matrix4.multiply(this.projectionMatrix, this.viewMatrix, this.reconstructionMatrix).invert()
    this.recalculateFrustum()
    this.frustum.applyMatrix(matrix)
  }

  private recalculateFrustum() {
    this.frustum.orthographicHeight = this.orthographicHeight
    this.frustum.aspect = this.aspect
    this.frustum.fieldOfView = this.fieldOfView

    this.clipPlanes.copyTo(this.frustum.clipPlanes)
  }
}
