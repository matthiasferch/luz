import { mat3, mat4, quat, vec3 } from '@luz/vectors'

export class Transform {

  readonly rotation: quat
  readonly translation: vec3

  readonly modelMatrix: mat4
  readonly rotationMatrix: mat3
  readonly inverseTransposeMatrix: mat4

  constructor({
    translation = vec3.zero,
    rotation = quat.identity
  } = {}) {
    this.translation = translation.copy()
    this.rotation = rotation.copy()

    this.modelMatrix = new mat4()
    this.rotationMatrix = new mat3()
    this.inverseTransposeMatrix = new mat4()
    
    this.update()
  }

  update() {
    mat4.construct(this.rotation, this.translation, this.modelMatrix)

    this.modelMatrix.toMat3(this.rotationMatrix)
    this.modelMatrix.invert(this.inverseTransposeMatrix).transpose()
  }

  static readonly origin = new Transform()

}