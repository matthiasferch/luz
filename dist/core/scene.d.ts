import { Collision } from '../physics';
import { vec3 } from '../vectors';
import { Entity } from './entity';
export declare class Scene {
    readonly gravity: vec3;
    readonly entities: Record<string, Entity>;
    readonly collisions: Required<Collision>[];
    private collisionDispatcher;
    private elapsedTime;
    private readonly timestep;
    constructor();
    update(deltaTime: number): void;
    private updatePhysics;
    private applyGravity;
    private detectCollisions;
    private resolveCollisions;
    private collide;
    toJSON(): {
        gravity: vec3;
        entities: Record<string, Entity>;
    };
}
