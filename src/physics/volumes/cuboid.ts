import { Transform } from '../../core'
import { Serialized } from '../../utilities'
import { vec3 } from '../../vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'

export class Cuboid extends Volume {

  readonly type = Collider.Type.Cuboid

  @Serialized
  readonly extents: Readonly<vec3>

  readonly axes: vec3[]

  constructor({
    origin = vec3.zero,
    extents = vec3.one
  } = {}) {
    super({ origin })

    this.extents = extents.copy()

    this.axes = []

    vec3.axes.forEach((axis) => {
      this.axes.push(axis.copy())
    })
  }

  transform(transform: Transform) {
    const { translation, rotation } = transform

    vec3.add(this.origin, translation, this.center)

    vec3.axes.forEach((axis, index) => {
      rotation.transformVec3(axis, this.axes[index])
    })
  }

  calculateInertia(mass: number, transform: Transform) {
    const { rotationMatrix } = transform

    const { x, y, z } = this.extents

    const t1 = (1 / 12) * mass * (y * y + z * z)
    const t2 = (1 / 12) * mass * (x * x + z * z)
    const t3 = (1 / 12) * mass * (x * x + y * y)

    this.inertia.set([
      t1, 0, 0,
      0, t2, 0,
      0, 0, t3
    ])

    this.inertia.multiply(rotationMatrix).invert()
  }

}
