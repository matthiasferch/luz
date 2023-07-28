import { Collision } from '../collision';
import { Cuboid } from '../colliders/cuboid';
import { Sphere } from '../colliders/sphere';
import { Transform } from '../transform';
export declare const collideSphereWithSphere: (s1: Sphere, s2: Sphere, t1: Transform, t2: Transform) => Collision | null;
export declare const collideSphereWithCuboid: (sphere: Sphere, cuboid: Cuboid, t1: Transform, t2: Transform) => Collision | null;
