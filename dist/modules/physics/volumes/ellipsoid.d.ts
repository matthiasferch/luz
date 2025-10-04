import { Transform } from '@luz/core';
import { vec3 } from '@luz/vectors';
import { Collider } from '../collider';
import { Volume } from '../volume';
export declare class Ellipsoid extends Volume {
    readonly type: Collider.Type;
    readonly radius: vec3;
    readonly axes: vec3[];
    constructor({ origin, radius }?: {
        origin?: vec3 | undefined;
        radius?: vec3 | undefined;
    });
    applyTransform(transform: Transform): void;
    calculateInverseInertia(mass: number, transform: Transform): void;
    effectiveRadius(direction: vec3): number;
}
