import { vec3 } from '@luz/vectors'

import { Collision } from '../collision'
import { Cuboid } from '../colliders/cuboid'
import { Sphere } from '../colliders/sphere'
import { Transform } from '../transform'

const { sqrt, min, max } = Math

export const collideSphereWithSphere = (s1: Sphere, s2: Sphere, t1: Transform, t2: Transform): Collision | null => {
  const d = vec3.subtract(s2.center, s1.center)

  const d2 = d.squaredLength

  const s = s1.radius + s2.radius

  if (d2 > s * s) {
    return null
  }

  const t = Math.sqrt(d2)

  const normal = d.normalize()
  const contact = vec3.add(s1.center, vec3.scale(normal, s1.radius))

  return { contact, normal, distance: t - s }
}

export const collideSphereWithCuboid = (sphere: Sphere, cuboid: Cuboid, t1: Transform, t2: Transform): Collision | null => {
  const { center, radius } = sphere
  const { maximum, minimum } = cuboid

  const r2 = radius * radius

  const p = new vec3([
    max(minimum.x, min(center.x, maximum.x)),
    max(minimum.y, min(center.y, maximum.y)),
    max(minimum.z, min(center.z, maximum.z))
  ])

  const d = vec3.subtract(p, center)
  const d2 = vec3.dot(d, d)

  if (d2 > r2) {
    return null
  }

  const normal = vec3.normalize(d)
  const contact = vec3.add(center, vec3.scale(normal, radius))

  return { contact, normal, distance: sqrt(r2 - d2) }
}