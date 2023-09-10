import { Mesh, Texture } from '../../graphics'
import { vec3 } from '../../vectors'
import { Component } from '../component'
import { Transform } from '../transform'

export class Model extends Component {

  readonly type = Component.Type.Model

  readonly timestep = Component.Timestep.Variable

  baseColor = vec3.one

  baseTexture: Texture

  mesh: Mesh

  update(transform: Transform, deltaTime: number) {}

  toJSON() {
    const { baseColor } = this

    return { ...super.toJSON(), baseColor }
  }

}