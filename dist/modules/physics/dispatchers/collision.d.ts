import { Dispatcher } from '@luz/utilities';
import { Collider } from '../collider';
import { Collision } from '../collision';
export declare class CollisionDispatcher extends Dispatcher<Collider, Collider.Type, Collision[]> {
    constructor();
}
