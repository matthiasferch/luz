import { vec3 } from '../../../vectors'
import { Plane } from '../../colliders/plane'
import { Ray } from '../../colliders/ray'
import { Collision } from '../../collision'

export const collideRayWithPlane = (ray: Ray, plane: Plane): Collision | null => {
  const { normal: n, distance: d } = plane
  const { origin: o, direction: e } = ray

  const s = vec3.dot(e, n)

  if (s === 0) {
    return null
  }

  const t = (d - vec3.dot(o, n)) / s

  if (t < 0) {
    return null
  }

  const p = vec3.add(o, vec3.scale(e, t))

  return { contact: p, normal: n, distance: t }
}