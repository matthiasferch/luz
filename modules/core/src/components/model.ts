import { Mesh, Texture } from '@luz/graphics'
import { vec3 } from '@luz/vectors'
import { Component } from '../component'
import { Transform } from '../transform'

export class Model extends Component {

  type = Component.Type.Model

  timestep = Component.Timestep.Variable

  baseColor = vec3.one

  baseTexture: Texture

  mesh: Mesh

  update(transform: Transform, deltaTime: number) {}

  toJSON() {
    const { baseColor } = this

    return { ...super.toJSON(), baseColor }
  }

}