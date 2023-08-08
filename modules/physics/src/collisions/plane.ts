import { Transform } from '@luz/core'
import { vec3 } from '@luz/vectors'

import { Collision } from '../collision'
import { Cuboid } from '../colliders/cuboid'
import { Plane } from '../colliders/plane'
import { Sphere } from '../colliders/sphere'

const { abs } = Math

export const collidePlaneWithSphere = (plane: Plane, sphere: Sphere): Collision | null => {
  const { equation } = plane

  const planeNormal = new vec3([equation.x, equation.y, equation.z])
  const distance = vec3.dot(planeNormal, sphere.center) - equation.w

  if (distance < 0) {
    return null
  }

  const depth = sphere.radius - distance
  const normal = planeNormal.copy().negate()

  const contact = vec3.subtract(sphere.center, vec3.scale(normal, depth))

  return { contact, normal, distance }
}

export const collidePlaneWithCuboid = (plane: Plane, cuboid: Cuboid): Collision | null => {
  const { equation } = plane
  const { center, extents } = cuboid

  const planeNormal = new vec3([equation.x, equation.y, equation.z])

  const projection = vec3.dot(planeNormal, extents)
  const distance = vec3.dot(center, planeNormal) + equation.w - projection

  if (distance > 0) {
    return null
  }

  const contact = vec3.subtract(center, vec3.scale(planeNormal, projection))

  return { contact, normal: planeNormal, distance: abs(distance) }
}