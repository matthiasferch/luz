import { vec3 } from '../../../vectors'
import { Collision } from '../../collision'
import { Sphere } from '../../volumes/sphere'

export const collideSphereWithSphere = (s1: Sphere, s2: Sphere): Collision | null => {
  const { center: c1, radius: r1 } = s1
  const { center: c2, radius: r2 } = s2

  const d = vec3.subtract(c2, c1)

  const d2 = d.squaredLength

  const s = r1 + r2

  if (d2 > s * s) {
    return null
  }

  const t = Math.sqrt(d2)

  const n = d.normalize()
  const p = vec3.add(c1, vec3.scale(n, r1))

  return { contact: p, normal: n, distance: t - s }
}