import { vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Cuboid } from '../../volumes/cuboid'
import { Polygon } from '../../colliders/polygon'

const Epsilon = 0.0001

export function collidePolygonWithCuboid(polygon: Polygon, cuboid: Cuboid): Collision[] | null {
  const collisions: Collision[] = []

  const cuboidVertices = cuboid.getVertices()

  // Iterate over each cuboid vertex and check if it collides with the polygon
  for (const vertex of cuboidVertices) {
    const distanceToPlane = vec3.dot(vec3.subtract(vertex, polygon.vertices[0]), polygon.normal)

    // If the vertex is close enough to the polygon plane (considering some epsilon), we have a contact point
    if (Math.abs(distanceToPlane) <= Epsilon) {
      collisions.push({
        contact: vertex.copy(),
        normal: polygon.normal.copy(),
        distance: distanceToPlane
      })
    }
  }

  // If no vertices are colliding, check if any edges of the cuboid intersect with the polygon plane
  if (collisions.length === 0) {
    const cuboidEdges = cuboid.getEdges()

    for (const [i1, i2] of cuboidEdges) {
      const v1 = cuboidVertices[i1]
      const v2 = cuboidVertices[i2]
      const edgeVector = vec3.subtract(v2, v1)
      const edgeDirection = vec3.normalize(edgeVector)

      // Project the edge onto the polygon plane normal
      const dot = vec3.dot(edgeDirection, polygon.normal)

      if (Math.abs(dot) > Epsilon) {
        const t = -vec3.dot(vec3.subtract(v1, polygon.vertices[0]), polygon.normal) / dot

        if (t >= 0 && t <= 1) {
          const contactPoint = vec3.add(v1, vec3.scale(edgeVector, t))
          collisions.push({
            contact: contactPoint,
            normal: polygon.normal.copy(),
            distance: 0
          })
        }
      }
    }
  }

  return collisions.length > 0 ? collisions : null
}
