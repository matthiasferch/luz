import { Ray } from '../../colliders/ray';
import { Collision } from '../../collision';
import { Sphere } from '../../volumes/sphere';
export declare const collideRayWithSphere: (ray: Ray, sphere: Sphere) => Collision | null;
