import { Transform } from '@luz/core'
import { mat3, quat, vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Plane } from '../colliders/plane'
import { Ray } from '../colliders/ray'
import { Collision } from '../collision'
import { collideCuboidWithCuboid } from '../collisions/cuboid'
import { collidePlaneWithCuboid } from '../collisions/plane'
import { collideRayWithCuboid } from '../collisions/ray'
import { collideSphereWithCuboid } from '../collisions/sphere'
import { Volume } from '../volume'
import { Sphere } from './sphere'

export class Cuboid extends Volume {

  type = Collider.Type.Cuboid

  readonly center: vec3
  readonly extents: vec3

  readonly axes: vec3[]
  readonly inertia: mat3

  constructor({
    center = vec3.zero,
    extents = vec3.one,
    rotation = quat.identity
  } = {}) {
    super()

    this.center = center.copy()
    this.extents = extents.copy()

    this.axes = []

    vec3.axes.forEach((axis) => {
      this.axes.push(rotation.transformVec3(axis))
    })

    this.inertia = new mat3()
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

  collide(collider: Collider): Collision | null {
    switch (collider.type) {
      case Collider.Type.Ray:
        return collideRayWithCuboid(collider as Ray, this)

      case Collider.Type.Plane:
        return collidePlaneWithCuboid(collider as Plane, this)

      case Collider.Type.Sphere:
        return collideSphereWithCuboid(collider as Sphere, this)

      case Collider.Type.Cuboid:
        return collideCuboidWithCuboid(this, collider as Cuboid)

      default:
        return null
    }
  }

  transform(transform: Transform) {
    // const { vertices } = this
    const { translation } = transform

    /*const transformedVertices = vertices.map((vertex) => {
      return modelMatrix.transformVec3(vertex)
    })

    const minimum = transformedVertices.reduce(
      (final, vertex) => vec3.minimum(final, vertex),
      vec3.infinity.copy()
    )

    const maximum = transformedVertices.reduce(
      (final, vertex) => vec3.maximum(final, vertex),
      vec3.infinity.copy().negate()
    )

    return new Cuboid({
      center: vec3.add(minimum, maximum).scale(0.5),
      extents: vec3.subtract(maximum, minimum).scale(0.5)
    })*/

    return new Cuboid({
      center: vec3.add(translation, this.center),
      extents: this.extents.copy(),
      rotation: transform.rotation
    })
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
