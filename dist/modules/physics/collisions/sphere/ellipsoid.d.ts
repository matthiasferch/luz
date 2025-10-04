import { Collision } from '../../collision';
import { Sphere } from '../../volumes/sphere';
import { Ellipsoid } from '../../volumes/ellipsoid';
export declare function collideSphereWithEllipsoid(sphere: Sphere, ellipsoid: Ellipsoid): Collision[] | null;
