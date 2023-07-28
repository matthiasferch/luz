import { Collision } from '../collision';
import { Cuboid } from '../colliders/cuboid';
import { Ray } from '../colliders/ray';
import { Plane } from '../colliders/plane';
import { Sphere } from '../colliders/sphere';
import { Transform } from '../transform';
export declare const collideRayWithRay: (ray1: Ray, ray2: Ray, t1: Transform, t2: Transform) => Collision | null;
export declare const collideRayWithPlane: (ray: Ray, plane: Plane, t1: Transform, t2: Transform) => Collision | null;
export declare const collideRayWithSphere: (ray: Ray, sphere: Sphere, t1: Transform, t2: Transform) => Collision | null;
export declare const collideRayWithCuboid: (ray: Ray, cuboid: Cuboid, t1: Transform, t2: Transform) => Collision | null;