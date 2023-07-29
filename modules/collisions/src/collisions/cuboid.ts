import { vec3 } from '@luz/vectors'

import { Collision } from '../collision'
import { Cuboid } from '../colliders/cuboid'
import { Transform } from '../transform'

const { min } = Math

export const collideCuboidWithCuboid = (c1: Cuboid, c2: Cuboid, t1: Transform, t2: Transform): Collision | null => {
  if (
    c1.maximum.x < c2.minimum.x ||
    c1.minimum.x > c2.maximum.x ||
    c1.maximum.y < c2.minimum.y ||
    c1.minimum.y > c2.maximum.y ||
    c1.maximum.z < c2.minimum.z ||
    c1.minimum.z > c2.maximum.z
  ) {
    return null
  }

  const x = min(c1.maximum.x - c2.minimum.x, c2.maximum.x - c1.minimum.x)
  const y = min(c1.maximum.y - c2.minimum.y, c2.maximum.y - c1.minimum.y)
  const z = min(c1.maximum.z - c2.minimum.z, c2.maximum.z - c1.minimum.z)

  const center1 = vec3.add(c1.minimum, c1.maximum).scale(0.5)
  const center2 = vec3.add(c2.minimum, c2.maximum).scale(0.5)

  let normal: vec3

  const contact = center1.copy()

  if (x < y && x < z) {
    normal = vec3.right.copy()

    if (center1.x < center2.x) {
      contact.x = c1.maximum.x
    } else {
      contact.x = c1.minimum.x
    }
  } else if (y < z) {
    normal = vec3.up.copy()

    if (center1.y < center2.y) {
      contact.y = c1.maximum.y
    } else {
      contact.y = c1.minimum.y
    }
  } else {
    normal = vec3.forward.copy()

    if (center1.z < center2.z) {
      contact.z = c1.maximum.z
    } else {
      contact.z = c1.minimum.z
    }
  }

  const distance = -(min(x, y, z))

  return { normal, contact, distance }
}