import { Plane } from '../../colliders/plane';
import { Collision } from '../../collision';
import { Sphere } from '../../volumes/sphere';
export declare function collidePlaneWithSphere(plane: Plane, sphere: Sphere): Collision[] | null;
