import { Collider } from '../collider';
import { Collision } from '../collision';
import { vec3 } from '../../../vectors/src/vec3';
import { Transform } from '../transform';
export declare class Ray extends Collider {
    readonly origin: vec3;
    readonly direction: vec3;
    constructor({ origin, direction }: {
        origin?: vec3;
        direction?: vec3;
    });
    collide(collider: Collider, t1: Transform, t2: Transform): Collision | null;
    transform(transform: Transform): Ray;
}
