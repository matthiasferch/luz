import { Volume } from '@luz/physics';
import { vec3 } from '@luz/vectors';
import { Component } from '../component';
import { Transform } from '../transform';
export declare class Body extends Component {
    readonly type: Component.Type;
    readonly timestep: Component.Timestep;
    mass: number;
    volume: Volume;
    readonly force: vec3;
    readonly torque: vec3;
    readonly linearVelocity: vec3;
    readonly angularVelocity: vec3;
    readonly angularCorrection: vec3;
    private lastTransform;
    constructor({ mass }?: {
        mass?: number | undefined;
    });
    applyTransform(transform: Transform): void;
    applyPositionCorrection(delta: vec3): void;
    update(transform: Transform, deltaTime: number): void;
    private integrateLinearVelocity;
    private integrateAngularVelocity;
}
