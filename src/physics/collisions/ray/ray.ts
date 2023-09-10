import { vec3 } from '../../../vectors'
import { Ray } from '../../colliders/ray'
import { Collision } from '../../collision'

export const collideRayWithRay = (ray1: Ray, ray2: Ray): Collision | null => {
  const { direction: d1, origin: o1 } = ray1
  const { direction: d2, origin: o2 } = ray2

  const c = vec3.cross(d1, d2)
  const d = vec3.dot(c, c)

  if (d === 0) {
    return null
  }

  const f = vec3.subtract(o2, o1)

  const u = vec3.cross(c, f).scale(1 / d)
  const t = vec3.dot(vec3.cross(f, d2), c) / d

  if (t < 0 || t > 1) {
    return null
  }

  const c1 = vec3.add(o1, vec3.scale(d1, t))
  const c2 = vec3.add(o2, vec3.scale(d2, u.z))

  const normal = vec3.subtract(c1, c2).normalize()
  const distance = vec3.dot(vec3.subtract(c1, o1), d1)

  return { contact: c1, normal, distance }
}