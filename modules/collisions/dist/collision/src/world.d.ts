export declare class World {
    private bodies;
    private collisions;
    private gravity;
    update(deltaTime: number): void;
    private applyGravity;
    private detectCollisions;
    private resolveCollisions;
    private updateBodies;
}
