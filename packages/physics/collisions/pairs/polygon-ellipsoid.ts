import type { Ellipsoid } from '../../volumes/ellipsoid'
import type { Polygon } from '../../colliders/polygon'
import type { Collision } from '../../collision'
import { collidePolygonWithVolume } from '../algorithms/polygon-volume'

export const collidePolygonWithEllipsoid = (polygon: Polygon, ellipsoid: Ellipsoid): Collision[] | null =>
  collidePolygonWithVolume(polygon, ellipsoid)
