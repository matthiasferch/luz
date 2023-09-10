import { Plane } from '../../colliders/plane';
import { Collision } from '../../collision';
import { Cuboid } from '../../volumes/cuboid';
export declare const collidePlaneWithCuboid: (plane: Plane, cuboid: Cuboid) => Collision | null;
