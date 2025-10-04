import { Transform } from './transform';
import { Component } from './component';
export declare class Entity extends Transform {
    readonly components: Record<string, Component>;
    static deserialize(data: Partial<Entity>): Promise<Entity>;
    update(deltaTime: number): void;
    fixedUpdate(deltaTime: number): void;
}
