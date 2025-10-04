import { Transform } from '@luz/core';
import { vec3 } from '@luz/vectors';
import { Collider } from '../collider';
import { Volume } from '../volume';
export declare class Sphere extends Volume {
    readonly type: Collider.Type;
    readonly radius: number;
    constructor({ origin, radius }?: {
        origin?: vec3 | undefined;
        radius?: number | undefined;
    });
    applyTransform(transform: Transform): void;
    calculateInverseInertia(mass: number, transform: Transform): void;
}
