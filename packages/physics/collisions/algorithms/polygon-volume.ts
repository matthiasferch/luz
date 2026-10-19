import { Vector3 } from '@luz/math'
import type { Polygon } from '../../colliders/polygon'
import type { Volume } from '../../volume'
import type { Collision } from '../../collision'
import { normalizeCollisions } from '../../collision'
import { collideConvexShapes } from './convex-queries'

export const collidePolygonWithVolume = (polygon: Polygon, volume: Volume): Collision[] | null => {
  const contacts: Collision[] = []

  for (const vertices of polygon.triangles) {
    const triangle = {
      center: vertices.reduce((sum, point) => sum.add(point), new Vector3()).scale(1 / 3),
      calculateSupportPoint: (direction: Vector3) =>
        vertices
          .reduce((supportPoint, point) =>
            Vector3.calculateDotProduct(point, direction) > Vector3.calculateDotProduct(supportPoint, direction)
              ? point
              : supportPoint
          )
          .clone()
    }
    const collisions = collideConvexShapes(triangle, volume)

    collisions?.forEach((contact) =>
      contacts.push({
        ...contact,
        isRestingContact: true,
        contactType: 'point',
        featureId: `polygon:${volume.type.toLowerCase()}`
      })
    )
  }

  return contacts.length ? normalizeCollisions(contacts) : null
}
