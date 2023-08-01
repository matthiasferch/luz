import { mat3, mat4, vec2 } from '@luz/vectors'

import { Transform } from './transform'

export class Camera extends Transform {

  aspect = 1.0

  aperture = 90.0

  readonly clipPlanes = new vec2([1.0, 100.0])

  readonly viewMatrix = new mat4()

  readonly normalMatrix = new mat3()

  readonly modelViewMatrix = new mat4()

  readonly projectionMatrix = new mat4()

  readonly reconstructionMatrix = new mat4()

  update() {
    super.update()

    // view matrix
    this.modelMatrix.invert(this.viewMatrix)

    // model view matrix
    mat4.multiply(this.viewMatrix, this.modelMatrix, this.modelViewMatrix)

    // normal matrix
    this.modelViewMatrix.toMat3(this.normalMatrix).transpose().invert()

    // perspective matrix
    mat4.perspective(this.aperture, this.aspect, this.clipPlanes[0], this.clipPlanes[1], this.projectionMatrix)

    // reconstruction matrix
    mat4.multiply(this.projectionMatrix, this.viewMatrix, this.reconstructionMatrix).invert()
  }

}