import { Collision } from '@luz/physics';
import { Serializable } from '@luz/utilities';
import { vec3 } from '@luz/vectors';
import { Entity } from './entity';
export declare class Scene extends Serializable {
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
}
