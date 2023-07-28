import { Collider } from '../collider';
import { Collision } from '../collision';
import { Transform } from '../transform';
import { vec4 } from '../../../vectors/src/vec4';
export declare class Plane extends Collider {
    readonly equation: vec4;
    constructor({ equation }?: {
        equation?: vec4;
    });
    collide(collider: Collider, t1: Transform, t2: Transform): Collision | null;
    transform(transform: Transform): Plane;
}
