import { mat3, mat4, quat, vec3 } from '@luz/vectors'

export class Transform {

  readonly rotation = new quat()
  readonly translation = new vec3()

  readonly modelMatrix = new mat4()
  readonly rotationMatrix = new mat3()

  readonly directionVector = new vec3()

  update() {
    // model matrix
    mat4.construct(this.rotation, this.translation, this.modelMatrix)

    // rotation matrix
    this.modelMatrix.toMat3(this.rotationMatrix)

    // direction vector
    this.rotationMatrix.row(2, this.directionVector).normalize()
  }

}