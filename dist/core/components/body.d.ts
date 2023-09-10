import { Volume } from '../../physics';
import { vec3 } from '../../vectors';
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
    toJSON(): {
        mass: number;
        volume: Volume;
        force: vec3;
        torque: vec3;
        linearVelocity: vec3;
        angularVelocity: vec3;
        type: Component.Type;
    };
    private integrateLinearVelocity;
    private integrateAngularVelocity;
}
