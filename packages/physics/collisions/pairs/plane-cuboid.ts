import { Vector3 } from '@luz/math'
import type { Plane } from '../../colliders/plane'
import type { Collision } from '../../collision'
import type { Cuboid } from '../../volumes/cuboid'

const contactSlop = 0.005
const cuboidVertexSigns = [
  [+1, +1, +1],
  [+1, +1, -1],
  [+1, -1, +1],
  [+1, -1, -1],
  [-1, +1, +1],
  [-1, +1, -1],
  [-1, -1, +1],
  [-1, -1, -1]
]

const formatSignLabel = (value: number, axis: string) => `${value > 0 ? '+' : '-'}${axis}`

const createCuboidVertexFeatureId = (index: number) => {
  const [sx, sy, sz] = cuboidVertexSigns[index]

  return `cuboid:vertex:${formatSignLabel(sx, 'x')}:${formatSignLabel(sy, 'y')}:${formatSignLabel(sz, 'z')}`
}

export const collidePlaneWithCuboid = (plane: Plane, cuboid: Cuboid): Collision[] | null => {
  const collisions: Collision[] = []

  cuboid.calculateVertices().forEach((vertex, index) => {
    const distanceToPlane = plane.calculateSignedDistance(vertex)

    if (distanceToPlane <= contactSlop) {
      const normal = plane.normal.clone()
      const penetrationDepth = Math.max(0, -distanceToPlane)
      const contactOnPlane = Vector3.subtract(
        vertex,
        Vector3.scale(normal, distanceToPlane, new Vector3()),
        new Vector3()
      )

      collisions.push({
        point: contactOnPlane,
        normal: normal,
        penetrationDepth: penetrationDepth,
        featureId: createCuboidVertexFeatureId(index),
        isRestingContact: true,
        contactType: 'patch'
      })
    }
  })

  return collisions.length > 0 ? collisions : null
}
