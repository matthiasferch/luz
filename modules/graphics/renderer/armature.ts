import { Serializable, Serialize } from '@luz/utilities'
import { Bone } from './bone'

export class Armature extends Serializable<Armature> {
  @Serialize(Bone)
  readonly bones: Record<string, Bone> = {}
}
