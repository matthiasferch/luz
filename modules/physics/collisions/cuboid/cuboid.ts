import { Epsilon, vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Cuboid } from '../../volumes/cuboid'

export const collideCuboidWithCuboid = (cuboid1: Cuboid, cuboid2: Cuboid): Collision | null => {
  const axes1 = cuboid1.axes
  const axes2 = cuboid2.axes
  const extents1 = cuboid1.extents
  const extents2 = cuboid2.extents
  const center1 = cuboid1.center
  const center2 = cuboid2.center

  let normal: vec3 | null = null
  let penetration = Infinity

  const centerDelta = vec3.subtract(center2, center1)

  const projectExtent = (axis: vec3, axes: vec3[], extents: vec3): number => {
    return (
      Math.abs(vec3.dot(axis, axes[0])) * extents.x +
      Math.abs(vec3.dot(axis, axes[1])) * extents.y +
      Math.abs(vec3.dot(axis, axes[2])) * extents.z
    )
  }

  const testAxis = (candidate: vec3) => {
    const axisLength = candidate.length

    if (axisLength < Epsilon) {
      return true
    }

    const axis = vec3.scale(candidate, 1 / axisLength, new vec3())

    const projection1 = projectExtent(axis, axes1, extents1)
    const projection2 = projectExtent(axis, axes2, extents2)

    const centerProjection1 = vec3.dot(center1, axis)
    const centerProjection2 = vec3.dot(center2, axis)

    const min1 = centerProjection1 - projection1
    const max1 = centerProjection1 + projection1
    const min2 = centerProjection2 - projection2
    const max2 = centerProjection2 + projection2

    if (max1 < min2 || max2 < min1) {
      return false
    }

    const overlap = Math.min(max1, max2) - Math.max(min1, min2)

    if (overlap < penetration) {
      penetration = overlap

      const alignment = vec3.dot(centerDelta, axis)
      normal = alignment < 0 ? vec3.scale(axis, -1, new vec3()) : axis
    }

    return true
  }

  for (let i = 0; i < 3; i++) {
    if (!testAxis(axes1[i])) {
      return null
    }

    if (!testAxis(axes2[i])) {
      return null
    }
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const axis = vec3.cross(axes1[i], axes2[j])

      if (!testAxis(axis)) {
        return null
      }
    }
  }

  if (!normal || penetration === Infinity) {
    return null
  }

  const contact = vec3.add(center1, center2, new vec3())
  contact.scale(0.5)

  return { normal, contact, distance: penetration }
}
