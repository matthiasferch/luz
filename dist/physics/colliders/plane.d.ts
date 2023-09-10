import { vec3 } from '../../vectors';
import { Collider } from '../collider';
export declare class Plane extends Collider {
    type: Collider.Type;
    readonly normal: Readonly<vec3>;
    readonly distance: number;
    constructor({ normal, distance }?: {
        normal?: Readonly<vec3>;
        distance?: number;
    });
    toJSON(): {
        normal: Readonly<vec3>;
        distance: number;
    };
}
