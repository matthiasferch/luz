import { vec3 } from '@luz/vectors'
import { Plane } from '../../colliders/plane'
import { Collision } from '../../collision'
import { Cuboid } from '../../volumes/cuboid'

export const collidePlaneWithCuboid = (plane: Plane, cuboid: Cuboid): Collision[] | null => {
  const collisions: Collision[] = []

  cuboid.getVertices().forEach((vertex) => {
    const distanceToPlane = plane.signedDistance(vertex)

    // If the vertex is penetrating the plane, add it to the collision manifold
    if (distanceToPlane <= 0) {
      const normal = plane.normal.copy()
      const penetrationDepth = -distanceToPlane
      // Project the vertex onto the plane for a stable contact point
      const contactOnPlane = vec3.subtract(vertex, vec3.scale(normal, distanceToPlane, new vec3()), new vec3())

      collisions.push({
        contact: contactOnPlane,
        normal: normal,
        distance: penetrationDepth
      })
    }
  })

  return collisions.length > 0 ? collisions : null
}
