import { Transform } from '@luz/core';
import { vec3 } from '@luz/vectors';
import { Collider } from '../collider';
import { Volume } from '../volume';
export declare class Spheroid extends Volume {
    readonly type: Collider.Type;
    readonly equatorialRadius: number;
    readonly polarRadius: number;
    readonly axes: vec3[];
    constructor({ origin, equatorialRadius, polarRadius }?: {
        origin?: vec3 | undefined;
        equatorialRadius?: number | undefined;
        polarRadius?: number | undefined;
    });
    applyTransform(transform: Transform): void;
    calculateInverseInertia(mass: number, transform: Transform): void;
    effectiveRadius(direction: vec3): number;
}
