import { mat4, vec3 } from '../../vectors';
import { Component } from '../component';
import { Transform } from '../transform';
import { Camera } from './camera';
export declare class Light extends Camera {
    readonly type = Component.Type.Light;
    radius: number;
    falloff: number;
    intensity: number;
    readonly color: vec3;
    readonly translation: vec3;
    readonly direction: vec3;
    readonly textureMatrix: mat4;
    private readonly biasMatrix;
    constructor();
    update(transform: Transform, deltaTime: number): void;
    toJSON(): {
        radius: number;
        falloff: number;
        intensity: number;
        aspect: number;
        aperture: number;
        clipPlanes: import("../../vectors").vec2;
        type: Component.Type;
    };
}
