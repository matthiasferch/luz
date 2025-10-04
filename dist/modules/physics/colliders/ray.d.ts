import { vec3 } from '@luz/vectors';
import { Collider } from '../collider';
export declare class Ray extends Collider {
    type: Collider.Type;
    readonly origin: vec3;
    readonly direction: vec3;
    constructor({ origin, direction }?: {
        origin?: vec3 | undefined;
        direction?: vec3 | undefined;
    });
}
