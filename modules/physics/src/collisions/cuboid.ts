import { vec3 } from '@luz/vectors'

import { Collision } from '../collision'
import { Cuboid } from '../colliders/cuboid'

const { min, sign } = Math

export const collideCuboidWithCuboid = (cuboid1: Cuboid, cuboid2: Cuboid): Collision | null => {
  const { center: c1, extents: e1 } = cuboid1
  const { center: c2, extents: e2 } = cuboid2

  const distance = vec3.absolute(vec3.subtract(c2, c1))
  const overlap = vec3.add(e1, e2).subtract(distance)

  if (overlap.x < 0 || overlap.y < 0 || overlap.z < 0) {
    return null
  }

  const minOverlap = min(overlap.x, overlap.y, overlap.z)

  let normal: vec3

  const contact = c1.copy()

  if (overlap.x === minOverlap) {
    normal = vec3.right.copy()
    contact.x = c1.x + sign(overlap.x) * e1.x
  } else if (overlap.y === minOverlap) {
    normal = vec3.up.copy()
    contact.y = c1.y + sign(overlap.y) * e1.y
  } else {
    normal = vec3.forward.copy()
    contact.z = c1.z + sign(overlap.z) * e1.z
  }

  return { normal, contact, distance: -minOverlap }
}
