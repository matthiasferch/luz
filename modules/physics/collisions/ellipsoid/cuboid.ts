import { vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Ellipsoid } from '../../volumes/ellipsoid'
import { Cuboid } from '../../volumes/cuboid'

const EPS = 1e-6

export function collideEllipsoidWithCuboid(ellipsoid: Ellipsoid, cuboid: Cuboid): Collision[] | null {
  const axes = cuboid.axes
  const extents = [cuboid.extents.x, cuboid.extents.y, cuboid.extents.z]

  // Vector from cuboid center to ellipsoid center
  const relative = vec3.subtract(ellipsoid.center, cuboid.center, new vec3())

  // Project onto cuboid axes and clamp to find closest point on cuboid to ellipsoid center
  const local: number[] = []
  const closestPoint = cuboid.center.copy()

  for (let i = 0; i < 3; i++) {
    const axis = axes[i]
    const projection = vec3.dot(relative, axis)
    local[i] = projection

    const extent = extents[i]
    const clamped = Math.max(-extent, Math.min(projection, extent))
    vec3.add(closestPoint, vec3.scale(axis, clamped, new vec3()), closestPoint)
  }

  const offset = vec3.subtract(closestPoint, ellipsoid.center, new vec3())
  const dist2 = offset.squaredLength

  if (dist2 > EPS * EPS) {
    // Outside or touching: treat ellipsoid as sphere with effective radius along direction
    const distance = Math.sqrt(dist2)
    const normal = vec3.scale(offset, 1 / distance, new vec3())
    const rEff = ellipsoid.effectiveRadius(normal)

    if (distance > rEff) return null

    const penetration = rEff - distance
    return [
      {
        contact: closestPoint.copy(),
        normal,
        distance: penetration
      }
    ]
  }

  // Ellipsoid center inside cuboid (or extremely close): use nearest face
  let bestAxis = 0
  let bestDistance = Infinity
  for (let i = 0; i < 3; i++) {
    const extent = extents[i]
    const projection = local[i]
    const dFace = Math.max(0, extent - Math.abs(projection))
    if (dFace < bestDistance) {
      bestDistance = dFace
      bestAxis = i
    }
  }

  const axis = axes[bestAxis]
  const extent = extents[bestAxis]
  const projection = local[bestAxis]
  const sign = projection >= 0 ? 1 : -1
  const distanceToFace = extent - Math.abs(projection)

  const contact = vec3.add(
    ellipsoid.center,
    vec3.scale(axis, sign * distanceToFace, new vec3()),
    new vec3()
  )

  const n = vec3.scale(axis, sign, new vec3())
  const rEff = ellipsoid.effectiveRadius(n)
  let penetration = rEff - distanceToFace
  if (penetration < -EPS) return null
  if (penetration < 0) penetration = 0

  return [
    {
      contact,
      normal: n,
      distance: penetration
    }
  ]
}

