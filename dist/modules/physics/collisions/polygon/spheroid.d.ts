import { Collision } from '../../collision';
import { Polygon } from '../../colliders/polygon';
import { Spheroid } from '../../volumes/spheroid';
export declare const collidePolygonWithSpheroid: (polygon: Polygon, spheroid: Spheroid) => Collision[] | null;
