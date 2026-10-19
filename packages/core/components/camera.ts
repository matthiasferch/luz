import { Register, Serialize, Uniform } from '@luz/serialization'
import type { Component } from '../component'
import { Projector } from '../projector'

@Register('camera')
export class Camera extends Projector {
  readonly type = 'camera'
  readonly timestep: Component.Timestep = 'variable'

  @Uniform()
  @Serialize()
  isDepthOfFieldEnabled: boolean = false

  @Uniform()
  @Serialize()
  focusDistance: number = 10.0 // in engine world units

  @Uniform()
  @Serialize()
  focalLength: number = 50.0 // in millimeters

  @Uniform()
  @Serialize()
  sensorHeight: number = 32.0 // in millimeters

  @Uniform()
  @Serialize()
  fStop: number = 2.8

  static async deserialize(data: unknown): Promise<Camera> {
    const camera = (await super.deserialize(data)) as Camera

    if (!Number.isFinite(camera.fieldOfView) || camera.fieldOfView <= 0 || camera.fieldOfView >= 180) {
      throw new Error('Camera fieldOfView must be between 0 and 180 degrees, exclusively')
    }

    return camera
  }
}

export const isCamera = (component: Component): component is Camera => {
  return component.type === 'camera'
}
