import { Collision } from '../../collision';
import { Ellipsoid } from '../../volumes/ellipsoid';
import { Cuboid } from '../../volumes/cuboid';
export declare function collideEllipsoidWithCuboid(ellipsoid: Ellipsoid, cuboid: Cuboid): Collision[] | null;
