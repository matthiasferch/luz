import { Collision } from '../../collision';
import { Ellipsoid } from '../../volumes/ellipsoid';
import { Polygon } from '../../colliders/polygon';
export declare const collidePolygonWithEllipsoid: (polygon: Polygon, ellipsoid: Ellipsoid) => Collision[] | null;
