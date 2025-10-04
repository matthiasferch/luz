import { Collision } from '../../collision';
import { Cylinder } from '../../volumes/cylinder';
import { Polygon } from '../../colliders/polygon';
export declare const collidePolygonWithCylinder: (polygon: Polygon, cylinder: Cylinder) => Collision[] | null;
