import { vec3 } from 'vectors';
import { RigidBody } from './rigid-body';
export interface Collision {
    normal: vec3;
    distance: number;
    contacts: [vec3, vec3];
    bodies?: [RigidBody, RigidBody];
}
