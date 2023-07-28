import { Collision } from '../collision';
import { Cuboid } from '../colliders/cuboid';
import { Transform } from '../transform';
export declare const collideCuboidWithCuboid: (c1: Cuboid, c2: Cuboid, t1: Transform, t2: Transform) => Collision | null;
