import { mat4 } from './mat4';
export declare class vec4 extends Float32Array {
    constructor(values?: number[]);
    static readonly zero: vec4;
    static readonly one: vec4;
    static readonly up: vec4;
    static readonly right: vec4;
    static readonly forward: vec4;
    get x(): number;
    set x(x: number);
    get y(): number;
    set y(y: number);
    get z(): number;
    set z(z: number);
    get w(): number;
    set w(w: number);
    get xyzw(): number[];
    set xyzw(xyzw: number[]);
    get r(): number;
    set r(r: number);
    get g(): number;
    set g(g: number);
    get b(): number;
    set b(b: number);
    get a(): number;
    set a(a: number);
    get rgba(): number[];
    set rgba(rgba: number[]);
    get length(): number;
    get squaredLength(): number;
    reset(): vec4;
    copy(dest?: null | vec4): vec4;
    negate(dest?: null | vec4): vec4;
    equals(vector: vec4, threshold?: number): boolean;
    add(vector: vec4, dest?: null | vec4): vec4;
    subtract(vector: vec4, dest?: null | vec4): vec4;
    multiply(vector: vec4, dest?: null | vec4): vec4;
    divide(vector: vec4, dest?: null | vec4): vec4;
    scale(scalar: number, dest?: null | vec4): vec4;
    normalize(dest?: null | vec4): vec4;
    transform(matrix: mat4, dest?: null | vec4): vec4;
    static mix(vector: vec4, vector2: vec4, time: number, dest?: null | vec4): vec4;
    static add(vector: vec4, vector2: vec4, dest?: null | vec4): vec4;
    static subtract(vector: vec4, vector2: vec4, dest?: null | vec4): vec4;
    static multiply(vector: vec4, vector2: vec4, dest?: null | vec4): vec4;
    static divide(vector: vec4, vector2: vec4, dest?: null | vec4): vec4;
    static scale(vector: vec4, scalar: number, dest?: null | vec4): vec4;
    static normalize(vector: vec4, dest?: null | vec4): vec4;
}
