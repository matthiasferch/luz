import { Serializable, Serialize } from '@luz/serialization'
import type { SkeletalAnimation } from './skeletal-animation'
import { Bone } from './bone'

export class Armature extends Serializable {
  @Serialize(Bone)
  readonly bones: Bone[] = []

  readonly rootBones: Bone[] = []

  static async deserialize(data: unknown): Promise<Armature> {
    const armature = (await super.deserialize(data)) as Armature
    const names = new Set<string>()

    for (const bone of armature.bones) {
      if (!bone.name || names.has(bone.name)) {
        throw new Error(`Duplicate or empty bone name: ${bone.name}`)
      }

      names.add(bone.name)
    }

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

    for (const bone of armature.bones) {
      const ancestors = new Set<Bone>()

      for (let ancestor: Bone | null = bone; ancestor; ancestor = ancestor.parentBone) {
        if (ancestors.has(ancestor)) {
          throw new Error(`Cyclic skeleton hierarchy at ${bone.name}`)
        }

        ancestors.add(ancestor)
      }
    }

    armature.update(0, [])

    return armature
  }

  update(deltaTime: number, animations: SkeletalAnimation[]) {
    this.rootBones.forEach((bone) => {
      bone.update(deltaTime, animations)
    })
  }
}
