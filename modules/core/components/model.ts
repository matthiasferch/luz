import { Material, Partition, Armature, Animation } from '@luz/graphics'
import { Serialize, Uniform } from '@luz/utilities'
import { Component } from '../component'
import { Transform } from '../transform'
import { mat4 } from '@luz/vectors'

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

  boneMatrices: mat4[] = [] // uploaded separately

  @Uniform()
  isAnimated: boolean = false

  static async deserialize(data: Partial<Model>) {
    const model = await super.deserialize(data) as Model

    if (Object.values(model.armatures).length > 0) {
      model.boneMatrices = Array.from({ length: 64 }, () => {
        return mat4.identity.copy()
      })

      model.isAnimated = true
    }

    return model
  }

  update(transform: Transform, deltaTime: number) {}
}
