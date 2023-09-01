import { mat3, mat4, quat, vec3 } from '@luz/vectors'

export class Transform {

  readonly rotation = new quat()

  readonly translation = new vec3()

  readonly direction = new vec3()

  readonly modelMatrix = new mat4()

  readonly rotationMatrix = new mat3()

  readonly inverseTransposeMatrix = new mat4()

  static readonly origin = new Transform()

  constructor({
    translation = vec3.zero,
    rotation = quat.identity
  } = {}) {
    this.translation = translation.copy()
    this.rotation = rotation.copy()
  }

  update(deltaTime: number) {
    // model matrix
    mat4.construct(this.rotation, this.translation, this.modelMatrix)

    // rotation matrix
    this.modelMatrix.toMat3(this.rotationMatrix)

    // direction vector (for lighting calculations)
    this.rotationMatrix.row(2, this.direction).normalize()

    // inverse transpose matrix (to transform plane equations)
    this.modelMatrix.invert(this.inverseTransposeMatrix).transpose()
  }

  toJSON() {
    const { rotation, translation } = this

    return { rotation, translation }
  }

}