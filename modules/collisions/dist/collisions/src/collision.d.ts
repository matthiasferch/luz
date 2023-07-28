import { vec3 } from '../../vectors/src/vec3';
import { RigidBody } from './rigid-body';
export interface Collision {
    normal: vec3;
    contact: vec3;
    distance: number;
    bodies?: RigidBody[];
}
