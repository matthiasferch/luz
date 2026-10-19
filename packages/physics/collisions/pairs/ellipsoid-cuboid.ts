import type { Ellipsoid } from '../../volumes/ellipsoid'
import type { Cuboid } from '../../volumes/cuboid'
import type { Collision } from '../../collision'
import { collideConvexShapes } from '../algorithms/convex-queries'

export const collideEllipsoidWithCuboid = (ellipsoid: Ellipsoid, cuboid: Cuboid): Collision[] | null => {
  const contacts = collideConvexShapes(ellipsoid, cuboid)

  return contacts
}
