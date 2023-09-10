import { Transform } from '../../core';
import { vec3 } from '../../vectors';
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
    toJSON(): {
        extents: Readonly<vec3>;
        origin: vec3;
    };
}
