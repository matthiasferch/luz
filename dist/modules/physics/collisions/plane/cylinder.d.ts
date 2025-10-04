import { Plane } from '../../colliders/plane';
import { Collision } from '../../collision';
import { Cylinder } from '../../volumes/cylinder';
export declare function collidePlaneWithCylinder(plane: Plane, cylinder: Cylinder): Collision[] | null;
