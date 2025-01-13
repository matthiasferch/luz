import { Material, Partition, Armature, Animation, BoneWeight } from '@luz/graphics'
import { Serialize } from '@luz/utilities'
import { Component } from '../component'
import { Transform } from '../transform'

export class Model extends Component {
  readonly type: Component.Type = 'Model'

  @Serialize(Material)
  readonly materials: Record<string, Material> = {}

  @Serialize(Partition)
  readonly partitions: Record<string, Partition> = {}

  @Serialize(Armature)
  readonly armatures: Record<string, Armature> = {}

  @Serialize(Animation)
  readonly animations: Record<string, Animation> = {}

  @Serialize()
  readonly boneWeights: Record<string, BoneWeight[]> | null = null

  update(transform: Transform, deltaTime: number) {}
}
