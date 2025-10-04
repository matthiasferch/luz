import { vec3 } from '@luz/vectors';
import { Collider } from '../collider';
export declare class Plane extends Collider {
    type: Collider.Type;
    readonly normal: vec3;
    readonly distance: number;
    constructor({ normal, distance }?: {
        normal?: vec3 | undefined;
        distance?: number | undefined;
    });
    signedDistance(point: vec3): number;
}
