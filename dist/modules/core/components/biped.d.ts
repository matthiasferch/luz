import { Body } from './body';
import { Transform } from '../transform';
import { Component } from '../component';
export declare class Biped extends Body {
    readonly type: Component.Type;
    onGround: boolean;
    update(transform: Transform, deltaTime: number): void;
}
