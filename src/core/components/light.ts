import { Serialized } from '../../utilities'
import { mat4, vec3 } from '../../vectors'
import { Component } from '../component'
import { Transform } from '../transform'
import { Camera } from './camera'

export class Light extends Camera {

  readonly type = Component.Type.Light

  @Serialized
  radius = 6.0

  @Serialized
  falloff = 10.0

  @Serialized
  intensity = 1.0

  @Serialized
  readonly color = vec3.one.copy()

  readonly translation = new vec3()

  readonly direction = new vec3()

  readonly textureMatrix = new mat4()

  private readonly biasMatrix = new mat4()

  constructor() {
    super()

    this.translation = new vec3()
    this.direction = new vec3()

    this.biasMatrix.translate(new vec3([0.5, 0.5, 0.5]))
    this.biasMatrix.scale(new vec3([0.5, 0.5, 0.5]))
  }

  update(transform: Transform, deltaTime: number) {
    super.update(transform, deltaTime)

    transform.translation.copy(this.translation)
    transform.direction.copy(this.direction)

    this.biasMatrix.copy(this.textureMatrix)

    this.textureMatrix.multiply(this.projectionMatrix)
    this.textureMatrix.multiply(this.viewMatrix)
  }

}