import type { Ellipsoid } from '../../volumes/ellipsoid'
import type { Cylinder } from '../../volumes/cylinder'
import type { Collision } from '../../collision'
import { collideConvexShapes } from '../algorithms/convex-queries'

export const collideEllipsoidWithCylinder = (ellipsoid: Ellipsoid, cylinder: Cylinder): Collision[] | null => {
  return collideConvexShapes(ellipsoid, cylinder)
}
