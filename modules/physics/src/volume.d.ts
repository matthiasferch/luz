import { Transform } from '@luz/core';
import { mat3, vec3 } from '@luz/vectors';
import { Collider } from './collider';
export declare abstract class Volume extends Collider {
    readonly origin: Readonly<vec3>;
    readonly center: vec3;
    readonly inertia: mat3;
    constructor({ origin }?: {
        origin?: Readonly<vec3>;
    });
    serialize(): {
        origin: number[];
    };
    abstract transform(transform: Transform): void;
    abstract calculateInertia(mass: number, transform: Transform): void;
}
