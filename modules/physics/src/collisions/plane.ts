import { vec3 } from '@luz/vectors'
import { Plane } from '../colliders/plane'
import { Collision } from '../collision'
import { Cuboid } from '../volumes/cuboid'
import { Sphere } from '../volumes/sphere'

const { abs } = Math

export const collidePlaneWithSphere = (plane: Plane, sphere: Sphere): Collision | null => {
  const { normal, equation } = plane
  const { center, radius } = sphere

  const toCenter = vec3.dot(normal, center) + equation.w

  const distance = abs(toCenter)

  if (distance > radius) {
    return null
  }

  const r = radius - distance
  const n = vec3.scale(normal, r)

  const contact = (toCenter < 0) ? vec3.subtract(center, n) : vec3.add(center, n)

  return { contact, normal, distance }
}

export const collidePlaneWithCuboid = (plane: Plane, cuboid: Cuboid): Collision | null => {
  const { normal, equation } = plane
  const { center, extents } = cuboid

  const toCenter = vec3.dot(normal, center) - equation.w

  const distance = abs(toCenter)

  const projection = abs(normal.x * extents.x) + abs(normal.y * extents.y) + abs(normal.z * extents.z)

  if (distance > projection) {
    return null
  }

  const contact = vec3.subtract(center, vec3.scale(normal, projection))

  return { contact, normal, distance: distance - projection }
}
