import { Volume } from '@luz/physics';
import { vec3 } from '@luz/vectors';
import { Component } from '../component';
import { Transform } from '../transform';
export declare class Body extends Component {
    readonly type = Component.Type.Body;
    readonly timestep = Component.Timestep.Fixed;
    mass: number;
    volume: Volume;
    readonly force: vec3;
    readonly torque: vec3;
    readonly linearVelocity: vec3;
    readonly angularVelocity: vec3;
    constructor({ mass }?: {
        mass?: number;
    });
    prepare(transform: Transform): void;
    update(transform: Transform, deltaTime: number): void;
    private integrateLinearVelocity;
    private integrateAngularVelocity;
}
