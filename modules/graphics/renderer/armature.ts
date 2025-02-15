import { Serializable, Serialize } from '@luz/utilities'
import { Bone } from './bone'

export class Armature extends Serializable {
  @Serialize(Bone)
  readonly bones: Record<string, Bone> = {}

  readonly rootBones: Record<string, Bone> = {}

  static async deserialize(data: Partial<Armature>) {
    const armature = (await super.deserialize(data)) as Armature

    Object.entries(armature.bones).forEach(([name, bone]) => {
      if (bone.parent) {
        const parentBone = armature.bones[bone.parent]

        if (!parentBone) {
          throw new Error(`Missing parent ${bone.parent} for bone ${name}`)
        }

        parentBone.childBones[name] = bone
      } else {
        armature.rootBones[name] = bone
      }
    })

    return armature
  }
}
