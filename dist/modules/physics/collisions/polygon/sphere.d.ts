import { Collision } from '../../collision';
import { Sphere } from '../../volumes/sphere';
import { Polygon } from '../../colliders/polygon';
export declare const collidePolygonWithSphere: (polygon: Polygon, sphere: Sphere) => Collision[] | null;
