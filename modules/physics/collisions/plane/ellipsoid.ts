import { vec3 } from '@luz/vectors'
import { Plane } from '../../colliders/plane'
import { Collision } from '../../collision'
import { Ellipsoid } from '../../volumes/ellipsoid'

export function collidePlaneWithEllipsoid(plane: Plane, ellipsoid: Ellipsoid): Collision[] | null {
  const { center } = ellipsoid
  const { normal, distance: planeDistance } = plane

  const signed = vec3.dot(center, normal) - planeDistance
  const r = ellipsoid.effectiveRadius(normal)

  if (Math.abs(signed) <= r) {
    const offset = vec3.scale(normal, signed, new vec3())
    const contactPoint = vec3.subtract(center, offset, new vec3())
    const penetrationDepth = r - Math.abs(signed)

    return [
      { contact: contactPoint, normal: normal.copy(), distance: penetrationDepth }
    ]
  }

  return null
}

