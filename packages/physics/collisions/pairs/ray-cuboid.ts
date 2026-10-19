import { Vector3 } from '@luz/math'
import type { Ray } from '../../colliders/ray'
import type { RayIntersection } from '../../ray-intersection'
import type { Cuboid } from '../../volumes/cuboid'

const EPSILON = 1e-6

export const intersectRayWithCuboid = (ray: Ray, cuboid: Cuboid): RayIntersection | null => {
  ray.validate()

  const axes = cuboid.axes
  const extents = [cuboid.extents.x, cuboid.extents.y, cuboid.extents.z]

  const relativeOrigin = Vector3.subtract(ray.origin, cuboid.center)

  let minimumDistance = -Infinity
  let maximumDistance = Infinity
  let entryAxis = -1
  let exitAxis = -1
  let entrySign = 1
  let exitSign = 1

  for (let index = 0; index < 3; index++) {
    const axis = axes[index]
    const extent = extents[index]

    const originProjection = Vector3.calculateDotProduct(relativeOrigin, axis)
    const directionProjection = Vector3.calculateDotProduct(ray.direction, axis)

    if (Math.abs(directionProjection) < EPSILON) {
      if (originProjection < -extent || originProjection > extent) {
        return null
      }

      continue
    }

    const inverseDirection = 1 / directionProjection

    let t1 = (-extent - originProjection) * inverseDirection
    let t2 = (extent - originProjection) * inverseDirection

    let faceEntrySign = -1
    let faceExitSign = 1

    if (t1 > t2) {
      ;[t1, t2] = [t2, t1]
      ;[faceEntrySign, faceExitSign] = [faceExitSign, faceEntrySign]
    }

    if (t1 > minimumDistance) {
      minimumDistance = t1
      entryAxis = index
      entrySign = faceEntrySign
    }

    if (t2 < maximumDistance) {
      maximumDistance = t2
      exitAxis = index
      exitSign = faceExitSign
    }

    if (minimumDistance > maximumDistance) {
      return null
    }
  }

  if (maximumDistance < 0) {
    return null
  }

  const distance = minimumDistance >= 0 ? minimumDistance : maximumDistance

  if (distance < 0) {
    return null
  }

  const axisIndex = minimumDistance >= 0 ? entryAxis : exitAxis
  const sign = minimumDistance >= 0 ? entrySign : exitSign

  if (axisIndex < 0) {
    return null
  }

  const contactOffset = Vector3.scale(ray.direction, distance, new Vector3())
  const point = Vector3.add(ray.origin, contactOffset, new Vector3())

  const normal = axes[axisIndex].clone().scale(sign)

  return { point, normal, distance }
}
