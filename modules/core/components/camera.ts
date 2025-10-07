import { Serialize, Uniform, Register } from '@luz/utilities'
import { mat3, mat4, vec2 } from '@luz/vectors'
import { Component } from '../component'
import { Transform } from '../transform'
import { Frustum } from '@luz/physics'

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

  // Frustum collider matching the camera parameters
  readonly frustum: Frustum

  constructor() {
    super()

    // Initialize frustum using current camera parameters
    this.frustum = new Frustum({
      fovY: this.aperture,
      aspect: this.aspect,
      near: this.clipPlanes.x,
      far: this.clipPlanes.y,
    })
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

    // Keep frustum collider in sync with camera
    this.frustum.fovY = this.aperture
    this.frustum.aspect = this.aspect
    this.frustum.near = this.clipPlanes.x
    this.frustum.far = this.clipPlanes.y

    // Update frustum world-space center and axes based on transform
    this.frustum.applyTransform(transform)
  }
}
