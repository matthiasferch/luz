import { Transform } from '@luz/core';
import { vec3 } from '@luz/vectors';
import { Collider } from '../collider';
import { Volume } from '../volume';
export declare class Cylinder extends Volume {
    readonly type: Collider.Type;
    readonly radius: number;
    readonly height: number;
    readonly axes: vec3[];
    constructor({ origin, radius, height }?: {
        origin?: vec3 | undefined;
        radius?: number | undefined;
        height?: number | undefined;
    });
    applyTransform(transform: Transform): void;
    calculateInverseInertia(mass: number, transform: Transform): void;
    effectiveRadius(direction: vec3): number;
}
