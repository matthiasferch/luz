import { Transform } from '@luz/core'
import { Serialize, Register } from '@luz/utilities'
import { mat3, vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'
import { Plane } from '../colliders/plane'

// Pyramidal frustum oriented along local +Z, defined by vertical FOV (degrees) and aspect.
// Near/Far are distances along local +Z from the eye (apex) to the clipping planes.
@Register()
export class Frustum extends Volume {
  readonly type: Collider.Type = 'Frustum'

  @Serialize()
  fovY: number

  @Serialize()
  aspect: number

  @Serialize()
  near: number

  @Serialize()
  far: number

  // World-space unit axes corresponding to local X, Y, Z
  readonly axes: vec3[]

  constructor({ origin = vec3.zero, fovY = 60, aspect = 1.7778, near = 0.1, far = 100 } = {}) {
    super({ origin })

    this.fovY = fovY
    this.aspect = aspect
    this.near = near
    this.far = far

    this.axes = vec3.axes.map((axis) => axis.copy())
  }

  applyTransform(transform: Transform) {
    const { translation, rotation } = transform

    // Rotate local axes into world axes
    vec3.axes.forEach((axis, index) => {
      rotation.transformVec3(axis, this.axes[index]).normalize()
    })

    // Eye position is origin + translation
    const eye = vec3.add(this.origin, translation, new vec3())

    // Center at the midpoint between near/far plane centers along +Z
    const halfDepthAlongZ = (this.near + this.far) * 0.5
    const centerOffset = vec3.scale(this.axes[2], halfDepthAlongZ, new vec3())
    vec3.add(eye, centerOffset, this.center)
  }

  calculateInverseInertia(mass: number, transform: Transform) {
    // Approximate frustum inertia as a box with half-extents based on average near/far sizes
    const tanHalfFov = Math.tan((this.fovY * Math.PI / 180) * 0.5)
    const nearHalfHeight = tanHalfFov * this.near
    const nearHalfWidth = nearHalfHeight * this.aspect
    const farHalfHeight = tanHalfFov * this.far
    const farHalfWidth = farHalfHeight * this.aspect

    const halfDepth = (this.far - this.near) * 0.5
    const halfWidthAvg = (nearHalfWidth + farHalfWidth) * 0.5
    const halfHeightAvg = (nearHalfHeight + farHalfHeight) * 0.5

    // Box inertia with half-extents (x=width, y=height, z=depth)
    const Ixx = (1 / 3) * mass * (halfHeightAvg * halfHeightAvg + halfDepth * halfDepth)
    const Iyy = (1 / 3) * mass * (halfWidthAvg * halfWidthAvg + halfDepth * halfDepth)
    const Izz = (1 / 3) * mass * (halfWidthAvg * halfWidthAvg + halfHeightAvg * halfHeightAvg)

    const invIxx = Ixx > 0 ? 1 / Ixx : 0
    const invIyy = Iyy > 0 ? 1 / Iyy : 0
    const invIzz = Izz > 0 ? 1 / Izz : 0
    const IbodyInv = new mat3([invIxx, 0, 0, 0, invIyy, 0, 0, 0, invIzz])

    // World-space inverse inertia: R * IbodyInv * R^T
    const { rotationMatrix } = transform
    const Rt = rotationMatrix.copy().transpose()
    this.inverseInertia.reset()
    this.inverseInertia[0] = Rt[0]; this.inverseInertia[1] = Rt[1]; this.inverseInertia[2] = Rt[2]
    this.inverseInertia[3] = Rt[3]; this.inverseInertia[4] = Rt[4]; this.inverseInertia[5] = Rt[5]
    this.inverseInertia[6] = Rt[6]; this.inverseInertia[7] = Rt[7]; this.inverseInertia[8] = Rt[8]
    this.inverseInertia.multiply(IbodyInv)
    this.inverseInertia.multiply(rotationMatrix)
  }

  // Optional utility: compute eight corners in world-space
  getCorners(): vec3[] {
    const tanHalfFov = Math.tan((this.fovY * Math.PI / 180) * 0.5)
    const nearHalfH = tanHalfFov * this.near
    const nearHalfW = nearHalfH * this.aspect
    const farHalfH = tanHalfFov * this.far
    const farHalfW = farHalfH * this.aspect

    // Eye position (apex)
    const eye = vec3.subtract(this.center, vec3.scale(this.axes[2], (this.near + this.far) * 0.5, new vec3()), new vec3())
    const nearCenter = vec3.subtract(eye, vec3.scale(this.axes[2], this.near, new vec3()), new vec3())
    const farCenter = vec3.subtract(eye, vec3.scale(this.axes[2], this.far, new vec3()), new vec3())

    const corners: vec3[] = []
    const nx = vec3.scale(this.axes[0], nearHalfW, new vec3())
    const ny = vec3.scale(this.axes[1], nearHalfH, new vec3())
    const fx = vec3.scale(this.axes[0], farHalfW, new vec3())
    const fy = vec3.scale(this.axes[1], farHalfH, new vec3())

    // Near plane (4 corners)
    corners.push(vec3.add(nearCenter, vec3.add(nx, ny, new vec3()), new vec3()))     // +x +y
    corners.push(vec3.add(nearCenter, vec3.add(nx, vec3.scale(ny, -1, new vec3()), new vec3()), new vec3())) // +x -y
    corners.push(vec3.add(nearCenter, vec3.add(vec3.scale(nx, -1, new vec3()), ny, new vec3()), new vec3())) // -x +y
    corners.push(vec3.add(nearCenter, vec3.add(vec3.scale(nx, -1, new vec3()), vec3.scale(ny, -1, new vec3()), new vec3()), new vec3())) // -x -y

    // Far plane (4 corners)
    corners.push(vec3.add(farCenter, vec3.add(fx, fy, new vec3()), new vec3()))     // +x +y
    corners.push(vec3.add(farCenter, vec3.add(fx, vec3.scale(fy, -1, new vec3()), new vec3()), new vec3()))  // +x -y
    corners.push(vec3.add(farCenter, vec3.add(vec3.scale(fx, -1, new vec3()), fy, new vec3()), new vec3()))  // -x +y
    corners.push(vec3.add(farCenter, vec3.add(vec3.scale(fx, -1, new vec3()), vec3.scale(fy, -1, new vec3()), new vec3()), new vec3()))  // -x -y

    return corners
  }

  // World-space frustum planes with inward-pointing normals.
  getPlanes(): Plane[] {
    const corners = this.getCorners()

    // Alias corners
    const ntr = corners[0]
    const nbr = corners[1]
    const ntl = corners[2]
    const nbl = corners[3]
    const ftr = corners[4]
    const fbr = corners[5]
    const ftl = corners[6]
    const fbl = corners[7]

    // Eye point reconstructed from center and axisZ
    const eye = vec3.subtract(this.center, vec3.scale(this.axes[2], (this.near + this.far) * 0.5, new vec3()), new vec3())

    const inwardReference = this.center

    const makePlane = (p0: vec3, p1: vec3, p2: vec3): Plane => {
      // Normal via CCW winding p0->p1->p2
      const e1 = vec3.subtract(p1, p0, new vec3())
      const e2 = vec3.subtract(p2, p0, new vec3())
      const n = vec3.cross(e1, e2, new vec3()).normalize()
      let normal = n
      let distance = vec3.dot(p0, normal)
      // Ensure normal points inward toward the frustum center
      const inside = vec3.dot(inwardReference, normal) - distance
      if (inside < 0) {
        normal = normal.scale(-1)
        distance = -distance
      }
      return new Plane({ normal, distance })
    }

    // Near and Far planes can be constructed analytically
    const nearCenter = vec3.subtract(eye, vec3.scale(this.axes[2], this.near, new vec3()), new vec3())
    const farCenter = vec3.subtract(eye, vec3.scale(this.axes[2], this.far, new vec3()), new vec3())

    // Orient normals so that signedDistance(center) >= 0 for all planes
    // Near plane faces inward along +Z, far plane faces inward along -Z
    const nearNormal = this.axes[2].copy()
    const farNormal = vec3.scale(this.axes[2], -1, new vec3())
    const nearPlane = new Plane({ normal: nearNormal, distance: vec3.dot(nearCenter, nearNormal) })
    const farPlane = new Plane({ normal: farNormal, distance: vec3.dot(farCenter, farNormal) })

    // Side planes from eye and near-quad edges
    const leftPlane = makePlane(eye, ntl, nbl)
    const rightPlane = makePlane(eye, nbr, ntr)
    const topPlane = makePlane(eye, ntr, ntl)
    const bottomPlane = makePlane(eye, nbl, nbr)

    return [leftPlane, rightPlane, topPlane, bottomPlane, nearPlane, farPlane]
  }
}
