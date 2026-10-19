import { Vector3 } from '@luz/math'
import type { Plane } from '../../colliders/plane'
import type { Collision } from '../../collision'
import type { Ellipsoid } from '../../volumes/ellipsoid'
import { surfaceContactSlop, projectPointOntoPlane } from '../algorithms/surface-contact'

export function collidePlaneWithEllipsoid(plane: Plane, ellipsoid: Ellipsoid): Collision[] | null {
  const { center } = ellipsoid
  const { normal, distance: planeDistance } = plane

  const signedDistance = Vector3.calculateDotProduct(center, normal) - planeDistance
  const supportRadius = ellipsoid.calculateEffectiveRadius(normal)

  if (signedDistance <= supportRadius + surfaceContactSlop) {
    const support = ellipsoid.calculateSupportPoint(Vector3.scale(normal, -1))
    const contactPoint = projectPointOntoPlane(support, normal, plane.calculateSignedDistance(support))

    return [
      {
        point: contactPoint,
        normal: normal.clone(),
        penetrationDepth: Math.max(0, supportRadius - signedDistance),
        featureId: 'plane:ellipsoid',
        isRestingContact: true,
        contactType: 'point'
      }
    ]
  }

  return null
}
