import { Collision } from '../../collision';
import { Cuboid } from '../../volumes/cuboid';
import { Polygon } from '../../colliders/polygon';
export declare function collidePolygonWithCuboid(polygon: Polygon, cuboid: Cuboid): Collision[] | null;
