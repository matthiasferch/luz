import { Ray } from '../../colliders/ray';
import { Collision } from '../../collision';
import { Cuboid } from '../../volumes/cuboid';
export declare const collideRayWithCuboid: (ray: Ray, cuboid: Cuboid) => Collision | null;
