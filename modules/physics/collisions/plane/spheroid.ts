import { vec3 } from '@luz/vectors'
import { Plane } from '../../colliders/plane'
import { Collision } from '../../collision'
import { Spheroid } from '../../volumes/spheroid'

export function collidePlaneWithSpheroid(plane: Plane, spheroid: Spheroid): Collision[] | null {
  const { center } = spheroid
  const { normal, distance: planeDistance } = plane

  // Signed distance from spheroid center to plane (positive in direction of plane normal)
  const signed = vec3.dot(center, normal) - planeDistance

  // Effective radius of spheroid along plane normal
  const r = spheroid.effectiveRadius(normal)

  if (Math.abs(signed) <= r) {
    const offset = vec3.scale(normal, signed, new vec3())
    const contactPoint = vec3.subtract(center, offset, new vec3()) // projection onto plane
    const penetrationDepth = r - Math.abs(signed)

    return [
      {
        contact: contactPoint,
        normal: normal.copy(),
        distance: penetrationDepth
      }
    ]
  }

  return null
}

