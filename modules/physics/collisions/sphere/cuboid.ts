import { vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Cuboid } from '../../volumes/cuboid'
import { Sphere } from '../../volumes/sphere'

const EPSILON = 1e-6

export function collideSphereWithCuboid(sphere: Sphere, cuboid: Cuboid): Collision[] | null {
  const extents = [cuboid.extents.x, cuboid.extents.y, cuboid.extents.z]
  const axes = cuboid.axes
  const relative = vec3.subtract(sphere.center, cuboid.center)

  const local: number[] = []
  const closestPoint = cuboid.center.copy()

  for (let i = 0; i < 3; i++) {
    const axis = axes[i]
    const projection = vec3.dot(relative, axis)
    local[i] = projection

    const extent = extents[i]
    const clampedProjection = Math.max(-extent, Math.min(projection, extent))

    const contribution = vec3.scale(axis, clampedProjection, new vec3())
    vec3.add(closestPoint, contribution, closestPoint)
  }

  const offset = vec3.subtract(sphere.center, closestPoint)
  const distanceSquared = offset.squaredLength
  const radius = sphere.radius

  if (distanceSquared > radius * radius) {
    return null
  }

  if (distanceSquared > EPSILON * EPSILON) {
    const distance = Math.sqrt(distanceSquared)
    const normal = offset.scale(1 / distance)
    const penetrationDepth = radius - distance

    return [
      {
        contact: closestPoint.copy(),
        normal: normal.copy(),
        distance: penetrationDepth
      }
    ]
  }

  let bestAxis = 0
  let bestDistance = Infinity

  for (let i = 0; i < 3; i++) {
    const extent = extents[i]
    const projection = local[i]
    const distanceToFace = Math.max(0, extent - Math.abs(projection))

    if (distanceToFace < bestDistance) {
      bestDistance = distanceToFace
      bestAxis = i
    }
  }

  const axis = axes[bestAxis]
  const extent = extents[bestAxis]
  const projection = local[bestAxis]
  const sign = projection >= 0 ? 1 : -1
  const distanceToFace = extent - Math.abs(projection)

  const surfaceOffset = sign * distanceToFace
  const contact = vec3.add(
    sphere.center,
    vec3.scale(axis, surfaceOffset, new vec3()),
    new vec3()
  )

  let penetrationDepth = radius - distanceToFace

  if (penetrationDepth < -EPSILON) {
    return null
  }

  if (penetrationDepth < 0) {
    penetrationDepth = 0
  }

  const normal = axis.copy().scale(sign)

  return [
    {
      contact,
      normal: normal.copy(),
      distance: penetrationDepth
    }
  ]
}
