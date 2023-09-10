import { Component } from './component';
import { Body } from './components/body';
import { Camera } from './components/camera';
import { Light } from './components/light';
import { Model } from './components/model';
import { Transform } from './transform';
export declare class Entity extends Transform {
    readonly components: Record<string, Component>;
    get bodies(): Body[];
    get models(): Model[];
    get cameras(): Camera[];
    get lights(): Light[];
    get fixedTimestep(): Component[];
    get variableTimestep(): Component[];
    update(deltaTime: number): void;
    fixedUpdate(deltaTime: number): void;
    toJSON(): {
        components: Record<string, Component>;
        rotation: import("..").quat;
        translation: import("..").vec3;
    };
    private withType;
    private withTimestep;
}
