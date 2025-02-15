import { Serialize, Serializable } from '@luz/utilities'
import { vec3, mat4 } from '@luz/vectors'
import { Armature } from './armature'
import { Animation } from './animation'

export class Bone extends Serializable {
  @Serialize()
  readonly head: vec3 = vec3.zero.copy()

  @Serialize()
  readonly tail: vec3 = vec3.zero.copy()

  @Serialize()
  readonly parent: string | null = null

  @Serialize()
  readonly bindMatrix: mat4 = mat4.identity.copy()

  readonly childBones: Record<string, Bone> = {}

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
      this.bindMatrix.invert(this.inverseBindMatrix)
    }
  }

  update(name: string, armature: Armature, animation: Animation, time: number) {
    const keyframes = animation.keyframes[name]
    const transform = animation.transform(keyframes, time)

    const { translation, rotation, scale } = transform

    mat4.construct(translation, rotation, scale, this.localMatrix)

    if (this.parent) {
      const parentBone = armature.bones[this.parent]

      mat4.multiply(this.localMatrix, parentBone.poseMatrix, this.poseMatrix)
    } else {
      this.poseMatrix.copy(this.localMatrix)
    }

    this.poseMatrix.multiply(this.inverseBindMatrix)

    Object.entries(this.childBones).forEach(([name, bone]) => {
      bone.update(name, armature, animation, time)
    })
  }
}
