import { vec3 } from '@luz/vectors'
import { Mesh, Texture } from '@luz/graphics'

import { Entity } from '../entity'

export class Model extends Entity {

  type = Entity.Type.Model

  readonly baseColor = vec3.one.copy()

  baseTexture: Texture

  mesh: Mesh

  body: Body

}