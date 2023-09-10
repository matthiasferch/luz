import { mat3, mat4, vec2 } from '../../vectors';
import { Component } from '../component';
import { Transform } from '../transform';
export declare class Camera extends Component {
    readonly type: Component.Type;
    readonly timestep = Component.Timestep.Variable;
    aspect: number;
    aperture: number;
    readonly clipPlanes: vec2;
    readonly viewMatrix: mat4;
    readonly normalMatrix: mat3;
    readonly modelViewMatrix: mat4;
    readonly projectionMatrix: mat4;
    readonly reconstructionMatrix: mat4;
    update(transform: Transform, deltaTime: number): void;
    toJSON(): {
        aspect: number;
        aperture: number;
        clipPlanes: vec2;
        type: Component.Type;
    };
}
