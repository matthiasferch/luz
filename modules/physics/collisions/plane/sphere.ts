import { vec3 } from '@luz/vectors'
import { Plane } from '../../colliders/plane'
import { Collision } from '../../collision'
import { Sphere } from '../../volumes/sphere'

export function collidePlaneWithSphere(plane: Plane, sphere: Sphere): Collision[] | null {
  const { center: sphereCenter, radius } = sphere
  const { normal, distance: planeDistance } = plane

  // Step 1: Calculate the signed distance from the sphere center to the plane
  const distanceFromSphereCenterToPlane = vec3.dot(sphereCenter, normal) - planeDistance

  // Step 2: Check if the sphere is colliding with the plane (distance < radius)
  if (Math.abs(distanceFromSphereCenterToPlane) <= radius) {
    // Step 3: Compute the contact point
    const contactPoint = vec3.subtract(sphereCenter, vec3.scale(normal, distanceFromSphereCenterToPlane))

    // Step 4: Compute the penetration depth (how much the sphere is intersecting the plane)
    const penetrationDepth = radius - Math.abs(distanceFromSphereCenterToPlane)

    // Return the collision details
    return [
      {
        contact: contactPoint.copy(), // Contact point should be on the plane
        normal: normal.copy(), // The normal of the collision is the plane's normal
        distance: penetrationDepth // Penetration depth is how much the sphere overlaps the plane
      }
    ]
  }

  return null // No collision
}
