import { vec3 } from '@luz/vectors'
import { Plane } from '../../colliders/plane'
import { Collision } from '../../collision'
import { Sphere } from '../../volumes/sphere'

export function collidePlaneWithSphere(plane: Plane, sphere: Sphere): Collision[] | null {
  const { center: sphereCenter, radius } = sphere
  const { normal, distance: planeDistance } = plane

  const distanceFromSphereCenterToPlane = vec3.dot(sphereCenter, normal) - planeDistance

  if (Math.abs(distanceFromSphereCenterToPlane) <= radius) {
    const offset = vec3.scale(normal, distanceFromSphereCenterToPlane, new vec3())
    const contactPoint = vec3.subtract(sphereCenter, offset, new vec3())
    const penetrationDepth = radius - Math.abs(distanceFromSphereCenterToPlane)

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
