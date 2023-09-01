import { mat3, mat4, vec2 } from '@luz/vectors'
import { Entity } from '../entity'


export class Camera extends Entity {

  type = Entity.Type.Camera

  aspect = 1.0

  aperture = 90.0

  readonly clipPlanes = new vec2([1.0, 100.0])

  readonly viewMatrix = new mat4()

  readonly normalMatrix = new mat3()

  readonly modelViewMatrix = new mat4()

  readonly projectionMatrix = new mat4()

  readonly reconstructionMatrix = new mat4()

  update(deltaTime: number) {
    super.update(deltaTime)

    // view matrix
    this.modelMatrix.invert(this.viewMatrix)

    // model view matrix
    mat4.multiply(this.viewMatrix, this.modelMatrix, this.modelViewMatrix)

    // normal matrix (to transform normals)
    this.modelViewMatrix.toMat3(this.normalMatrix).transpose().invert()

    // perspective matrix
    mat4.perspective(this.aperture, this.aspect, this.clipPlanes.x, this.clipPlanes.y, this.projectionMatrix)

    // reconstruction matrix (to reconstruct fragment positions)
    mat4.multiply(this.projectionMatrix, this.viewMatrix, this.reconstructionMatrix).invert()
  }

  toJSON() {
    const { aspect, aperture, clipPlanes } = this

    return { ...super.toJSON(), aspect, aperture, clipPlanes }
  }

}