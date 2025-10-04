import { mat4, vec2 } from '@luz/vectors';
import { Component } from '../component';
import { Transform } from '../transform';
export declare class Camera extends Component {
    readonly type: Component.Type;
    readonly timestep: Component.Timestep;
    aspect: number;
    aperture: number;
    readonly clipPlanes: vec2;
    readonly viewMatrix: mat4;
    readonly modelViewMatrix: mat4;
    readonly projectionMatrix: mat4;
    readonly reconstructionMatrix: mat4;
    update(transform: Transform, deltaTime: number): void;
}
