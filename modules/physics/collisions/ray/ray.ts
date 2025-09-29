import { vec3 } from '@luz/vectors'
import { Ray } from '../../colliders/ray'
import { Collision } from '../../collision'

export const collideRayWithRay = (ray1: Ray, ray2: Ray): Collision | null => {
  const { direction: d1, origin: o1 } = ray1
  const { direction: d2, origin: o2 } = ray2

  const c = vec3.cross(d1, d2)
  const determinant = vec3.dot(c, c)

  if (determinant === 0) {
    return null
  }

  const f = vec3.subtract(o2, o1)

  const u = vec3.cross(c, f).scale(1 / determinant)
  const t = vec3.dot(vec3.cross(f, d2), c) / determinant

  if (t < 0 || t > 1) {
    return null
  }

  const contact1 = vec3.add(o1, vec3.scale(d1, t, new vec3()), new vec3())
  const contact2 = vec3.add(o2, vec3.scale(d2, u.z, new vec3()), new vec3())

  const normal = vec3.subtract(contact1, contact2).normalize()
  const distance = vec3.dot(vec3.subtract(contact1, o1), d1)

  return { contact: contact1, normal, distance }
}
