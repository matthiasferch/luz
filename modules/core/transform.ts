import { Serialize, Serializable, Uniform } from '@luz/utilities'
import { mat3, mat4, quat, vec3 } from '@luz/vectors'

export class Transform extends Serializable {
  @Serialize()
  readonly scale: vec3 = vec3.one.copy()

  @Serialize()
  readonly rotation: quat = quat.identity.copy()

  @Serialize()
  readonly translation: vec3 = vec3.zero.copy()

  @Uniform()
  readonly direction = new vec3()

  @Uniform()
  readonly modelMatrix = new mat4()

  @Uniform()
  readonly normalMatrix = new mat3()

  @Uniform()
  readonly rotationMatrix = new mat3()

  static readonly origin: Transform = new Transform()

  constructor({ translation = vec3.zero, rotation = quat.identity, scale = vec3.one } = {}) {
    super()

    this.translation = translation.copy()
    this.rotation = rotation.copy()
    this.scale = scale.copy()
  }

  update(deltaTime: number) {
    mat4.construct(this.translation, this.rotation, this.scale, this.modelMatrix)

    this.modelMatrix.toMat3(this.rotationMatrix)

    this.rotationMatrix.row(2, this.direction).normalize()
    this.rotationMatrix.invert(this.normalMatrix).transpose()
  }
}
