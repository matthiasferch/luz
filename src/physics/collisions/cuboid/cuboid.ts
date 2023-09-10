import { Epsilon, vec3 } from '../../../vectors'
import { Collision } from '../../collision'
import { Cuboid } from '../../volumes/cuboid'

const { min, max } = Math

export const collideCuboidWithCuboid = (cuboid1: Cuboid, cuboid2: Cuboid): Collision | null => {
  const { center: c1, extents: e1 } = cuboid1
  const { center: c2, extents: e2 } = cuboid2

  let n: vec3 | null = null
  let d = Infinity

  const testAxis = (axis: vec3) => {
    if (axis.length < Epsilon) {
      return true
    }

    const x = vec3.absolute(axis)

    const m1 = [
      vec3.dot(c1, axis) - vec3.dot(e1, x),
      vec3.dot(c1, axis) + vec3.dot(e1, x)
    ]

    const m2 = [
      vec3.dot(c2, axis) - vec3.dot(e2, x),
      vec3.dot(c2, axis) + vec3.dot(e2, x)
    ]

    if (m1[1] < m2[0] || m2[1] < m1[0]) {
      return false
    }

    const o = min(m1[1], m2[1]) - max(m1[0], m2[0])

    if (o < d) {
      d = o
      n = axis
    }

    return true
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const axis = vec3.cross(
        cuboid1.axes[i],
        cuboid2.axes[j]
      )

      if (!testAxis(axis)) {
        return null
      }
    }
  }

  for (let i = 0; i < 3; i++) {
    if (!testAxis(cuboid1.axes[i])) {
      return null
    }

    if (!testAxis(cuboid2.axes[i])) {
      return null
    }
  }

  const p = vec3.add(c1, c2).scale(0.5)

  return { normal: n, contact: p, distance: d }
}