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
      const penetrationDepth = -distanceToPlane // Negative because it's penetration

      collisions.push({
        contact: vertex.copy(), // The vertex itself is the contact point
        normal: normal,
        distance: penetrationDepth
      })
    }
  })

  return collisions.length > 0 ? collisions : null
}
