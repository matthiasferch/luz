import { Transform } from '@luz/core';
import { vec3 } from '@luz/vectors';
import { Collider } from '../collider';
import { Volume } from '../volume';
export declare class Cuboid extends Volume {
    readonly type: Collider.Type;
    readonly extents: vec3;
    readonly axes: vec3[];
    constructor({ origin, extents }?: {
        origin?: vec3 | undefined;
        extents?: vec3 | undefined;
    });
    applyTransform(transform: Transform): void;
    calculateInverseInertia(mass: number, transform: Transform): void;
    getVertices(): vec3[];
    getEdges(): [number, number][];
}
