import type { Vector3 } from '@luz/math'

export interface RayIntersection {
  point: Vector3

  // World-space outward surface normal; ray pairs use the directions' cross product.
  normal: Vector3

  // World units along the first ray's normalized direction.
  distance: number
}
