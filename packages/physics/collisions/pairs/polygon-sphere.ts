import { Vector3 } from '@luz/math'
import type { Collision } from '../../collision'
import type { Sphere } from '../../volumes/sphere'
import type { Polygon } from '../../colliders/polygon'
import { findClosestPointOnPolygon, polygonContactSlop } from '../algorithms/polygon-geometry'
import { createSurfaceCollision } from '../algorithms/surface-contact'

const { sqrt } = Math

export const collidePolygonWithSphere = (polygon: Polygon, sphere: Sphere): Collision[] | null => {
  const contact = findClosestPointOnPolygon(sphere.center, polygon)

  const direction = Vector3.subtract(contact, sphere.center)
  const distanceSquared = Vector3.calculateDotProduct(direction, direction)

  if (distanceSquared <= (sphere.radius + polygonContactSlop) * (sphere.radius + polygonContactSlop)) {
    const distance = sqrt(distanceSquared)

    const normal = distance > 1e-6 ? direction.clone().scale(-1 / distance) : polygon.normal.clone()

    for (let axis = 0; axis < 3; axis++) {
      if (normal[axis] === 0) {
        normal[axis] = 0
      }
    }

    return [createSurfaceCollision(contact, normal, distance, sphere.radius, 'polygon:sphere')]
  }

  return null
}
