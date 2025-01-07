import { vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Cuboid } from '../../volumes/cuboid'
import { Sphere } from '../../volumes/sphere'

export function collideSphereWithCuboid(sphere: Sphere, cuboid: Cuboid): Collision[] | null {
  // Step 1: Find the closest point on the cuboid's surface to the sphere's center
  const closestPoint = new vec3([
    Math.max(cuboid.center.x - cuboid.extents.x, Math.min(sphere.center.x, cuboid.center.x + cuboid.extents.x)),
    Math.max(cuboid.center.y - cuboid.extents.y, Math.min(sphere.center.y, cuboid.center.y + cuboid.extents.y)),
    Math.max(cuboid.center.z - cuboid.extents.z, Math.min(sphere.center.z, cuboid.center.z + cuboid.extents.z))
  ])

  // Step 2: Calculate the distance from the closest point to the sphere's center
  const distanceToCuboid = vec3.distance(closestPoint, sphere.center)

  // Step 3: Check if a collision has occurred (i.e., distance to cuboid is less than the sphere's radius)
  if (distanceToCuboid <= sphere.radius) {
    // Step 4: Calculate the correct normal (from cuboid surface to sphere center)
    const normal = vec3.subtract(sphere.center, closestPoint).normalize()

    // Step 5: Compute the penetration depth
    const penetrationDepth = sphere.radius - distanceToCuboid

    // Return the collision details
    return [
      {
        contact: closestPoint.copy(),
        normal: normal.copy(), // This will point from the cuboid toward the sphere
        distance: penetrationDepth
      }
    ]
  }

  return null // No collision
}
