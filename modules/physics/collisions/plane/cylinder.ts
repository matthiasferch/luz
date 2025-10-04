import { vec3 } from '@luz/vectors'
import { Plane } from '../../colliders/plane'
import { Collision } from '../../collision'
import { Cylinder } from '../../volumes/cylinder'

export function collidePlaneWithCylinder(plane: Plane, cylinder: Cylinder): Collision[] | null {
  const { center } = cylinder
  const { normal, distance: planeDistance } = plane

  const signed = vec3.dot(center, normal) - planeDistance
  const r = cylinder.effectiveRadius(normal)

  if (Math.abs(signed) <= r) {
    const offset = vec3.scale(normal, signed, new vec3())
    const contactPoint = vec3.subtract(center, offset, new vec3())
    const penetrationDepth = r - Math.abs(signed)
    return [ { contact: contactPoint, normal: normal.copy(), distance: penetrationDepth } ]
  }

  return null
}

