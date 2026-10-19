import { Vector3 } from '@luz/math'
import type { Ray } from '../../colliders/ray'
import type { RayIntersection } from '../../ray-intersection'
import type { Sphere } from '../../volumes/sphere'

export const intersectRayWithSphere = (ray: Ray, sphere: Sphere): RayIntersection | null => {
  ray.validate()

  const { origin, direction } = ray
  const { center, radius } = sphere

  const squaredRadius = radius * radius

  const centerOffset = Vector3.subtract(center, origin)
  const projectedDistance = Vector3.calculateDotProduct(direction, centerOffset)

  const squaredPerpendicularDistance = centerOffset.squaredMagnitude - projectedDistance * projectedDistance

  if (squaredPerpendicularDistance > squaredRadius) {
    return null
  }

  const halfChord = Math.sqrt(squaredRadius - squaredPerpendicularDistance)
  const nearDistance = projectedDistance - halfChord
  const farDistance = projectedDistance + halfChord

  if (nearDistance < 0 && farDistance < 0) {
    return null
  }

  const distance = nearDistance >= 0 ? nearDistance : farDistance

  const contactOffset = Vector3.scale(direction, distance, new Vector3())
  const point = Vector3.add(origin, contactOffset, new Vector3())

  let normal = Vector3.subtract(point, center, new Vector3())

  if (normal.magnitude === 0) {
    normal = Vector3.normalize(direction, new Vector3())
  } else {
    normal.normalize()
  }

  return { point, normal, distance }
}
