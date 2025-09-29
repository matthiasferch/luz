import { vec3 } from '@luz/vectors'
import { Ray } from '../../colliders/ray'
import { Collision } from '../../collision'
import { Sphere } from '../../volumes/sphere'

const { sqrt } = Math

export const collideRayWithSphere = (ray: Ray, sphere: Sphere): Collision | null => {
  const { origin: o, direction: e } = ray
  const { center: c, radius: r } = sphere

  const r2 = r * r

  const s = vec3.subtract(c, o)
  const t = vec3.dot(e, s)

  const d2 = s.squaredLength - t * t

  if (d2 > r2) {
    return null
  }

  const thc = sqrt(r2 - d2)
  const t0 = t - thc
  const t1 = t + thc

  if (t0 < 0 && t1 < 0) {
    return null
  }

  const distance = t0 >= 0 ? t0 : t1

  const contactOffset = vec3.scale(e, distance, new vec3())
  const contact = vec3.add(o, contactOffset, new vec3())
  let normal = vec3.subtract(c, contact, new vec3())

  if (normal.length === 0) {
    normal = vec3.normalize(e, new vec3())
  } else {
    normal.normalize()
  }

  return { contact, normal, distance }
}
