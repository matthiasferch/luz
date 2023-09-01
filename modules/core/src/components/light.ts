import { mat4, vec3 } from '@luz/vectors'

import { Camera } from './camera'
import { Entity } from '../entity'

export class Light extends Camera {

  type = Entity.Type.Light

  radius = 6.0

  falloff = 10.0

  intensity = 1.0

  readonly color = vec3.one.copy()

  readonly textureMatrix = new mat4()

  private readonly biasMatrix = new mat4()

  constructor() {
    super()

    this.biasMatrix.translate(new vec3([0.5, 0.5, 0.5]))
    this.biasMatrix.scale(new vec3([0.5, 0.5, 0.5]))
  }

  update(deltaTime: number) {
    super.update(deltaTime)

    // texture matrix
    this.biasMatrix.copy(this.textureMatrix)
    this.textureMatrix.multiply(this.projectionMatrix)
    this.textureMatrix.multiply(this.viewMatrix)
  }

  toJSON() {
    const { radius, falloff, intensity } = this

    return { ...super.toJSON(), radius, falloff, intensity }
  }

}