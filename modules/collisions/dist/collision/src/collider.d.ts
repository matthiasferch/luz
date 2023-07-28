import { Collision } from './collision';
import { Transform } from './transform';
export declare abstract class Collider {
    abstract collide(collider: Collider, transform?: Transform, colliderTransform?: Transform): Collision | null;
}
