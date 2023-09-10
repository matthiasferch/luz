import { vec3 } from '../../../vectors'
import { Collision } from '../../collision'
import { Cuboid } from '../../volumes/cuboid'
import { Sphere } from '../../volumes/sphere'

const { sqrt, min, max } = Math

export const collideSphereWithCuboid = (sphere: Sphere, cuboid: Cuboid): Collision | null => {
  const { center: c1, radius: r } = sphere
  const { center: c2, extents: e } = cuboid
  
  const r2 = r * r

  const m1 = vec3.add(c2, e)
  const m2 = vec3.subtract(c2, e)

  const m = new vec3([
    max(m2.x, min(c1.x, m1.x)),
    max(m2.y, min(c1.y, m1.y)),
    max(m2.z, min(c1.z, m1.z))
  ])

  const d1 = vec3.subtract(m, c1)
  const d2 = vec3.dot(d1, d1)

  if (d2 > r2) {
    return null
  }

  const n = vec3.normalize(d1)
  const p = vec3.add(c1, vec3.scale(n, r))

  return { contact: p, normal: n, distance: sqrt(r2 - d2) }
}