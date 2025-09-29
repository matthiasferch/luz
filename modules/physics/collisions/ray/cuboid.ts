import { vec3 } from '@luz/vectors'
import { Ray } from '../../colliders/ray'
import { Collision } from '../../collision'
import { Cuboid } from '../../volumes/cuboid'

const EPSILON = 1e-6

export const collideRayWithCuboid = (ray: Ray, cuboid: Cuboid): Collision | null => {
  const axes = cuboid.axes
  const extents = [cuboid.extents.x, cuboid.extents.y, cuboid.extents.z]

  const relativeOrigin = vec3.subtract(ray.origin, cuboid.center)

  let tMin = -Infinity
  let tMax = Infinity
  let entryAxis = -1
  let exitAxis = -1
  let entrySign = 1
  let exitSign = 1

  for (let i = 0; i < 3; i++) {
    const axis = axes[i]
    const extent = extents[i]

    const originProjection = vec3.dot(relativeOrigin, axis)
    const directionProjection = vec3.dot(ray.direction, axis)

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

    if (t1 > tMin) {
      tMin = t1
      entryAxis = i
      entrySign = faceEntrySign
    }

    if (t2 < tMax) {
      tMax = t2
      exitAxis = i
      exitSign = faceExitSign
    }

    if (tMin > tMax) {
      return null
    }
  }

  if (tMax < 0) {
    return null
  }

  const distance = tMin >= 0 ? tMin : tMax

  if (distance < 0) {
    return null
  }

  const axisIndex = tMin >= 0 ? entryAxis : exitAxis
  const sign = tMin >= 0 ? entrySign : exitSign

  if (axisIndex < 0) {
    return null
  }

  const contactOffset = vec3.scale(ray.direction, distance, new vec3())
  const contact = vec3.add(ray.origin, contactOffset, new vec3())

  const normal = axes[axisIndex].copy().scale(-sign)

  return { contact, normal, distance }
}
