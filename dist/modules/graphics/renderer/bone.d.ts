import { Serializable } from '@luz/utilities';
import { vec3, mat4 } from '@luz/vectors';
import { Animation } from './animation';
export declare class Bone extends Serializable {
    readonly name: string;
    readonly parent: string;
    readonly head: vec3;
    readonly tail: vec3;
    readonly bindMatrix: mat4;
    parentBone: Bone | null;
    readonly childBones: Bone[];
    readonly poseMatrix: mat4;
    readonly localMatrix: mat4;
    readonly inverseBindMatrix: mat4;
    constructor({ name, parent, head, tail, bindMatrix }?: Partial<Bone>);
    update(deltaTime: number, animations: Animation[]): void;
    private transform;
    private interpolateKeyframes;
    private blendTransforms;
}
