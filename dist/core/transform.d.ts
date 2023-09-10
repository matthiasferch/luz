import { mat3, mat4, quat, vec3 } from '../vectors';
export declare class Transform {
    readonly rotation: quat;
    readonly translation: vec3;
    readonly direction: vec3;
    readonly modelMatrix: mat4;
    readonly rotationMatrix: mat3;
    readonly inverseTransposeMatrix: mat4;
    static readonly origin: Transform;
    constructor({ translation, rotation }?: {
        translation?: Readonly<vec3>;
        rotation?: quat;
    });
    update(deltaTime: number): void;
    toJSON(): {
        rotation: quat;
        translation: vec3;
    };
}
