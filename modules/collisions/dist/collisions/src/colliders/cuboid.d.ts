import { Collider } from '../collider';
import { Collision } from '../collision';
import { Transform } from '../transform';
import { vec3 } from '../../../vectors/src/vec3';
export declare class Cuboid extends Collider {
    readonly minimum: vec3;
    readonly maximum: vec3;
    constructor({ minimum, maximum }?: {
        minimum?: vec3;
        maximum?: vec3;
    });
    collide(collider: Collider, t1: Transform, t2: Transform): Collision | null;
    transform(transform: Transform): Cuboid;
}
