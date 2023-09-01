import { Mesh, Texture } from '@luz/graphics'
import { vec3 } from '@luz/vectors'
import { Component } from '../component'

export class Model extends Component {

  type = Component.Type.Model

  baseColor = vec3.one

  baseTexture: Texture

  mesh: Mesh

  toJSON() {
    const { baseColor } = this

    return { ...super.toJSON(), baseColor }
  }

}