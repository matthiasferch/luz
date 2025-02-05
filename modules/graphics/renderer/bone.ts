import { Serialize, Serializable } from '@luz/utilities'
import { vec3, mat4 } from '@luz/vectors'
import { Armature } from './armature'
import { BoneTransform } from './animation'

export class Bone extends Serializable<Bone> {
  @Serialize()
  readonly head: vec3 = vec3.zero.copy()

  @Serialize()
  readonly tail: vec3 = vec3.zero.copy()

  @Serialize()
  readonly parent: string | null = null

  @Serialize()
  readonly bindMatrix: mat4 = mat4.identity.copy()

  readonly children: Bone[] = []

  readonly poseMatrix: mat4 = mat4.identity.copy()
  readonly localMatrix: mat4 = mat4.identity.copy()
  readonly inverseBindMatrix: mat4 = mat4.identity.copy()

  constructor({ parent, head, tail, bindMatrix }: Partial<Bone> = {}) {
    super()

    if (head) {
      this.head.set(head)
    }

    if (tail) {
      this.tail.set(tail)
    }

    if (parent) {
      this.parent = parent
    }

    if (bindMatrix) {
      this.bindMatrix.set(bindMatrix)

      bindMatrix.invert(this.inverseBindMatrix)
    }
  }

  update(armature: Armature, transform: BoneTransform) {
    const { translation, rotation, scale } = transform

    mat4.construct(translation, rotation, scale, this.localMatrix)

    if (this.parent) {
      const parent = armature.bones[this.parent]

      mat4.multiply(parent.poseMatrix, this.localMatrix, this.poseMatrix)
    } else {
      this.localMatrix.copy(this.poseMatrix)
    }

    mat4.multiply(this.poseMatrix, this.inverseBindMatrix, this.poseMatrix)

    for (const child of this.children) {
      child.update(armature, transform)
    }
  }
}
