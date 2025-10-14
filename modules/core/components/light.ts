import { Serialize, Uniform, Register } from '@luz/utilities'
import { mat4, vec3 } from '@luz/vectors'
import { BoundingBox, Polygon } from '@luz/physics'
import { Component } from '../component'
import { Transform } from '../transform'
import { Camera } from './camera'

@Register()
export class Light extends Camera {
  readonly type: Component.Type = 'Light'

  boundingBox: BoundingBox | null = null

  @Uniform()
  @Serialize()
  radius: number = 6.0

  @Uniform()
  @Serialize()
  falloff: number = 10.0

  @Uniform()
  @Serialize()
  intensity: number = 1.0

  @Uniform()
  @Serialize()
  softness: number = 1.0

  @Uniform()
  @Serialize()
  readonly color: vec3 = vec3.one.copy()

  @Uniform()
  readonly translation = new vec3()

  @Uniform()
  readonly direction = new vec3()

  @Uniform()
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

    this.boundingBox = new BoundingBox(new Polygon({
      vertices: this.frustum.getVertices()
    }))
  }
}

export const isLight = (component: Component): component is Light => {
  return component.type === 'Light'
}
