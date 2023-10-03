import { Collision } from '../../collision';
import { Cuboid } from '../../volumes/cuboid';
import { Sphere } from '../../volumes/sphere';
export declare const collideSphereWithCuboid: (sphere: Sphere, cuboid: Cuboid) => Collision | null;
