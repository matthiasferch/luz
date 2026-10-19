import type { Ellipsoid } from '../../volumes/ellipsoid'
import type { Collision } from '../../collision'
import { collideConvexShapes } from '../algorithms/convex-queries'

export const collideEllipsoidWithEllipsoid = (
  firstEllipsoid: Ellipsoid,
  secondEllipsoid: Ellipsoid
): Collision[] | null => collideConvexShapes(firstEllipsoid, secondEllipsoid)
