import { mat4 } from './mat4';
import { quat } from './quat';
import { vec3 } from './vec3';
export declare class mat3 extends Float32Array {
    constructor(values?: number[]);
    static readonly identity: mat3;
    get determinant(): number;
    copy(dest?: null | mat3): mat3;
    row(index: number, dest?: null | vec3): vec3;
    column(index: number, dest?: null | vec3): vec3;
    equals(other: mat3, threshold?: number): boolean;
    reset(): mat3;
    transpose(dest?: null | mat3): mat3;
    invert(dest?: null | mat3): mat3;
    multiply(other: mat3, dest?: null | mat3): mat3;
    transform(vector: vec3, dest?: null | vec3): vec3;
    rotate(angle: number, axis: vec3, dest?: null | mat3): null | mat3;
    toMat4(dest?: null | mat4): mat4;
    toQuat(dest?: null | quat): quat;
    static transform(matrix: mat3, vector: vec3, dest?: null | vec3): vec3;
    static multiply(m1: mat3, m2: mat3, dest?: null | mat3): mat3;
    static lookAt(eye: vec3, target: vec3, up?: vec3, dest?: null | mat3): mat3;
}
