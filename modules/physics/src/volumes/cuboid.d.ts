import { Transform } from '@luz/core';
import { vec3 } from '@luz/vectors';
import { Collider } from '../collider';
import { Volume } from '../volume';
export declare class Cuboid extends Volume {
    readonly type = Collider.Type.Cuboid;
    readonly extents: Readonly<vec3>;
    readonly axes: vec3[];
    constructor({ origin, extents }?: {
        origin?: Readonly<vec3>;
        extents?: Readonly<vec3>;
    });
    transform(transform: Transform): void;
    calculateInertia(mass: number, transform: Transform): void;
}
