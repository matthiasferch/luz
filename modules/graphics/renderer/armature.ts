import { Serializable, Serialize } from '@luz/utilities'
import { Bone } from './bone'

export class Armature extends Serializable<Armature> {
  @Serialize(Bone)
  readonly bones: Record<string, Bone> = {}

  readonly rootBones: Bone[] = []

  static deserialize(data: Partial<Armature>) {
    const armature = super.deserialize(data) as Armature

    for (let bone of Object.values(armature.bones)) {
      if (bone.parent) {
        const parentBone = armature.bones[bone.parent]

        if (parentBone) {
          parentBone.children.push(bone)
        }
      } else {
        armature.rootBones.push(bone)
      }
    }

    return armature
  }
}
