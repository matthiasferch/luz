import { Collision } from '../../collision';
import { Ellipsoid } from '../../volumes/ellipsoid';
import { Cylinder } from '../../volumes/cylinder';
export declare function collideEllipsoidWithCylinder(ellipsoid: Ellipsoid, cylinder: Cylinder): Collision[] | null;
