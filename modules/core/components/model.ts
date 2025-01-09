import { Material, Mesh } from '@luz/graphics'
import { Serialize } from '@luz/utilities'
import { Component } from '../component'
import { Transform } from '../transform'
import { vec3 } from '@luz/vectors'

export class Model extends Component {
  readonly type: Component.Type = 'model'
  readonly timestep: Component.Timestep = 'variable'

  @Serialize(Mesh)
  readonly meshes: Record<string, Mesh> = {}

  @Serialize(Material)
  readonly materials: Record<string, Material> = {}

  update(transform: Transform, deltaTime: number) {}
}
