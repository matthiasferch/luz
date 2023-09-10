export declare abstract class Collider {
    abstract readonly type: Collider.Type;
}
export declare module Collider {
    enum Type {
        Ray = "ray",
        Plane = "plane",
        Sphere = "sphere",
        Cuboid = "cuboid"
    }
}
