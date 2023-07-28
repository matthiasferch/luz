import { Collider } from '../collider';
import { Collision } from '../collision';
import { vec3 } from '../../../vectors';
import { Transform } from '../transform';
export declare class Plane extends Collider {
    readonly normal: vec3;
    distance: number;
    constructor({ normal, distance }?: {
        normal?: any;
        distance?: number;
    });
    collide(collider: Collider, transform?: Transform, colliderTransform?: Transform): Collision | null;
}
