import { Serialize, Uniform, Register } from '@luz/utilities'
import { mat4, vec2 } from '@luz/vectors'
import { Component } from '../component'
import { Transform } from '../transform'
import { Frustum } from '../frustum'

@Register()
export class Camera extends Component {
  readonly type: Component.Type = 'Camera'
  readonly timestep: Component.Timestep = 'Variable'

  @Serialize()
  aspect: number = 1.0

  @Uniform()
  @Serialize()
  aperture: number = 90.0

  @Uniform()
  @Serialize()
  readonly clipPlanes: vec2 = new vec2([1.0, 100.0])

  @Uniform()
  readonly viewMatrix = new mat4()

  @Uniform()
  readonly modelViewMatrix = new mat4()

  @Uniform()
  readonly projectionMatrix = new mat4()

  @Uniform()
  readonly reconstructionMatrix = new mat4()

  readonly frustum = new Frustum()

  constructor() {
    super()

    this.recalculateFrustum()
  }

  update(transform: Transform, deltaTime: number) {
    const { modelMatrix } = transform

    // view matrix
    modelMatrix.invert(this.viewMatrix)

    // model view matrix
    mat4.multiply(this.viewMatrix, modelMatrix, this.modelViewMatrix)

    // perspective matrix
    mat4.perspective(this.aperture, this.aspect, this.clipPlanes.x, this.clipPlanes.y, this.projectionMatrix)

    // reconstruction matrix (to reconstruct fragment positions)
    mat4.multiply(this.projectionMatrix, this.viewMatrix, this.reconstructionMatrix).invert()

    this.recalculateFrustum()

    this.frustum.applyTransform(transform)
  }

  private recalculateFrustum() {
    this.frustum.aspect = this.aspect
    this.frustum.aperture = this.aperture

    this.clipPlanes.copy(this.frustum.clipPlanes)
  }
}

export const isCameraComponent = (component: Component): component is Camera => {
  return component.type === 'Camera' || component.type === 'Light'
}
