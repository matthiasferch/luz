import { Collision } from '../collision'
import { Cuboid } from '../colliders/cuboid'
import { Plane } from '../colliders/plane'
import { vec3 } from '../../../vectors/src/vec3'
import { Sphere } from '../colliders/sphere'
import { Transform } from '../transform'

const { abs } = Math

export const collidePlaneWithSphere = (plane: Plane, sphere: Sphere, t1: Transform, t2: Transform): Collision | null => {
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

export const collidePlaneWithCuboid = (plane: Plane, cuboid: Cuboid, t1: Transform, t2: Transform): Collision | null => {
  const { equation } = plane
  const { maximum, minimum } = cuboid

  const center = vec3.add(minimum, maximum).scale(0.5)
  const extents = vec3.subtract(maximum, minimum).scale(0.5)

  const planeNormal = new vec3([equation.x, equation.y, equation.z])

  const projection = vec3.dot(planeNormal, extents)
  const distance = vec3.dot(center, planeNormal) + equation.w - projection

  if (distance > 0) {
    return null
  }

  const contact = vec3.subtract(center, vec3.scale(planeNormal, projection))

  return { contact, normal: planeNormal, distance: abs(distance) }
}