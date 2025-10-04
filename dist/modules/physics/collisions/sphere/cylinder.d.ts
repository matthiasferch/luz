import { Collision } from '../../collision';
import { Sphere } from '../../volumes/sphere';
import { Cylinder } from '../../volumes/cylinder';
export declare function collideSphereWithCylinder(sphere: Sphere, cylinder: Cylinder): Collision[] | null;
