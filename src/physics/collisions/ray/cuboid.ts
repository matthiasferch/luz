import { vec3 } from '../../../vectors'
import { Ray } from '../../colliders/ray'
import { Collision } from '../../collision'
import { Cuboid } from '../../volumes/cuboid'

const { min, max } = Math

export const collideRayWithCuboid = (ray: Ray, cuboid: Cuboid): Collision | null => {
  const { origin: o, direction: n } = ray
  const { center: c, extents: e } = cuboid
  
  const maximum = vec3.add(c, e)
  const minimum = vec3.subtract(c, e)

  const s1 = vec3.subtract(minimum, o).divide(n)
  const s2 = vec3.subtract(maximum, o).divide(n)

  const m1 = max(min(s1.x, s2.x), min(s1.y, s2.y), min(s1.z, s2.z))
  const m2 = min(max(s1.x, s2.x), max(s1.y, s2.y), max(s1.z, s2.z))

  if (m2 < 0 || m1 > m2) {
    return null
  }

  const d = (m1 < 0) ? m2 : m1

  const p = vec3.add(o, n).scale(d)

  return { contact: p, normal: n, distance: d }
}