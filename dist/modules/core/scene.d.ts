import { Collider } from '@luz/physics';
import { Serializable } from '@luz/utilities';
import { vec3 } from '@luz/vectors';
import { Entity } from './entity';
import { CollisionManifold } from '@luz/physics/collision';
export declare class Scene extends Serializable {
    readonly gravity: vec3;
    readonly friction: number;
    readonly restitution: number;
    readonly linearDamping: number;
    readonly angularDamping: number;
    readonly entities: Record<string, Entity>;
    readonly colliders: Record<string, Collider>;
    readonly collisionManifolds: CollisionManifold[];
    private collisionDispatcher;
    private elapsedTime;
    constructor();
    static deserialize(data: Partial<Scene>): Promise<Scene>;
    update(deltaTime: number): void;
    private solveCollisions;
    private applyGravity;
    private applyDamping;
    private detectCollisions;
    private orientNormalForPair;
    private resolveVelocities;
    private resolvePositions;
    private updateBipedGroundState;
}
