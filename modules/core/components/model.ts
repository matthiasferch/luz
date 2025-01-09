import { Material, Mesh } from '@luz/graphics'
import { Serialize } from '@luz/utilities'
import { Component } from '../component'
import { Transform } from '../transform'

export class Model extends Component {
  readonly type: Component.Type = 'Model'

  @Serialize(Mesh)
  readonly meshes: Record<string, Mesh> = {}

  @Serialize(Material)
  readonly materials: Record<string, Material> = {}

  update(transform: Transform, deltaTime: number) {}
}
