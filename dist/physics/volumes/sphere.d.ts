import { Transform } from '../../core';
import { vec3 } from '../../vectors';
import { Collider } from '../collider';
import { Volume } from '../volume';
export declare class Sphere extends Volume {
    readonly type = Collider.Type.Sphere;
    readonly radius: number;
    constructor({ origin, radius }: {
        origin?: Readonly<vec3>;
        radius?: number;
    });
    transform(transform: Transform): void;
    calculateInertia(mass: number, transform: Transform): void;
    toJSON(): {
        radius: number;
        origin: vec3;
    };
}
