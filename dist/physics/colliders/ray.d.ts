import { vec3 } from '../../vectors';
import { Collider } from '../collider';
export declare class Ray extends Collider {
    type: Collider.Type;
    readonly origin: Readonly<vec3>;
    readonly direction: Readonly<vec3>;
    constructor({ origin, direction }: {
        origin?: Readonly<vec3>;
        direction?: Readonly<vec3>;
    });
    toJSON(): {
        origin: Readonly<vec3>;
        direction: Readonly<vec3>;
    };
}
