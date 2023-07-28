import { Collision } from '../collision';
import { Cuboid } from '../colliders/cuboid';
import { Plane } from '../colliders/plane';
import { Sphere } from '../colliders/sphere';
import { Transform } from '../transform';
export declare const collidePlaneWithSphere: (plane: Plane, sphere: Sphere, t1: Transform, t2: Transform) => Collision | null;
export declare const collidePlaneWithCuboid: (plane: Plane, cuboid: Cuboid, t1: Transform, t2: Transform) => Collision | null;
