import { mat3, mat4, quat, vec3 } from '@luz/vectors'

export class Transform {

  readonly rotation: quat
  readonly translation: vec3

  readonly direction = new vec3()

  readonly modelMatrix = new mat4()
  readonly rotationMatrix = new mat3()
  readonly inverseTransposeMatrix = new mat4()

  constructor({
    translation = vec3.zero,
    rotation = quat.identity
  } = {}) {
    this.translation = translation.copy()
    this.rotation = rotation.copy()
    
    this.update()
  }

  update() {
    // model matrix
    mat4.construct(this.rotation, this.translation, this.modelMatrix)

    // rotation matrix
    this.modelMatrix.toMat3(this.rotationMatrix)
    
    // direction vector
    this.rotationMatrix.row(2, this.direction).normalize()

    // inverse transpose matrix
    this.modelMatrix.invert(this.inverseTransposeMatrix).transpose()
  }

  static readonly origin = new Transform()

}