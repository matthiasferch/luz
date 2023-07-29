import { vec3 } from '@luz/vectors'

import { Collision } from '../collision'
import { Cuboid } from '../colliders/cuboid'
import { Ray } from '../colliders/ray'
import { Plane } from '../colliders/plane'
import { Sphere } from '../colliders/sphere'
import { Transform } from '../transform'

const { sqrt, min, max } = Math

export const collideRayWithRay = (ray1: Ray, ray2: Ray, t1: Transform, t2: Transform): Collision | null => {
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

export const collideRayWithPlane = (ray: Ray, plane: Plane, t1: Transform, t2: Transform): Collision | null => {
  const { equation } = plane
  const { direction, origin } = ray

  const normal = new vec3([equation.x, equation.y, equation.z])

  const d = vec3.dot(direction, normal)

  if (d === 0) {
    return null
  }

  const distance = (equation.w - vec3.dot(origin, normal)) / d

  if (distance < 0) {
    return null
  }

  const contact = vec3.add(origin, vec3.scale(direction, distance))

  return { contact, normal, distance }
}

export const collideRayWithSphere = (ray: Ray, sphere: Sphere, t1: Transform, t2: Transform): Collision | null => {
  const { direction, origin } = ray
  const { center, radius } = sphere

  const r2 = radius * radius

  const c = vec3.subtract(center, origin)
  const d = vec3.dot(direction, c)

  if (d < 0) {
    return null
  }

  const d2 = c.squaredLength - (d * d)

  if (d2 > r2) {
    return null
  }

  const distance = d - sqrt(r2 - d2)

  const contact = vec3.add(origin, vec3.scale(direction, distance))
  const normal = vec3.subtract(contact, center).normalize()

  return { contact, normal, distance }
}

export const collideRayWithCuboid = (ray: Ray, cuboid: Cuboid, t1: Transform, t2: Transform): Collision | null => {
  const { origin, direction } = ray
  const { maximum, minimum } = cuboid

  const s1 = vec3.subtract(minimum, origin).divide(direction)
  const s2 = vec3.subtract(maximum, origin).divide(direction)

  const m1 = max(min(s1.x, s2.x), min(s1.y, s2.y), min(s1.z, s2.z))
  const m2 = min(max(s1.x, s2.x), max(s1.y, s2.y), max(s1.z, s2.z))

  if (m2 < 0 || m1 > m2) {
    return null
  }

  const distance = (m1 < 0) ? m2 : m1

  const contact = vec3.add(origin, direction).scale(distance)

  return { contact, normal: direction, distance }
}