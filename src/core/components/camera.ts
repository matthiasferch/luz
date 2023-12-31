import { Serialized } from '../../utilities'
import { mat3, mat4, vec2 } from '../../vectors'
import { Component } from '../component'
import { Transform } from '../transform'

export class Camera extends Component {

  readonly type: Component.Type = Component.Type.Camera

  readonly timestep = Component.Timestep.Variable

  @Serialized
  aspect = 1.0

  @Serialized
  aperture = 90.0

  @Serialized
  readonly clipPlanes = new vec2([1.0, 100.0])

  readonly viewMatrix = new mat4()

  readonly normalMatrix = new mat3()

  readonly modelViewMatrix = new mat4()

  readonly projectionMatrix = new mat4()

  readonly reconstructionMatrix = new mat4()

  update(transform: Transform, deltaTime: number) {
    const { modelMatrix } = transform

    // view matrix
    modelMatrix.invert(this.viewMatrix)

    // model view matrix
    mat4.multiply(this.viewMatrix, modelMatrix, this.modelViewMatrix)

    // normal matrix (to transform normals)
    this.modelViewMatrix.toMat3(this.normalMatrix).transpose().invert()

    // perspective matrix
    mat4.perspective(this.aperture, this.aspect, this.clipPlanes.x, this.clipPlanes.y, this.projectionMatrix)

    // reconstruction matrix (to reconstruct fragment positions)
    mat4.multiply(this.projectionMatrix, this.viewMatrix, this.reconstructionMatrix).invert()
  }

}