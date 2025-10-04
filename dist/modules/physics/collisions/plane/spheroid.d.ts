import { Plane } from '../../colliders/plane';
import { Collision } from '../../collision';
import { Spheroid } from '../../volumes/spheroid';
export declare function collidePlaneWithSpheroid(plane: Plane, spheroid: Spheroid): Collision[] | null;
