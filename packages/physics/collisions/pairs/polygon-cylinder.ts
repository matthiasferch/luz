import { getPolygonFacingPoint } from '../algorithms/polygon-geometry'
import { Vector3 } from '@luz/math'
import type { Collision } from '../../collision'
import type { Cylinder } from '../../volumes/cylinder'
import type { Polygon } from '../../colliders/polygon'
import { findClosestPointOnPolygon, polygonContactSlop } from '../algorithms/polygon-geometry'
import { collidePolygonWithVolume } from '../algorithms/polygon-volume'
import { projectPointOntoPlane, surfaceContactSlop } from '../algorithms/surface-contact'

import { calculateCylinderSurfaceSupportPoints } from './plane-cylinder'

const { max } = Math

export const collidePolygonWithCylinder = (polygon: Polygon, cylinder: Cylinder): Collision[] | null => {
  polygon = getPolygonFacingPoint(polygon, cylinder.center)

  const collisions: Collision[] = []

  const exactSupport = cylinder.calculateSupportPoint(Vector3.scale(polygon.normal, -1))

  if (
    Vector3.calculateDotProduct(Vector3.subtract(exactSupport, polygon.vertices[0]), polygon.normal) >
    surfaceContactSlop
  ) {
    return null
  }

  const supports = calculateCylinderSurfaceSupportPoints(cylinder, polygon.normal)

  if (
    Vector3.calculateDotProduct(exactSupport, polygon.normal) <
    Math.min(...supports.map(({ point }) => Vector3.calculateDotProduct(point, polygon.normal))) - 1e-6
  ) {
    supports.push({ point: exactSupport, featureId: 'cylinder:exact-support', contactType: 'point' })
  }

  supports.forEach(({ point, featureId, contactType }) => {
    const planeDistance = Vector3.calculateDotProduct(
      Vector3.subtract(point, polygon.vertices[0], new Vector3()),
      polygon.normal
    )

    if (planeDistance > surfaceContactSlop) {
      return
    }

    const projectedSupportPoint = projectPointOntoPlane(point, polygon.normal, planeDistance)
    const closestPoint = findClosestPointOnPolygon(projectedSupportPoint, polygon)
    const lateralOffset = Vector3.subtract(closestPoint, projectedSupportPoint, new Vector3()).magnitude

    if (lateralOffset <= polygonContactSlop) {
      collisions.push({
        point: projectedSupportPoint,
        normal: polygon.normal.clone(),
        penetrationDepth: max(0, -planeDistance),
        featureId,
        isRestingContact: true,
        contactType
      })
    }
  })

  if (collisions.length > 0) {
    return collisions
  }

  return collidePolygonWithVolume(polygon, cylinder)
}
