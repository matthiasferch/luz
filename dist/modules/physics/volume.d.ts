import { Transform } from '@luz/core';
import { mat3, vec3 } from '@luz/vectors';
import { Collider } from './collider';
export declare abstract class Volume extends Collider {
    protected readonly origin: vec3;
    readonly center: vec3;
    readonly inverseInertia: mat3;
    constructor({ origin }?: {
        origin?: vec3 | undefined;
    });
    serialize(): {
        origin: number[];
    };
    abstract applyTransform(transform: Transform): void;
    abstract calculateInverseInertia(mass: number, transform: Transform): void;
}
