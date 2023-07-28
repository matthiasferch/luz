import { mat3 } from '../../vectors/src/mat3'
import { mat4 } from '../../vectors/src/mat4'
import { quat } from '../../vectors/src/quat'
import { vec3 } from '../../vectors/src/vec3'

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