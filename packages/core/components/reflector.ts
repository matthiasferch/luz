import { Register, Serialize } from '@luz/serialization'
import { Vector3, Vector4 } from '@luz/math'
import { Component } from '../component'
import type { Transform } from '../transform'

@Register('reflector')
export class Reflector extends Component {
  readonly type = 'reflector'
  readonly timestep: Component.Timestep = 'variable'

  @Serialize()
  readonly normal: Vector3 = new Vector3([0, 1, 0])

  @Serialize()
  offset: number = 0

  @Serialize()
  resolutionScale: number = 0.5

  @Serialize()
  clipBias: number = 0.001

  @Serialize()
  intensity: number = 1

  @Serialize()
  maximumRoughness: number = 0.8

  @Serialize()
  readonly meshes: string[] = []

  readonly worldPlane: Vector4 = new Vector4([0, 1, 0, 0])

  update(transform: Transform): void {
    const worldNormal = transform.normalMatrix.transform(this.normal, new Vector3()).normalize()
    const localPoint = Vector3.scale(this.normal, this.offset, new Vector3())
    const worldPoint = transform.modelMatrix.transformVector3(localPoint)

    this.worldPlane.set([
      worldNormal.x,
      worldNormal.y,
      worldNormal.z,
      -Vector3.calculateDotProduct(worldNormal, worldPoint)
    ])
  }
}

export const isReflector = (component: Component): component is Reflector => {
  return component.type === 'reflector'
}
