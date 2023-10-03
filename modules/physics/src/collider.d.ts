import { Serializable } from "../../utilities";
export declare abstract class Collider extends Serializable {
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
