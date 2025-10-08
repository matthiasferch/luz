import { Material, Partition, Armature, Animation } from '@luz/graphics'
import { Serialize, Uniform, Register } from '@luz/utilities'
import { Component } from '../component'
import { Transform } from '../transform'

@Register()
export class Model extends Component {
  readonly type: Component.Type = 'Model'
  readonly timestep: Component.Timestep = 'Variable'

  @Serialize(Material)
  readonly materials: Record<string, Material> = {}

  @Serialize(Partition)
  readonly partitions: Record<string, Partition> = {}

  @Serialize(Armature)
  readonly armatures: Record<string, Armature> = {}

  @Serialize(Animation)
  readonly animations: Record<string, Animation> = {}

  boneMatrices: Float32Array // uploaded separately

  @Uniform()
  isAnimated: boolean = false

  static async deserialize(data: Partial<Model>) {
    const model = (await super.deserialize(data)) as Model

    if (Object.values(model.armatures).length > 0) {
      model.boneMatrices = new Float32Array(1024) // 16 * 64
      model.isAnimated = true
    }

    return model
  }

  update(transform: Transform, deltaTime: number) {
    const animations = Object.values(this.animations)

    animations.forEach((animation) => {
      animation.update(deltaTime)
    })

    const armatures = Object.values(this.armatures)

    armatures.forEach((armature) => {
      armature.update(deltaTime, animations)
    })
  }
}

export const isModelComponent = (component: Component): component is Model => {
  return component.type === 'Model'
}