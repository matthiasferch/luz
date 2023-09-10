import { vec3 } from '../../../vectors'
import { Plane } from '../../colliders/plane'
import { Collision } from '../../collision'
import { Cuboid } from '../../volumes/cuboid'

const { abs } = Math

export const collidePlaneWithCuboid = (plane: Plane, cuboid: Cuboid): Collision | null => {
  const { normal: n, distance: d } = plane
  const { center: c, extents: e } = cuboid

  const s = vec3.dot(n, c) - d

  const t = abs(s)

  const f = abs(n.x * e.x) + abs(n.y * e.y) + abs(n.z * e.z)

  if (t > f) {
    return null
  }

  const p = vec3.subtract(c, vec3.scale(n, f))

  return { contact: p, normal: n, distance: t - f }
}