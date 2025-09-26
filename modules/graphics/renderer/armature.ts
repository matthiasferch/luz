import { Serializable, Serialize } from '@luz/utilities'
import { Animation } from './animation'
import { Bone } from './bone'

export class Armature extends Serializable {
  @Serialize(Bone)
  readonly bones: Bone[] = []

  readonly rootBones: Bone[] = []

  static async deserialize(data: Partial<Armature>) {
    const armature = (await super.deserialize(data)) as Armature

    armature.bones.forEach((bone) => {
      if (bone.parent) {
        const parentBone = armature.bones.find(({ name }) => name === bone.parent)

        if (!parentBone) {
          throw new Error(`Missing parent ${bone.parent} for bone ${bone.name}`)
        }

        bone.parentBone = parentBone

        parentBone.childBones.push(bone)
      } else {
        armature.rootBones.push(bone)
      }
    })

    return armature
  }

  update(deltaTime: number, animations: Animation[]) {
    this.rootBones.forEach((bone) => {
      bone.update(deltaTime, animations)
    })
  }
}
