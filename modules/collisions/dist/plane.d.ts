import Collider from './collider';
import Collision from './collision';
import { vec3 } from 'vectors';
export default class Plane extends Collider {
    readonly normal: vec3;
    distance: number;
    constructor({ normal, distance }?: {
        normal?: vec3;
        distance?: number;
    });
    collide(collider: Collider): Collision;
}
