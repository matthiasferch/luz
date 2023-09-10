import { Transform } from '../core';
import { mat3, vec3 } from '../vectors';
import { Collider } from './collider';
export declare abstract class Volume extends Collider {
    readonly center: vec3;
    readonly inertia: mat3;
    protected readonly origin: vec3;
    constructor({ origin }?: {
        origin?: Readonly<vec3>;
    });
    toJSON(): {
        origin: vec3;
    };
    abstract transform(transform: Transform): void;
    abstract calculateInertia(mass: number, transform: Transform): void;
}
