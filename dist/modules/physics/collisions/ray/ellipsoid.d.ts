import { Ray } from '../../colliders/ray';
import { Collision } from '../../collision';
import { Ellipsoid } from '../../volumes/ellipsoid';
export declare const collideRayWithEllipsoid: (ray: Ray, ellipsoid: Ellipsoid) => Collision[] | null;
