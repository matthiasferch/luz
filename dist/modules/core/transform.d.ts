import { Serializable } from '@luz/utilities';
import { mat3, mat4, quat, vec3 } from '@luz/vectors';
export declare class Transform extends Serializable {
    readonly scale: vec3;
    readonly rotation: quat;
    readonly translation: vec3;
    readonly direction: vec3;
    readonly modelMatrix: mat4;
    readonly normalMatrix: mat3;
    readonly rotationMatrix: mat3;
    static readonly origin: Transform;
    constructor({ translation, rotation, scale }?: {
        translation?: vec3 | undefined;
        rotation?: quat | undefined;
        scale?: vec3 | undefined;
    });
    update(deltaTime: number): void;
}
