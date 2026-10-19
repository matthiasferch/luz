import type { Sphere } from '../../volumes/sphere'
import type { Ellipsoid } from '../../volumes/ellipsoid'
import type { Collision } from '../../collision'
import { collideConvexShapes } from '../algorithms/convex-queries'

export const collideSphereWithEllipsoid = (sphere: Sphere, ellipsoid: Ellipsoid): Collision[] | null => {
  return collideConvexShapes(sphere, ellipsoid)
}
