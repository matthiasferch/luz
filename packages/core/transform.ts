import { Serialize, Serializable, Uniform } from '@luz/serialization'
import { Matrix3, Matrix4, Quaternion, Vector3 } from '@luz/math'

export interface TransformOptions {
  translation?: Vector3
  rotation?: Quaternion
  scale?: Vector3
}

export class Transform extends Serializable {
  @Serialize()
  readonly scale: Vector3 = Vector3.createOne()

  @Serialize()
  readonly rotation: Quaternion = Quaternion.createIdentity()

  @Serialize()
  readonly translation: Vector3 = Vector3.createZero()

  readonly localMatrix = new Matrix4()
  readonly worldTranslation = new Vector3()
  readonly worldRotation = Quaternion.createIdentity()

  parent?: Transform

  @Uniform()
  readonly direction = new Vector3()

  @Uniform()
  readonly modelMatrix = new Matrix4()

  @Uniform()
  readonly normalMatrix = new Matrix3()

  @Uniform()
  readonly rotationMatrix = new Matrix3()

  static createOrigin(): Transform {
    return new Transform()
  }

  constructor({ translation, rotation, scale }: TransformOptions = {}) {
    super()

    if (translation) {
      this.translation.copyFrom(translation)
    }

    if (rotation) {
      this.rotation.copyFrom(rotation)
    }

    if (scale) {
      this.scale.copyFrom(scale)
    }
  }

  update(_deltaTime: number) {
    this.updateTransform()
  }

  updateTransform(): void {
    Matrix4.createTransform(this.translation, this.rotation, this.scale, this.localMatrix)

    if (this.parent) {
      Matrix4.multiply(this.parent.modelMatrix, this.localMatrix, this.modelMatrix)
      Quaternion.multiply(this.parent.worldRotation, this.rotation, this.worldRotation).normalize()
    } else {
      this.localMatrix.copyTo(this.modelMatrix)
      this.rotation.copyTo(this.worldRotation)
    }

    this.worldTranslation.reset()
    this.modelMatrix.transformVector3(this.worldTranslation, this.worldTranslation)
    this.modelMatrix.toMatrix3(this.rotationMatrix)
    this.rotationMatrix.getColumn(2, this.direction).normalize()
    this.rotationMatrix.invert(this.normalMatrix).transpose()
  }

  refreshWorldTransform(): void {
    this.parent?.refreshWorldTransform()
    this.updateTransform()
  }

  setWorldTranslation(position: Vector3): void {
    this.parent?.refreshWorldTransform()

    if (this.parent) {
      this.parent.modelMatrix.clone().invert().transformVector3(position, this.translation)
    } else {
      position.copyTo(this.translation)
    }

    this.updateTransform()
  }

  setWorldRotation(rotation: Quaternion): void {
    this.parent?.refreshWorldTransform()

    if (this.parent) {
      Quaternion.multiply(this.parent.worldRotation.clone().invert(), rotation, this.rotation).normalize()
    } else {
      rotation.copyTo(this.rotation)
    }

    this.updateTransform()
  }
}
