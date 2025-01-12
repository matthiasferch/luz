import { Material, Partition } from '@luz/graphics'
import { Serialize } from '@luz/utilities'
import { Component } from '../component'
import { Transform } from '../transform'

export class Model extends Component {
  readonly type: Component.Type = 'Model'

  @Serialize(Material)
  readonly materials: Record<string, Material> = {}

  @Serialize(Partition)
  readonly partitions: Record<string, Partition> = {}

  update(transform: Transform, deltaTime: number) {}
}
