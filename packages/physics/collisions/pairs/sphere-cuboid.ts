import { Vector3 } from '@luz/math'
import type { Collision } from '../../collision'
import type { Cuboid } from '../../volumes/cuboid'
import type { Sphere } from '../../volumes/sphere'

const EPSILON = 1e-6

export function collideSphereWithCuboid(sphere: Sphere, cuboid: Cuboid): Collision[] | null {
  const extents = [cuboid.extents.x, cuboid.extents.y, cuboid.extents.z]
  const axes = cuboid.axes
  const relativeCenter = Vector3.subtract(sphere.center, cuboid.center)

  const localCoordinates: number[] = []
  const closestPoint = cuboid.center.clone()

  for (let index = 0; index < 3; index++) {
    const axis = axes[index]
    const projection = Vector3.calculateDotProduct(relativeCenter, axis)

    localCoordinates[index] = projection

    const extent = extents[index]
    const clampedProjection = Math.max(-extent, Math.min(projection, extent))

    const contribution = Vector3.scale(axis, clampedProjection, new Vector3())

    Vector3.add(closestPoint, contribution, closestPoint)
  }

  const offset = Vector3.subtract(sphere.center, closestPoint)
  const distanceSquared = offset.squaredMagnitude
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
        point: closestPoint.clone(),
        normal: normal.clone().scale(-1),
        penetrationDepth: penetrationDepth
      }
    ]
  }

  let bestAxis = 0
  let bestDistance = Infinity

  for (let index = 0; index < 3; index++) {
    const extent = extents[index]
    const projection = localCoordinates[index]
    const distanceToFace = Math.max(0, extent - Math.abs(projection))

    if (distanceToFace < bestDistance) {
      bestDistance = distanceToFace
      bestAxis = index
    }
  }

  const axis = axes[bestAxis]
  const extent = extents[bestAxis]
  const projection = localCoordinates[bestAxis]
  const sign = projection >= 0 ? 1 : -1
  const distanceToFace = extent - Math.abs(projection)

  const surfaceOffset = sign * distanceToFace
  const contact = Vector3.add(sphere.center, Vector3.scale(axis, surfaceOffset, new Vector3()), new Vector3())

  let penetrationDepth = radius + distanceToFace

  if (penetrationDepth < -EPSILON) {
    return null
  }

  if (penetrationDepth < 0) {
    penetrationDepth = 0
  }

  const normal = axis.clone().scale(-sign)

  return [
    {
      point: contact,
      normal: normal.clone(),
      penetrationDepth: penetrationDepth
    }
  ]
}
