import { Collision } from './collision';
import { Transform } from './transform';
export declare abstract class Collider {
    abstract collide(collider: Collider, t1: Transform, t2: Transform): Collision | null;
    abstract transform(transform: Transform): Collider;
}
