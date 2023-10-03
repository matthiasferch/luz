import { vec2 } from './vec2';
export declare class mat2 extends Float32Array {
    constructor(values?: number[]);
    static readonly identity: mat2;
    get determinant(): number;
    copy(dest?: null | mat2): mat2;
    row(index: number, dest?: null | vec2): vec2;
    column(index: number, dest?: null | vec2): vec2;
    equals(other: mat2, threshold?: number): boolean;
    reset(): mat2;
    transpose(dest?: null | mat2): mat2;
    invert(dest?: null | mat2): mat2;
    multiply(other: mat2, dest?: null | mat2): mat2;
    transform(vector: vec2, dest?: null | vec2): vec2;
    scale(vector: vec2, dest?: null | mat2): mat2;
    rotate(angle: number, dest?: null | mat2): mat2;
    static multiply(m1: mat2, m2: mat2, dest?: null | mat2): mat2;
}
