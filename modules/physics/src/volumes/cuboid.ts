import { Transform } from '@luz/core'
import { mat3, vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'

export class Cuboid extends Volume {

  type = Collider.Type.Cuboid

  readonly origin: vec3

  readonly center: vec3

  readonly extents: vec3

  readonly axes: vec3[]

  readonly inertia: mat3

  constructor({
    origin = vec3.zero,
    extents = vec3.one
  } = {}) {
    super()

    this.origin = origin.copy()
    this.center = origin.copy()

    this.extents = extents.copy()

    this.axes = []

    vec3.axes.forEach((axis) => {
      this.axes.push(axis.copy())
    })

    this.inertia = new mat3()
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

  get vertices() {
    const { center, extents } = this

    const vertices: vec3[] = []

    for (let x of [-1, 1]) {
      for (let y of [-1, 1]) {
        for (let z of [-1, 1]) {
          vertices.push(
            new vec3([
              center.x + x * extents.x,
              center.y + y * extents.y,
              center.z + z * extents.z,
            ])
          )
        }
      }
    }

    return vertices
  }

  toJSON() {
    const { center, extents } = this

    return { center, extents }
  }

}
