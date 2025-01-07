import { vec3 } from '@luz/vectors'
import { Ray } from '../../colliders/ray'
import { Collision } from '../../collision'
import { Sphere } from '../../volumes/sphere'

const { sqrt } = Math

export const collideRayWithSphere = (ray: Ray, sphere: Sphere): Collision | null => {
  const { origin: o, direction: e } = ray
  const { center: c, radius: r } = sphere

  const r2 = r * r

  const s = vec3.subtract(c, o) // Vector from ray origin to sphere center
  const t = vec3.dot(e, s) // Project the vector onto the ray's direction

  const d2 = s.squaredLength - t * t // Squared distance from sphere center to the ray

  if (d2 > r2) {
    // No collision if the ray misses the sphere
    return null
  }

  const thc = sqrt(r2 - d2) // Distance from the closest point on the ray to the intersection
  const t0 = t - thc // First intersection point
  const t1 = t + thc // Second intersection point

  // If both t0 and t1 are negative, the sphere is behind the ray
  if (t0 < 0 && t1 < 0) {
    return null
  }

  // Use the smallest positive t
  const d = t0 >= 0 ? t0 : t1

  const p = vec3.add(o, vec3.scale(e, d)) // Calculate contact point
  const n = vec3.subtract(c, p).normalize() // Calculate normal at the contact point

  return { contact: p, normal: n, distance: d }
}
