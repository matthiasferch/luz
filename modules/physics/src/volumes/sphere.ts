import { Transform } from '@luz/core'
import { mat3, vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Plane } from '../colliders/plane'
import { Ray } from '../colliders/ray'
import { Collision } from '../collision'
import { collidePlaneWithSphere } from '../collisions/plane'
import { collideRayWithSphere } from '../collisions/ray'
import { collideSphereWithCuboid, collideSphereWithSphere } from '../collisions/sphere'
import { Volume } from '../volume'
import { Cuboid } from './cuboid'

export class Sphere extends Volume {

  type = Collider.Type.Sphere

  readonly center: vec3

  readonly inertia: mat3

  radius: number

  constructor({
    center = vec3.zero,
    radius = 1.0
  }) {
    super()

    this.center = center.copy()
    this.radius = radius

    this.inertia = new mat3()
  }

  calculateInertia(mass: number, transform: Transform) {
    const { radius } = this

    const t = (2 / 5) * mass * radius * radius

    this.inertia.set([
      t, 0, 0,
      0, t, 0,
      0, 0, t
    ])

    this.inertia.invert()
  }

  collide(collider: Collider): Collision | null {
    switch (collider.type) {
      case Collider.Type.Ray:
        return collideRayWithSphere(collider as Ray, this)

      case Collider.Type.Plane:
        return collidePlaneWithSphere(collider as Plane, this)

      case Collider.Type.Sphere:
        return collideSphereWithSphere(this, collider as Sphere)

      case Collider.Type.Cuboid:
        return collideSphereWithCuboid(this, collider as Cuboid)

      default:
        return null
    }
  }

  transform(transform: Transform) {
    const { modelMatrix } = transform

    const center = modelMatrix.transformVec3(this.center)

    return new Sphere({ center, radius: this.radius })
  }

  toJSON() {
    const { center, radius } = this

    return { center, radius }
  }

}
