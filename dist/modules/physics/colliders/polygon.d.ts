import { vec3 } from '@luz/vectors';
import { Collider } from '../collider';
export declare class Polygon extends Collider {
    type: Collider.Type;
    readonly vertices: vec3[];
    readonly edges: vec3[];
    readonly normal: vec3;
    constructor({ vertices }?: {
        vertices?: vec3[];
    });
}
