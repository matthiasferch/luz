import { Transform } from '@luz/core'
import { Serialize, Register } from '@luz/utilities'
import { vec2, vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'
import { Plane } from '../colliders/plane'

@Register()
export class Frustum extends Volume {
  readonly type: Collider.Type = 'Frustum'

  @Serialize()
  aspect: number = 1.0

  @Serialize()
  aperture: number = 90.0

  @Serialize()
  readonly clipPlanes: vec2 = new vec2([1.0, 100.0])

  readonly axes: vec3[]

  constructor({ origin = vec3.zero } = {}) {
    super({ origin })

    this.axes = vec3.axes.map((axis) => axis.copy())
  }

  applyTransform(transform: Transform) {
    const { translation, rotation } = transform

    vec3.axes.forEach((axis, index) => {
      rotation.transformVec3(axis, this.axes[index]).normalize()
    })

    const midpoint = (this.clipPlanes.x + this.clipPlanes.y) * 0.5

    const centerOffset = vec3.scale(this.axes[2], midpoint, new vec3())
    const viewDirection = vec3.add(this.origin, translation, new vec3())

    vec3.subtract(viewDirection, centerOffset, this.center)
  }

  calculateInverseInertia(mass: number, transform: Transform) {
    throw new Error('Not implemented')
  }

  getVertices() {
    const tanHalfFov = Math.tan((this.aperture * Math.PI / 180) * 0.5)
    const nearHalfH = tanHalfFov * this.clipPlanes.x
    const nearHalfW = nearHalfH * this.aspect
    const farHalfH = tanHalfFov * this.clipPlanes.y
    const farHalfW = farHalfH * this.aspect

    const eye = vec3.add(this.center, vec3.scale(this.axes[2], (this.clipPlanes.x + this.clipPlanes.y) * 0.5, new vec3()), new vec3())

    const nearCenter = vec3.subtract(eye, vec3.scale(this.axes[2], this.clipPlanes.x, new vec3()), new vec3())
    const farCenter = vec3.subtract(eye, vec3.scale(this.axes[2], this.clipPlanes.y, new vec3()), new vec3())

    const vertices: vec3[] = []

    const nx = vec3.scale(this.axes[0], nearHalfW, new vec3())
    const ny = vec3.scale(this.axes[1], nearHalfH, new vec3())
    const fx = vec3.scale(this.axes[0], farHalfW, new vec3())
    const fy = vec3.scale(this.axes[1], farHalfH, new vec3())

    vertices.push(vec3.add(nearCenter, vec3.add(nx, ny, new vec3()), new vec3()))     // +x +y
    vertices.push(vec3.add(nearCenter, vec3.add(nx, vec3.scale(ny, -1, new vec3()), new vec3()), new vec3())) // +x -y
    vertices.push(vec3.add(nearCenter, vec3.add(vec3.scale(nx, -1, new vec3()), ny, new vec3()), new vec3())) // -x +y
    vertices.push(vec3.add(nearCenter, vec3.add(vec3.scale(nx, -1, new vec3()), vec3.scale(ny, -1, new vec3()), new vec3()), new vec3()))

    vertices.push(vec3.add(farCenter, vec3.add(fx, fy, new vec3()), new vec3()))     // +x +y
    vertices.push(vec3.add(farCenter, vec3.add(fx, vec3.scale(fy, -1, new vec3()), new vec3()), new vec3()))  // +x -y
    vertices.push(vec3.add(farCenter, vec3.add(vec3.scale(fx, -1, new vec3()), fy, new vec3()), new vec3()))  // -x +y
    vertices.push(vec3.add(farCenter, vec3.add(vec3.scale(fx, -1, new vec3()), vec3.scale(fy, -1, new vec3()), new vec3()), new vec3()))

    return vertices
  }

  getPlanes(): Plane[] {
    const vertices = this.getVertices()

    const ntr = vertices[0]
    const nbr = vertices[1]
    const ntl = vertices[2]
    const nbl = vertices[3]

    const viewDirection = vec3.add(this.center, vec3.scale(this.axes[2], (this.clipPlanes.x + this.clipPlanes.y) * 0.5, new vec3()), new vec3())

    const createPlane = (p0: vec3, p1: vec3, p2: vec3): Plane => {
      const e1 = vec3.subtract(p1, p0, new vec3())
      const e2 = vec3.subtract(p2, p0, new vec3())
      const n = vec3.cross(e1, e2, new vec3()).normalize()

      let normal = n
      let distance = vec3.dot(p0, normal)

      const inside = vec3.dot(this.center, normal) - distance

      if (inside > 0) {
        normal = normal.scale(-1)
        distance = -distance
      }

      return new Plane({ normal, distance })
    }

    // Near and Far planes can be constructed analytically
    const nearCenter = vec3.subtract(viewDirection, vec3.scale(this.axes[2], this.clipPlanes.x, new vec3()), new vec3())
    const farCenter = vec3.subtract(viewDirection, vec3.scale(this.axes[2], this.clipPlanes.y, new vec3()), new vec3())

    // Outward-facing normals so that inside satisfies signedDistance <= 0
    // Frustum extends along -Z from eye:
    // - Near plane outward normal is +Z
    // - Far plane outward normal is -Z
    const nearNormal = this.axes[2].copy()
    const farNormal = vec3.scale(this.axes[2], -1, new vec3())
    const nearPlane = new Plane({ normal: nearNormal, distance: vec3.dot(nearCenter, nearNormal) })
    const farPlane = new Plane({ normal: farNormal, distance: vec3.dot(farCenter, farNormal) })

    // Side planes from eye and clipPlanes.x-quad edges
    const leftPlane = createPlane(viewDirection, ntl, nbl)
    const rightPlane = createPlane(viewDirection, nbr, ntr)
    const topPlane = createPlane(viewDirection, ntr, ntl)
    const bottomPlane = createPlane(viewDirection, nbl, nbr)

    return [leftPlane, rightPlane, topPlane, bottomPlane, nearPlane, farPlane]
  }
}
