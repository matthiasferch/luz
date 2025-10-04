import { Serializable } from '../utilities';
export declare abstract class Collider extends Serializable {
    abstract readonly type: Collider.Type;
}
export declare namespace Collider {
    type Type = 'Ray' | 'Plane' | 'Polygon' | 'Sphere' | 'Cuboid';
}
