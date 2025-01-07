import { Material, Mesh } from '@luz/graphics'
import { Serialize } from '@luz/utilities'
import { Component } from '../component'
import { Transform } from '../transform'

export class Model extends Component {
  readonly type: Component.Type = 'model'
  readonly timestep: Component.Timestep = 'variable'

  //@Serialize
  //topology: Mesh.Topology

  //@Serialize
  //vertices: number[]

  //@Serialize
  //indices?: number[]

  meshes: Record<string, Mesh> = {}

  materials: Record<string, Material> = {}

  update(transform: Transform, deltaTime: number) {}
}
