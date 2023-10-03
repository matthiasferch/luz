import { Plane } from '../../colliders/plane';
import { Ray } from '../../colliders/ray';
import { Collision } from '../../collision';
export declare const collideRayWithPlane: (ray: Ray, plane: Plane) => Collision | null;
