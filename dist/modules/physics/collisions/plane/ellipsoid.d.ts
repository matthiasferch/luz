import { Plane } from '../../colliders/plane';
import { Collision } from '../../collision';
import { Ellipsoid } from '../../volumes/ellipsoid';
export declare function collidePlaneWithEllipsoid(plane: Plane, ellipsoid: Ellipsoid): Collision[] | null;
