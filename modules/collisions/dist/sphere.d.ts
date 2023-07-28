import Collider from './collider';
import Collision from './collision';
import { vec3 } from 'vectors';
export default class Sphere extends Collider {
    readonly center: vec3;
    radius: number;
    constructor({ center, radius }: {
        center?: vec3;
        radius?: number;
    });
    collide(collider: Collider): Collision;
}
