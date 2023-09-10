import { vec3 } from '../../../vectors'
import { Plane } from '../../colliders/plane'
import { Collision } from '../../collision'
import { Sphere } from '../../volumes/sphere'

const { abs } = Math

export const collidePlaneWithSphere = (plane: Plane, sphere: Sphere): Collision | null => {
  const { normal: n, distance: d } = plane
  const { center: c, radius: r } = sphere

  const s = vec3.dot(n, c) + d

  const t = abs(s)

  if (t > r) {
    return null
  }

  const e = r - t
  const f = vec3.scale(n, e)

  const p = (s < 0) ? vec3.subtract(c, f) : vec3.add(c, f)

  return { contact: p, normal: n, distance: t }
}
