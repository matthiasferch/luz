import { vec3 } from '../../../vectors'
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

  if (t < 0) {
    return null
  }

  const d2 = s.squaredLength - (t * t)

  if (d2 > r2) {
    return null
  }

  const d = t - sqrt(r2 - d2)

  const p = vec3.add(o, vec3.scale(e, d))
  const n = vec3.subtract(p, c).normalize()

  return { contact: p, normal: n, distance: d }
}