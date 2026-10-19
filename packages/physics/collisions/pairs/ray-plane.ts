import { Vector3 } from '@luz/math'
import type { Plane } from '../../colliders/plane'
import type { Ray } from '../../colliders/ray'
import type { RayIntersection } from '../../ray-intersection'

export const intersectRayWithPlane = (ray: Ray, plane: Plane): RayIntersection | null => {
  ray.validate()

  const { normal: planeNormal, distance: planeOffset } = plane
  const { origin: rayOrigin, direction: rayDirection } = ray

  const directionProjection = Vector3.calculateDotProduct(rayDirection, planeNormal)

  if (directionProjection === 0) {
    return null
  }

  const intersectionDistance = (planeOffset - Vector3.calculateDotProduct(rayOrigin, planeNormal)) / directionProjection

  if (intersectionDistance < 0) {
    return null
  }

  const contactOffset = Vector3.scale(rayDirection, intersectionDistance, new Vector3())
  const point = Vector3.add(rayOrigin, contactOffset, new Vector3())

  return { point, normal: planeNormal.clone(), distance: intersectionDistance }
}
