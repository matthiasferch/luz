import { vec3 } from '@luz/vectors'
import { Mesh, Texture } from '@luz/graphics'

import { Transform } from './transform'

export class Model extends Transform {

  readonly baseColor = vec3.one.copy()

  baseTexture: Texture

  constructor(readonly mesh: Mesh) {
    super()
  }

}