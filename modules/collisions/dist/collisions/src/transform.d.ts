import { mat3 } from '../../vectors/src/mat3';
import { mat4 } from '../../vectors/src/mat4';
import { quat } from '../../vectors/src/quat';
import { vec3 } from '../../vectors/src/vec3';
export declare class Transform {
    readonly rotation: quat;
    readonly translation: vec3;
    readonly modelMatrix: mat4;
    readonly rotationMatrix: mat3;
    readonly inverseTransposeMatrix: mat4;
    constructor({ translation, rotation }?: {
        translation?: vec3;
        rotation?: quat;
    });
    update(): void;
    static readonly origin: Transform;
}
