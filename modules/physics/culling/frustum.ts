import { vec3 } from '@luz/vectors'
import { BoundingBox } from '../broadphase'
import { Frustum } from '../volumes/frustum'
import { Volume } from '../volume'

// Returns true if the AABB intersects or is inside the frustum.
export function aabbIntersectsFrustum(frustum: Frustum, aabb: BoundingBox): boolean {
  const planes = frustum.getPlanes()

  const vN = new vec3()

  for (const plane of planes) {
    // Build the negative vertex (min projection along outward-pointing normal)
    // If this vertex lies in front of the plane (positive distance), the AABB is outside.
    vN.x = plane.normal.x >= 0 ? aabb.minimum.x : aabb.maximum.x
    vN.y = plane.normal.y >= 0 ? aabb.minimum.y : aabb.maximum.y
    vN.z = plane.normal.z >= 0 ? aabb.minimum.z : aabb.maximum.z

    if (plane.signedDistance(vN) > 0) return false
  }

  return true
}

export function volumeIntersectsFrustum(frustum: Frustum, volume: Volume): boolean {
  // Use the broadphase BoundingBox as a conservative proxy over the oriented shape
  const aabb = new BoundingBox(volume)
  return aabbIntersectsFrustum(frustum, aabb)
}
