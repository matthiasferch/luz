import { Mesh, Texture } from '@luz/graphics'
import { Serialized } from '@luz/utilities'
import { vec3 } from '@luz/vectors'
import { Component } from '../component'
import { Transform } from '../transform'

export class Model extends Component {

  readonly type = Component.Type.Model

  readonly timestep = Component.Timestep.Variable

  @Serialized
  topology: Mesh.Topology

  @Serialized
  vertices: number[]

  @Serialized
  indices?: number[]

  @Serialized
  images?: string[]

  @Serialized
  readonly color = vec3.one

  mesh: Mesh

  texture: Texture

  update(transform: Transform, deltaTime: number) {}

}