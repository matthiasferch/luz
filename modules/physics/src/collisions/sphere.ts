import { vec3 } from '@luz/vectors'
import { Collision } from '../collision'
import { Cuboid } from '../volumes/cuboid'
import { Sphere } from '../volumes/sphere'

const { sqrt, min, max } = Math

export const collideSphereWithSphere = (s1: Sphere, s2: Sphere): Collision | null => {
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

export const collideSphereWithCuboid = (sphere: Sphere, cuboid: Cuboid): Collision | null => {
  const { center: c1, radius } = sphere
  const { center: c2, extents } = cuboid
  
  const r2 = radius * radius

  const maximum = vec3.add(c2, extents)
  const minimum = vec3.subtract(c2, extents)

  const p = new vec3([
    max(minimum.x, min(c1.x, maximum.x)),
    max(minimum.y, min(c1.y, maximum.y)),
    max(minimum.z, min(c1.z, maximum.z))
  ])

  const d = vec3.subtract(p, c1)
  const d2 = vec3.dot(d, d)

  if (d2 > r2) {
    return null
  }

  const normal = vec3.normalize(d)
  const contact = vec3.add(c1, vec3.scale(normal, radius))

  return { contact, normal, distance: sqrt(r2 - d2) }
}