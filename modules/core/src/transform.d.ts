import { Serializable } from '@luz/utilities';
import { mat3, mat4, quat, vec3 } from '@luz/vectors';
export interface SerializedTransform {
    rotation: number[];
    translation: number[];
}
export declare class Transform extends Serializable {
    readonly rotation: quat;
    readonly translation: vec3;
    readonly direction: vec3;
    readonly modelMatrix: mat4;
    readonly rotationMatrix: mat3;
    readonly inverseTransposeMatrix: mat4;
    static readonly origin: Readonly<Transform>;
    constructor({ translation, rotation }?: {
        translation?: Readonly<vec3>;
        rotation?: quat;
    });
    update(deltaTime: number): void;
}
