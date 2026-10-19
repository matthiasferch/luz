import { Vector3 } from '@luz/math'
import type { Plane } from '../../colliders/plane'
import type { Collision } from '../../collision'
import type { Sphere } from '../../volumes/sphere'
import { surfaceContactSlop, projectPointOntoPlane } from '../algorithms/surface-contact'

export function collidePlaneWithSphere(plane: Plane, sphere: Sphere): Collision[] | null {
  const { center, radius } = sphere
  const { normal, distance: planeDistance } = plane

  const signedDistance = Vector3.calculateDotProduct(center, normal) - planeDistance

  if (signedDistance <= radius + surfaceContactSlop) {
    const contactPoint = projectPointOntoPlane(center, normal, signedDistance)

    return [
      {
        point: contactPoint,
        normal: normal.clone(),
        penetrationDepth: Math.max(0, radius - signedDistance),
        featureId: 'plane:sphere',
        isRestingContact: true,
        contactType: 'point'
      }
    ]
  }

  return null
}
